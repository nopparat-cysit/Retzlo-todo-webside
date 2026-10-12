import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertProjectMember, getProjectIdForBoard, requireUserId } from "@/lib/project-auth";
import { prisma } from "@/lib/prisma";
import { serializeCard } from "@/lib/kanban/serialize-card";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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

    const archivedCards = await prisma.card.findMany({
      where: {
        column: { boardId: params.boardId },
        isArchived: true
      },
      orderBy: { archivedAt: "desc" },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json({
      cards: archivedCards.map((c) => ({
        ...serializeCard(c),
        columnName: c.column.name,
        columnColor: c.column.color
      }))
    });
  } catch (error) {
    return parseError(error);
  }
}
