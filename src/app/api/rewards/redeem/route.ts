import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

const redeemRewardSchema = z.object({
  rewardId: z.string().uuid(),
});

const moderateRedemptionSchema = z.object({
  redemptionId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().trim().max(500).nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      // Assert membership
      const membership = await assertProjectMember(projectId, userId);
      if (!membership) {
        return jsonError("You do not have access to this project.", 403);
      }

      // If OWNER or ADMIN, fetch all redemptions in the project, otherwise only active user's redemptions
      const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);

      const redemptions = await prisma.redemption.findMany({
        where: {
          projectId,
          ...(isAdmin ? {} : { userId }),
        },
        include: {
          reward: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ redemptions });
    } else {
      // Fetch user's global redemptions
      const redemptions = await prisma.redemption.findMany({
        where: { projectId: null, userId },
        include: {
          reward: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ redemptions });
    }
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = redeemRewardSchema.parse(await request.json());
    const reward = await prisma.reward.findUnique({
      where: { id: payload.rewardId },
    });

    if (!reward) {
      return jsonError("Reward not found.", 404);
    }

    // Check quantity availability
    if (reward.hasQuantity && reward.quantity !== null && reward.quantity < 1) {
      return jsonError("This reward is currently out of stock.", 400);
    }

    // Resolve user's identity details for notification messages
    const activeUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const displayName = activeUser?.name || activeUser?.email || "Someone";

    if (reward.projectId) {
      // Team Project Coin redemption
      const projectId = reward.projectId;
      const membership = await assertProjectMember(projectId, userId);
      if (!membership) {
        return jsonError("You do not have access to this project.", 403);
      }

      if (membership.coins < reward.price) {
        return jsonError(`Insufficient balance. You need ${reward.price} coins.`, 400);
      }

      const redemption = await prisma.$transaction(async (tx) => {
        // 1. Deduct project coins from member
        await tx.projectMember.update({
          where: { userId_projectId: { userId, projectId } },
          data: { coins: { decrement: reward.price } },
        });

        // 2. Decrement stock if applicable
        if (reward.hasQuantity) {
          await tx.reward.update({
            where: { id: reward.id },
            data: { quantity: { decrement: 1 } },
          });
        }

        // 3. Create redemption queue record (PENDING for project rewards)
        const record = await tx.redemption.create({
          data: {
            userId,
            rewardId: reward.id,
            projectId,
            cost: reward.price,
            quantity: 1,
            status: "PENDING",
          },
          include: {
            reward: true,
          },
        });

        // 4. Alert project owners/admins
        const admins = await tx.projectMember.findMany({
          where: {
            projectId,
            role: { in: ["OWNER", "ADMIN"] },
          },
          select: { userId: true },
        });

        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.userId,
              projectId,
              type: "REDEMPTION_PENDING",
              title: "Pending Reward Redemption",
              message: `${displayName} requested to redeem "${reward.name}" for ${reward.price} coins.`,
              isRead: false,
            },
          });
        }

        return record;
      });

      return NextResponse.json({ redemption });
    } else {
      // Global user coin redemption (AUTO-APPROVED)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { globalCoins: true },
      });

      if (!user || user.globalCoins < reward.price) {
        return jsonError(`Insufficient balance. You need ${reward.price} global coins.`, 400);
      }

      const redemption = await prisma.$transaction(async (tx) => {
        // 1. Deduct global coins
        await tx.user.update({
          where: { id: userId },
          data: { globalCoins: { decrement: reward.price } },
        });

        // 2. Decrement stock if applicable
        if (reward.hasQuantity) {
          await tx.reward.update({
            where: { id: reward.id },
            data: { quantity: { decrement: 1 } },
          });
        }

        // 3. Create auto-approved redemption log
        const record = await tx.redemption.create({
          data: {
            userId,
            rewardId: reward.id,
            projectId: null,
            cost: reward.price,
            quantity: 1,
            status: "APPROVED",
          },
          include: {
            reward: true,
          },
        });

        // 4. Create personal notification receipt
        await tx.notification.create({
          data: {
            userId,
            projectId: null,
            type: "REDEMPTION_STATUS",
            title: "Global Reward Redeemed",
            message: `You successfully redeemed "${reward.name}" for ${reward.price} global coins!`,
            isRead: false,
          },
        });

        return record;
      });

      return NextResponse.json({ redemption });
    }
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = moderateRedemptionSchema.parse(await request.json());
    const redemption = await prisma.redemption.findUnique({
      where: { id: payload.redemptionId },
      include: {
        reward: true,
      },
    });

    if (!redemption) {
      return jsonError("Redemption record not found.", 404);
    }

    if (redemption.status !== "PENDING") {
      return jsonError("This redemption has already been processed.", 400);
    }

    if (!redemption.projectId) {
      return jsonError("Global redemptions do not require moderation.", 400);
    }

    const projectId = redemption.projectId;
    // Check permission of moderator
    const membership = await assertProjectMember(projectId, userId);
    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    if (!["OWNER", "ADMIN"].includes(membership.role)) {
      return jsonError("Only project owners and admins can approve or reject redemptions.", 403);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });
    const projectName = project?.name || "Project";

    const updatedRedemption = await prisma.$transaction(async (tx) => {
      if (payload.status === "APPROVED") {
        // Approve: update status only
        const record = await tx.redemption.update({
          where: { id: redemption.id },
          data: { status: "APPROVED" },
          include: { reward: true },
        });

        // Notify claimant user
        await tx.notification.create({
          data: {
            userId: redemption.userId,
            projectId,
            type: "REDEMPTION_STATUS",
            title: "Redemption Approved! 🎉",
            message: `Your request for "${redemption.reward.name}" in "${projectName}" has been approved!`,
            isRead: false,
          },
        });

        return record;
      } else {
        // Reject: refund coins, increment stock if limited, update status
        const reason = payload.rejectionReason || "No explanation provided.";

        const record = await tx.redemption.update({
          where: { id: redemption.id },
          data: {
            status: "REJECTED",
            rejectionReason: reason,
          },
          include: { reward: true },
        });

        // Refund project member coins
        await tx.projectMember.update({
          where: { userId_projectId: { userId: redemption.userId, projectId } },
          data: { coins: { increment: redemption.cost } },
        });

        // Refund reward stock
        if (redemption.reward.hasQuantity) {
          await tx.reward.update({
            where: { id: redemption.reward.id },
            data: { quantity: { increment: 1 } },
          });
        }

        // Notify claimant user
        await tx.notification.create({
          data: {
            userId: redemption.userId,
            projectId,
            type: "REDEMPTION_STATUS",
            title: "Redemption Rejected ❌",
            message: `Your request for "${redemption.reward.name}" in "${projectName}" was rejected. Reason: ${reason}`,
            isRead: false,
          },
        });

        return record;
      }
    });

    return NextResponse.json({ redemption: updatedRedemption });
  } catch (error) {
    return parseError(error);
  }
}
