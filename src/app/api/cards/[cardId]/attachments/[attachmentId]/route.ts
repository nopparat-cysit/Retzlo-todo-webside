import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertProjectMember, getProjectIdForCard, requireUserId } from "@/lib/project-auth";
import { prisma } from "@/lib/prisma";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { logBoardActivity } from "@/lib/kanban/activity-logger";

export async function DELETE(
  _request: Request,
  { params }: { params: { cardId: string; attachmentId: string } }
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

    const attachment = await prisma.cardAttachment.findUnique({
      where: { id: params.attachmentId }
    });

    if (!attachment || attachment.cardId !== params.cardId) {
      return jsonError("Attachment not found.", 404);
    }

    await prisma.cardAttachment.delete({
      where: { id: params.attachmentId }
    });

    await logBoardActivity({
      boardId,
      userId,
      cardId: card.id,
      action: "ATTACHMENT_REMOVED",
      details: {
        cardTitle: card.title,
        attachmentName: attachment.name
      }
    });

    await triggerPusherEvent(
      [`retzlo-project-${projectId}`, `retzlo-board-${boardId}`, `retzlo-card-${card.id}`],
      "retzlo:sync",
      {
        action: "ATTACHMENT_REMOVED",
        cardId: card.id,
        attachmentId: params.attachmentId,
        boardId,
        senderId: userId
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
