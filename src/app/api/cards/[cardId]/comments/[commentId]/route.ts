import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, isOwnerRole, requireUserId } from "@/lib/project-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  _request: Request,
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
                  select: { projectId: true }
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

    const canDelete = isOwnerRole(membership.role) || comment.authorId === userId;
    if (!canDelete) {
      return jsonError("You are not authorized to delete this comment.", 403);
    }

    await prisma.cardComment.delete({
      where: { id: params.commentId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
