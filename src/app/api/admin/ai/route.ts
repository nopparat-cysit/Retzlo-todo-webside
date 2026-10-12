import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { AI_CREDIT_COSTS, AI_TIER_LIMITS, setAdminUserAiQuota } from "@/lib/ai/credits";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/admin-system-state";

export const dynamic = "force-dynamic";

const grantAiSchema = z.object({
  userId: z.string().min(1),
  tier: z.enum(["FREE", "PRO"]).optional(),
  credits: z.number().int().min(0).max(999999)
});

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const totalUsers = await prisma.user.count();

    // Query recent users who have used AI or have zenGarden
    const usersWithAi = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        globalRole: true,
        zenGarden: true
      }
    });

    const formattedUsers = usersWithAi.map((u) => {
      const zen = u.zenGarden && typeof u.zenGarden === "object" ? (u.zenGarden as Record<string, unknown>) : {};
      const aiData = zen.aiQuota && typeof zen.aiQuota === "object" ? (zen.aiQuota as Record<string, unknown>) : {};
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        globalRole: u.globalRole,
        tier: aiData.tier || (u.globalRole === "ADMIN" ? "ADMIN" : "FREE"),
        credits: typeof aiData.credits === "number" ? aiData.credits : (u.globalRole === "ADMIN" ? 999999 : 50),
        lastUsedAt: aiData.lastUsedAt || null
      };
    });

    return NextResponse.json({
      costs: AI_CREDIT_COSTS,
      tierLimits: AI_TIER_LIMITS,
      totalUsers,
      recentAiUsers: formattedUsers
    });
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

    const payload = grantAiSchema.parse(await request.json());

    const targetUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    });

    if (!targetUser) {
      return jsonError("User not found.", 404);
    }

    const updatedQuota = await setAdminUserAiQuota(payload.userId, {
      tier: payload.tier,
      credits: payload.credits
    });

    recordAdminAudit({
      adminEmail: admin.email,
      action: "GRANT_AI_CREDITS",
      targetType: "AI",
      targetId: payload.userId,
      targetName: targetUser.email,
      details: {
        tier: payload.tier,
        creditsGranted: payload.credits
      }
    });

    return NextResponse.json({
      ok: true,
      quota: updatedQuota,
      message: `Updated AI credits for ${targetUser.email} to ${payload.credits} (${updatedQuota.tier} Tier).`
    });
  } catch (error) {
    return parseError(error);
  }
}
