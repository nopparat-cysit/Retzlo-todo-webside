import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { aiDateTimeSchema } from "@/lib/ai/chat-actions";
import { assertProjectMember, canAccessBoard, requireUserId } from "@/lib/project-auth";
import { prisma } from "@/lib/prisma";
import { triggerPusherEvent } from "@/lib/pusher/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const createCardsSchema = z.object({
  projectId: z.string().trim().min(1).max(191),
  boardId: z.string().uuid(),
  cards: z.array(z.object({
    columnId: z.string().uuid(),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(2000).nullable().default(null),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    dueDate: aiDateTimeSchema.nullable().default(null),
    dueDateAllDay: z.boolean().default(false)
  }).strict()).min(1).max(10)
}).strict();

const cardStatuses = new Set(["TODO", "DOING", "WAITING", "DONE"]);

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in before creating cards", 401);
    }

    const body = await request.json().catch(() => null);
    const payload = createCardsSchema.parse(body);
    const membership = await assertProjectMember(payload.projectId, userId);
    if (!membership) {
      return jsonError("You do not have permission to access this project", 403);
    }

    const board = await prisma.board.findUnique({
      where: { id: payload.boardId },
      select: {
        id: true,
        projectId: true,
        isPrivate: true,
        members: { select: { userId: true } },
        columns: { select: { id: true, defaultCardStatus: true } }
      }
    });

    if (!board || board.projectId !== payload.projectId) {
      return jsonError("Board not found in the specified project", 404);
    }
    if (!canAccessBoard(board, userId, membership.role)) {
      return jsonError("You do not have permission to access this board", 403);
    }

    const columnsById = new Map(board.columns.map((column) => [column.id, column]));
    if (payload.cards.some((card) => !columnsById.has(card.columnId))) {
      return jsonError("Specified column does not belong to this board", 422);
    }

    const createdCards = await prisma.$transaction(async (tx) => {
      const columnIds = Array.from(new Set(payload.cards.map((card) => card.columnId)));
      const counts = await tx.card.groupBy({
        by: ["columnId"],
        where: { columnId: { in: columnIds } },
        _count: { _all: true }
      });
      const nextPositions = new Map(
        counts.map((count) => [count.columnId, count._count._all])
      );
      const created: Array<{ id: string; title: string; columnId: string }> = [];

      for (const draft of payload.cards) {
        const column = columnsById.get(draft.columnId)!;
        const status = cardStatuses.has(column.defaultCardStatus)
          ? column.defaultCardStatus
          : "TODO";
        const position = nextPositions.get(column.id) ?? 0;
        const card = await tx.card.create({
          data: {
            columnId: column.id,
            title: draft.title,
            description: draft.description,
            status,
            priority: draft.priority,
            dueDate: draft.dueDate ? new Date(draft.dueDate) : null,
            dueDateAllDay: draft.dueDateAllDay,
            checklist: [],
            color: "DEFAULT",
            isStarred: false,
            rewardCoins: 0,
            stickers: [],
            position
          },
          select: { id: true, title: true, columnId: true }
        });
        created.push(card);
        nextPositions.set(column.id, position + 1);
      }

      return created;
    });

    await Promise.all(createdCards.map((card) =>
      triggerPusherEvent(
        [`retzlo-project-${payload.projectId}`],
        "retzlo:sync",
        { action: "CARD_CREATED", cardId: card.id, senderId: userId }
      )
    ));

    return NextResponse.json({ createdCount: createdCards.length, cards: createdCards }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid card data. Please check title, description, and due date format.", 422);
    }
    return parseError(error);
  }
}
