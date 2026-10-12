import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertProjectMember, getProjectIdForBoard, requireUserId } from "@/lib/project-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const projectId = await getProjectIdForBoard(params.boardId);
    if (!projectId) {
      return jsonError("Board not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);
    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "40", 10)));

    const activities = await prisma.boardActivity.findMany({
      where: { boardId: params.boardId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      activities: activities.map((act) => ({
        id: act.id,
        boardId: act.boardId,
        userId: act.userId,
        cardId: act.cardId,
        action: act.action,
        details: act.details,
        createdAt: act.createdAt.toISOString(),
        user: act.user
      }))
    });
  } catch (error) {
    return parseError(error);
  }
}
