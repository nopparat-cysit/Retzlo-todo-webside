import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertProjectMember, canAccessBoard, requireUserId } from "@/lib/project-auth";
import { prisma } from "@/lib/prisma";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { logBoardActivity } from "@/lib/kanban/activity-logger";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

export async function DELETE(
  request: Request,
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
            board: {
              select: {
                id: true,
                projectId: true,
                isPrivate: true,
                members: { select: { userId: true } }
              }
            }
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

    if (!canAccessBoard(card.column.board, userId, membership.role)) {
      return jsonError("You do not have access to this private board.", 403);
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

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/cards/${params.cardId}/attachments/${params.attachmentId}`,
      requestMethod: "DELETE",
      category: "CARD",
      action: "CARD_ATTACHMENT_REMOVED",
      severity: "WARNING",
      status: "SUCCESS",
      targetType: "CARD_ATTACHMENT",
      targetId: params.attachmentId,
      targetName: attachment.name,
      summary: `Removed attachment "${attachment.name}" from card "${card.title}"`,
      metadata: { cardId: card.id, attachmentName: attachment.name }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
