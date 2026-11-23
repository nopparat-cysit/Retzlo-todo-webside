import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canAccessBoard, isOwnerRole, requireUserId } from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { deleteFromR2, extractR2Key } from "@/lib/r2";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  request: Request,
  { params }: { params: { cardId: string; commentId: string } }
) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const comment = await prisma.cardComment.findUnique({
      where: { id: params.commentId },
      include: {
        card: {
          include: {
            column: {
              include: {
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
        }
      }
    });

    if (!comment || comment.cardId !== params.cardId) {
      return jsonError("Comment not found.", 404);
    }

    const projectId = comment.card.column.board.projectId;
    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    if (!canAccessBoard(comment.card.column.board, userId, membership.role)) {
      return jsonError("You do not have access to this private board.", 403);
    }

    const canDelete = isOwnerRole(membership.role) || comment.authorId === userId;
    if (!canDelete) {
      return jsonError("You are not authorized to delete this comment.", 403);
    }

    if (comment.metadata && typeof comment.metadata === "object") {
      const meta = comment.metadata as { attachments?: Array<{ url: string }> };
      if (Array.isArray(meta.attachments)) {
        for (const att of meta.attachments) {
          if (att && att.url) {
            const key = extractR2Key(att.url);
            if (key && key.startsWith(`projects/${projectId}/`)) {
              await deleteFromR2(key);
            }
          }
        }
      }
    }

    await prisma.cardComment.delete({
      where: { id: params.commentId }
    });

    await triggerPusherEvent(
      [`retzlo-card-${params.cardId}-comments`, `retzlo-project-${projectId}`],
      "retzlo:sync",
      { action: "COMMENT_DELETED", cardId: params.cardId, commentId: params.commentId, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/cards/${params.cardId}/comments/${params.commentId}`,
      requestMethod: "DELETE",
      category: "CARD",
      action: "CARD_COMMENT_REMOVED",
      severity: "WARNING",
      status: "SUCCESS",
      targetType: "CARD_COMMENT",
      targetId: params.commentId,
      targetName: comment.card.title,
      summary: `Removed comment from card "${comment.card.title}"`,
      metadata: { cardId: params.cardId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
