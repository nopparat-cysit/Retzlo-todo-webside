import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canAccessBoard, requireUserId } from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

const reorderColumnsSchema = z.object({
  boardId: z.string().uuid(),
  columnIds: z.array(z.string().uuid()).min(1)
});

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = reorderColumnsSchema.parse(await request.json());
    const board = await prisma.board.findUnique({
      where: { id: payload.boardId },
      select: {
        id: true,
        projectId: true,
        isPrivate: true,
        members: { select: { userId: true } }
      }
    });

    if (!board) {
      return jsonError("Board not found.", 404);
    }

    const projectId = board.projectId;
    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    if (!canAccessBoard(board, userId, membership.role)) {
      return jsonError("You do not have access to this private board.", 403);
    }

    await prisma.$transaction(
      payload.columnIds.map((id, position) =>
        prisma.column.update({
          where: { id, boardId: payload.boardId },
          data: { position }
        })
      )
    );

    await triggerPusherEvent(
      [`retzlo-board-${payload.boardId}`, `retzlo-project-${projectId}`],
      "retzlo:sync",
      { action: "COLUMN_REORDER", boardId: payload.boardId, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: "/api/columns/reorder",
      requestMethod: "PATCH",
      category: "BOARD",
      action: "COLUMNS_REORDERED",
      severity: "INFO",
      status: "SUCCESS",
      targetType: "BOARD",
      targetId: payload.boardId,
      summary: `Reordered columns in board ${payload.boardId}`,
      metadata: { columnIds: payload.columnIds }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
