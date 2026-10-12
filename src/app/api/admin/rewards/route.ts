import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/admin-system-state";

export const dynamic = "force-dynamic";

const patchRedemptionSchema = z.object({
  redemptionId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional()
});

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";

    const whereClause: Record<string, unknown> = {};
    if (status !== "ALL") {
      whereClause.status = status;
    }

    const redemptions = await prisma.redemption.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        reward: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const pendingCount = await prisma.redemption.count({ where: { status: "PENDING" } });

    return NextResponse.json({
      redemptions,
      pendingCount
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const payload = patchRedemptionSchema.parse(await request.json());

    const redemption = await prisma.redemption.findUnique({
      where: { id: payload.redemptionId },
      include: { reward: true, user: true }
    });

    if (!redemption) {
      return jsonError("Redemption request not found.", 404);
    }

    if (payload.status === "REJECTED") {
      // Refund coins to user
      await prisma.$transaction([
        prisma.redemption.update({
          where: { id: payload.redemptionId },
          data: {
            status: "REJECTED",
            rejectionReason: payload.rejectionReason || "Declined by Administrator"
          }
        }),
        // If it was a project reward, refund project coins, otherwise global coins
        redemption.projectId
          ? prisma.projectMember.updateMany({
              where: {
                userId: redemption.userId,
                projectId: redemption.projectId
              },
              data: { coins: { increment: redemption.cost } }
            })
          : prisma.user.update({
              where: { id: redemption.userId },
              data: { globalCoins: { increment: redemption.cost } }
            })
      ]);
    } else {
      await prisma.redemption.update({
        where: { id: payload.redemptionId },
        data: {
          status: "APPROVED"
        }
      });
    }

    recordAdminAudit({
      adminEmail: admin.email,
      action: payload.status === "APPROVED" ? "APPROVE_REDEMPTION" : "REJECT_REDEMPTION",
      targetType: "REWARD",
      targetId: redemption.id,
      targetName: redemption.reward.name,
      details: {
        userId: redemption.userId,
        cost: redemption.cost,
        reason: payload.rejectionReason
      }
    });

    return NextResponse.json({
      ok: true,
      status: payload.status,
      message: `Redemption for "${redemption.reward.name}" was ${payload.status.toLowerCase()}.`
    });
  } catch (error) {
    return parseError(error);
  }
}
