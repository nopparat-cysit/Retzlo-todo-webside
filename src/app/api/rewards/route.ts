import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

const createRewardSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  price: z.number().int().positive(),
  hasQuantity: z.boolean().default(false),
  quantity: z.number().int().nonnegative().nullable().optional(),
  duration: z.string().trim().max(120).nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  image: z.string().trim().nullable().optional(),
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
      // Fetch project rewards
      const membership = await assertProjectMember(projectId, userId);
      if (!membership) {
        return jsonError("You do not have access to this project.", 403);
      }

      const rewards = await prisma.reward.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ rewards });
    } else {
      // Fetch global rewards created by user
      const rewards = await prisma.reward.findMany({
        where: { projectId: null, creatorId: userId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ rewards });
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

    const payload = createRewardSchema.parse(await request.json());

    if (payload.projectId) {
      // Check project membership and roles
      const membership = await assertProjectMember(payload.projectId, userId);
      if (!membership) {
        return jsonError("You do not have access to this project.", 403);
      }

      if (!["OWNER", "ADMIN"].includes(membership.role)) {
        return jsonError("You do not have permission to manage rewards in this project.", 403);
      }
    }

    const reward = await prisma.reward.create({
      data: {
        name: payload.name,
        description: payload.description || null,
        price: payload.price,
        hasQuantity: payload.hasQuantity,
        quantity: payload.hasQuantity ? (payload.quantity ?? 0) : null,
        duration: payload.duration || null,
        projectId: payload.projectId || null,
        creatorId: userId,
        image: payload.image || null,
      },
    });

    return NextResponse.json({ reward }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
