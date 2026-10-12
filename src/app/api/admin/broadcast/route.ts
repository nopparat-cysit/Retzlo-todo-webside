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

    if (body.clear === true) {
      clearSystemBroadcast();
      recordAdminAudit({
        adminEmail: admin.email,
        action: "CLEAR_BROADCAST",
        targetType: "BROADCAST"
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

    return NextResponse.json({ ok: true, broadcast: record });
  } catch (error) {
    return parseError(error);
  }
}
