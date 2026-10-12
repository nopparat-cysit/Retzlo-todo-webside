import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { getAdminAuditLogs, getDecoyTelemetry } from "@/lib/admin-system-state";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const auditLogs = getAdminAuditLogs(50);
    const decoyTelemetry = getDecoyTelemetry();

    // Get recent password reset attempts
    const recentOtps = await prisma.passwordResetOtp.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        attempts: true,
        usedAt: true,
        expiresAt: true,
        createdAt: true
      }
    });

    // Get list of active admins
    const admins = await prisma.user.findMany({
      where: { globalRole: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      auditLogs,
      decoyTelemetry,
      recentOtps,
      admins
    });
  } catch (error) {
    return parseError(error);
  }
}
