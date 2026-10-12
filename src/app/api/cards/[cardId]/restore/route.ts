import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { prisma } from "@/lib/prisma";
import { serializeCard } from "@/lib/kanban/serialize-card";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { logBoardActivity } from "@/lib/kanban/activity-logger";

export async function POST(
  _request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const card = await prisma.card.findUnique({
      where: { id: params.cardId },
      include: {
        column: {
          select: {
            id: true,
            name: true,
            boardId: true,
            board: { select: { id: true, projectId: true } }
          }
        }
      }
    });

    if (!card) {
      return jsonError("Card not found.", 404);
    }

    const projectId = card.column.board.projectId;
    const boardId = card.column.board.id;

    const membership = await assertProjectMember(projectId, userId);
    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const updatedCard = await prisma.card.update({
      where: { id: params.cardId },
      data: {
        isArchived: false,
        archivedAt: null
      }
    });

    // Record activity log
    await logBoardActivity({
      boardId,
      userId,
      cardId: card.id,
      action: "CARD_RESTORED",
      details: {
        cardTitle: card.title,
        columnId: card.columnId,
        columnName: card.column.name
      }
    });

    // Broadcast live event
    await triggerPusherEvent(
      [`retzlo-project-${projectId}`, `retzlo-board-${boardId}`, `retzlo-card-${card.id}`],
      "retzlo:sync",
      {
        action: "CARD_RESTORED",
        cardId: card.id,
        boardId,
        senderId: userId
      }
    );

    return NextResponse.json({ ok: true, card: serializeCard(updatedCard) });
  } catch (error) {
    return parseError(error);
  }
}
