import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { columnSettingsSchema } from "@/lib/kanban/column-settings";
import { serializeCard } from "@/lib/kanban/serialize-card";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canAccessBoard, requireUserId } from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

const columnIdSchema = z.string().uuid();

async function getEditableColumn(columnId: string, userId: string) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: {
        select: {
          id: true,
          projectId: true,
          isPrivate: true,
          members: { select: { userId: true } }
        }
      },
      _count: { select: { cards: true } }
    }
  });

  if (!column) {
    return { error: jsonError("Column not found.", 404), column: null };
  }

  const membership = await assertProjectMember(column.board.projectId, userId);
  if (!membership) {
    return { error: jsonError("You do not have access to this project.", 403), column: null };
  }

  if (!canAccessBoard(column.board, userId, membership.role)) {
    return { error: jsonError("You do not have access to this private board.", 403), column: null };
  }

  return { error: null, column };
}

export async function PATCH(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const columnId = columnIdSchema.parse(params.columnId);
    const payload = columnSettingsSchema.parse(await request.json());
    const { error, column } = await getEditableColumn(columnId, userId);

    if (error || !column) {
      return error;
    }

    const updatedColumn = await prisma.column.update({
      where: { id: column.id },
      data: {
        name: payload.name,
        color: payload.color,
        icon: payload.icon,
        defaultCardStatus: payload.defaultCardStatus,
        ...(payload.wipLimit !== undefined && { wipLimit: payload.wipLimit })
      },
      include: {
        cards: {
          orderBy: { position: "asc" }
        }
      }
    });

    await triggerPusherEvent(
      [`retzlo-board-${column.board.id}`, `retzlo-project-${column.board.projectId}`],
      "retzlo:sync",
      { action: "COLUMN_UPDATED", boardId: column.board.id, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/columns/${column.id}`,
      requestMethod: "PATCH",
      category: "BOARD",
      action: "COLUMN_UPDATED",
      severity: "INFO",
      status: "SUCCESS",
      targetType: "COLUMN",
      targetId: updatedColumn.id,
      targetName: updatedColumn.name,
      summary: `Updated column "${updatedColumn.name}"`,
      beforeState: { id: column.id, name: column.name, color: column.color, wipLimit: column.wipLimit },
      afterState: { id: updatedColumn.id, name: updatedColumn.name, color: updatedColumn.color, wipLimit: updatedColumn.wipLimit }
    });

    return NextResponse.json({
      column: {
        ...updatedColumn,
        cards: updatedColumn.cards.map((c) => serializeCard(c))
      }
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const columnId = columnIdSchema.parse(params.columnId);
    const { error, column } = await getEditableColumn(columnId, userId);

    if (error || !column) {
      return error;
    }

    if (column._count.cards > 0) {
      return jsonError("Move or delete cards before deleting this column.", 409);
    }

    await prisma.$transaction([
      prisma.column.delete({
        where: { id: column.id }
      }),
      prisma.column.updateMany({
        where: {
          boardId: column.boardId,
          position: { gt: column.position }
        },
        data: {
          position: { decrement: 1 }
        }
      })
    ]);

    await triggerPusherEvent(
      [`retzlo-board-${column.board.id}`, `retzlo-project-${column.board.projectId}`],
      "retzlo:sync",
      { action: "COLUMN_DELETED", boardId: column.board.id, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/columns/${column.id}`,
      requestMethod: "DELETE",
      category: "BOARD",
      action: "COLUMN_DELETED",
      severity: "WARNING",
      status: "SUCCESS",
      targetType: "COLUMN",
      targetId: column.id,
      targetName: column.name,
      summary: `Deleted column "${column.name}" from board ${column.board.id}`
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}