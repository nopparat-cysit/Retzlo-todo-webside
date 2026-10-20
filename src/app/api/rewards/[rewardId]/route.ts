import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { createAuditLog } from "@/lib/audit/audit-logger";

export const dynamic = "force-dynamic";

const updateRewardSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  price: z.number().int().positive().optional(),
  hasQuantity: z.boolean().optional(),
  quantity: z.number().int().nonnegative().nullable().optional(),
  duration: z.string().trim().max(120).nullable().optional(),
  image: z.string().trim().nullable().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { rewardId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const reward = await prisma.reward.findUnique({
      where: { id: params.rewardId }
    });

    if (!reward) {
      return jsonError("Reward not found.", 404);
    }

    if (reward.projectId) {
      const membership = await assertProjectMember(reward.projectId, userId);
      if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return jsonError("You do not have permission to edit rewards in this project.", 403);
      }
    } else if (reward.creatorId !== userId) {
      return jsonError("You do not have permission to edit this reward.", 403);
    }

    const payload = updateRewardSchema.parse(await request.json());

    const updated = await prisma.reward.update({
      where: { id: params.rewardId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.hasQuantity !== undefined ? { hasQuantity: payload.hasQuantity } : {}),
        ...(payload.quantity !== undefined ? { quantity: payload.hasQuantity ? payload.quantity : null } : {}),
        ...(payload.duration !== undefined ? { duration: payload.duration } : {}),
        ...(payload.image !== undefined ? { image: payload.image } : {})
      }
    });

    void createAuditLog({
      action: "UPDATE",
      category: "REWARDS",
      targetId: params.rewardId,
      targetType: "REWARD",
      actorId: userId,
      summary: `Updated reward "${updated.name}"`,
      metadata: { projectId: reward.projectId ?? undefined }
    });

    return NextResponse.json({ reward: updated });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { rewardId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const reward = await prisma.reward.findUnique({
      where: { id: params.rewardId }
    });

    if (!reward) {
      return jsonError("Reward not found.", 404);
    }

    if (reward.projectId) {
      const membership = await assertProjectMember(reward.projectId, userId);
      if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return jsonError("You do not have permission to delete rewards in this project.", 403);
      }
    } else if (reward.creatorId !== userId) {
      return jsonError("You do not have permission to delete this reward.", 403);
    }

    await prisma.reward.delete({
      where: { id: params.rewardId }
    });

    void createAuditLog({
      action: "DELETE",
      category: "REWARDS",
      targetId: params.rewardId,
      targetType: "REWARD",
      actorId: userId,
      summary: `Deleted reward "${reward.name}"`,
      metadata: { projectId: reward.projectId ?? undefined }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
