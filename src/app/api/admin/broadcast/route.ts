import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  getSystemBroadcast,
  setSystemBroadcast,
  clearSystemBroadcast,
  recordAdminAudit
} from "@/lib/admin-system-state";
import { createAuditLog } from "@/lib/audit/audit-logger";

export const dynamic = "force-dynamic";

const broadcastSchema = z.object({
  message: z.string().trim().max(300),
  type: z.enum(["info", "warning", "urgent"]),
  active: z.boolean()
});

export async function GET() {
  try {
    const broadcast = getSystemBroadcast();
    return NextResponse.json({ broadcast });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const body = await request.json();

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || null);
    const userAgent = request.headers.get("user-agent") || null;

    if (body.clear === true) {
      clearSystemBroadcast();
      recordAdminAudit({
        adminEmail: admin.email,
        action: "CLEAR_BROADCAST",
        targetType: "BROADCAST"
      });

      void createAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        actorRole: admin.globalRole,
        ipAddress: ip,
        userAgent,
        requestPath: "/api/admin/broadcast",
        requestMethod: "POST",
        category: "SYSTEM",
        action: "SYSTEM_BROADCAST_CLEARED",
        severity: "NOTICE",
        status: "SUCCESS",
        targetType: "BROADCAST",
        summary: `Admin ${admin.email} deactivated and cleared active system broadcast banner`
      });

      return NextResponse.json({ ok: true, broadcast: null });
    }

    const payload = broadcastSchema.parse(body);

    const record = setSystemBroadcast({
      message: payload.message,
      type: payload.type,
      active: payload.active,
      createdBy: admin.name || admin.email
    });

    recordAdminAudit({
      adminEmail: admin.email,
      action: "SET_BROADCAST",
      targetType: "BROADCAST",
      details: {
        message: payload.message,
        type: payload.type,
        active: payload.active
      }
    });

    void createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      actorRole: admin.globalRole,
      ipAddress: ip,
      userAgent,
      requestPath: "/api/admin/broadcast",
      requestMethod: "POST",
      category: "SYSTEM",
      action: "SYSTEM_BROADCAST_PUBLISHED",
      severity: payload.type === "urgent" ? "WARNING" : "NOTICE",
      status: "SUCCESS",
      targetType: "BROADCAST",
      summary: `Admin ${admin.email} published [${payload.type.toUpperCase()}] broadcast: "${payload.message}"`,
      afterState: record as unknown as Record<string, unknown>,
      metadata: {
        message: payload.message,
        type: payload.type,
        active: payload.active
      }
    });

    return NextResponse.json({ ok: true, broadcast: record });
  } catch (error) {
    return parseError(error);
  }
}
