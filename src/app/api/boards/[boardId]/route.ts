import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canAccessBoard, getProjectIdForBoard, isOwnerRole, requireUserId } from "@/lib/project-auth";
import { serializeCard } from "@/lib/kanban/serialize-card";
import { triggerPusherEvent } from "@/lib/pusher/server";

const updateBoardSchema = z.object({
  name: z.string().trim().min(1, "Board name cannot be empty").max(80).optional(),
  isPrivate: z.boolean().optional(),
  memberUserIds: z.array(z.string()).optional()
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, { params }: { params: { boardId: string } }) {
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

  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      members: {
        select: { userId: true }
      },
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  if (!board) {
    return jsonError("Board not found.", 404);
  }

  if (!canAccessBoard(board, userId, membership.role)) {
    return jsonError("You do not have access to this private board.", 403);
  }

  const serializedBoard = {
    ...board,
    columns: board.columns.map((col) => ({
      ...col,
      cards: col.cards.map((card) => serializeCard(card))
    }))
  };

  return NextResponse.json(
    { board: serializedBoard },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0"
      }
    }
  );
}

export async function PATCH(request: Request, { params }: { params: { boardId: string } }) {
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

  const isOwnerOrAdmin = isOwnerRole(membership.role) || membership.role === "ADMIN";

  try {
    const body = await request.json();
    const payload = updateBoardSchema.parse(body);

    if ((payload.isPrivate !== undefined || payload.memberUserIds !== undefined) && !isOwnerOrAdmin) {
      return jsonError("Only project owners and admins can update board privacy or member access.", 403);
    }

    const board = await prisma.board.findUnique({
      where: { id: params.boardId },
      include: { members: { select: { userId: true } } }
    });

    if (!board) {
      return jsonError("Board not found.", 404);
    }

    if (!canAccessBoard(board, userId, membership.role)) {
      return jsonError("You do not have access to this private board.", 403);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dataToUpdate: { name?: string; isPrivate?: boolean } = {};
      if (payload.name !== undefined) dataToUpdate.name = payload.name;
      if (payload.isPrivate !== undefined) dataToUpdate.isPrivate = payload.isPrivate;

      if (payload.memberUserIds !== undefined) {
        // Sync members
        await tx.boardMember.deleteMany({
          where: { boardId: params.boardId }
        });

        if (payload.memberUserIds.length > 0) {
          const uniqueIds = Array.from(new Set(payload.memberUserIds));
          await tx.boardMember.createMany({
            data: uniqueIds.map((uid) => ({
              boardId: params.boardId,
              userId: uid
            }))
          });
        }
      }

      return tx.board.update({
        where: { id: params.boardId },
        data: dataToUpdate,
        include: {
          members: {
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
          }
        }
      });
    });

    triggerPusherEvent(
      [`retzlo-board-${params.boardId}`, `retzlo-project-${projectId}`],
      "retzlo:sync",
      { action: "BOARD_UPDATED", boardId: params.boardId, senderId: userId }
    );

    return NextResponse.json({
      board: {
        id: updated.id,
        name: updated.name,
        projectId: updated.projectId,
        isPrivate: updated.isPrivate,
        createdAt: updated.createdAt.toISOString(),
        memberUserIds: updated.members.map((m) => m.userId),
        members: updated.members.map((m) => ({
          userId: m.userId,
          user: m.user
        }))
      }
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { boardId: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const projectId = await getProjectIdForBoard(params.boardId);

  if (!projectId) {
    return jsonError("Board not found.", 404);
  }

  const membership = await assertProjectMember(projectId, userId);

  if (!membership || !isOwnerRole(membership.role)) {
    return jsonError("Only project owners and admins can delete boards.", 403);
  }

  const totalBoards = await prisma.board.count({
    where: { projectId }
  });

  if (totalBoards <= 1) {
    return jsonError("Cannot delete the only board in this project.", 400);
  }

  await prisma.board.delete({
    where: { id: params.boardId }
  });

  triggerPusherEvent(
    [`retzlo-board-${params.boardId}`, `retzlo-project-${projectId}`],
    "retzlo:sync",
    { action: "BOARD_DELETED", boardId: params.boardId, senderId: userId }
  );

  return NextResponse.json({ success: true });
}
