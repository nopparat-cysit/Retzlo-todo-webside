import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { columnSettingsSchema } from "@/lib/kanban/column-settings";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

const columnIdSchema = z.string().uuid();

async function getEditableColumn(columnId: string, userId: string) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: { select: { id: true, projectId: true } },
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
        icon: payload.icon
      },
      include: {
        cards: {
          orderBy: { position: "asc" }
        }
      }
    });

    return NextResponse.json({ column: updatedColumn });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { columnId: string } }) {
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
