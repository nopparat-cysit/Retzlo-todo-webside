import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { cardColorValues, normalizeCardColor } from "@/lib/theme/card-colors";
import type { CardStatus, ChecklistItem } from "@/types/kanban";
import {
  assertProjectMember,
  getProjectIdForCard,
  getProjectIdForColumn,
  requireUserId
} from "@/lib/project-auth";
import { processCardDonePayouts } from "@/lib/kanban/payout";
import { serializeCard } from "@/lib/kanban/serialize-card";
import { normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import {
  extractDifficulty,
  sanitizeDifficultyScore,
  withDifficulty
} from "@/lib/kanban/difficulty";
import {
  extractAssigneeIds,
  withAssignees
} from "@/lib/kanban/assignees";
import {
  extractStartDate,
  extractStartDateAllDay,
  withStartDate
} from "@/lib/kanban/due-date";

const cardStatusSchema = z.enum(["TODO", "DOING", "WAITING", "DONE"]);
const cardColorSchema = z.enum(cardColorValues).default("DEFAULT");
const cardPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM");
const checklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(160),
  checked: z.boolean()
});
const retroStickersSchema = z.array(z.string()).default([]).transform(normalizeRetroStickerSelection);
const difficultySchema = z.preprocess(
  sanitizeDifficultyScore,
  z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(8), z.literal(16), z.literal(21)]).nullable()
).optional();

const createCardSchema = z.object({
  columnId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  note: z.string().trim().max(5000).nullable().optional(),
  status: cardStatusSchema.default("TODO"),
  color: cardColorSchema,
  checklist: z.array(checklistItemSchema).default([]),
  startDate: z.string().datetime().nullable().optional(),
  startDateAllDay: z.boolean().default(false).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().default(false),
  priority: cardPrioritySchema,
  isStarred: z.boolean().default(false),
  rewardCoins: z.number().int().nonnegative().default(0),
  privateCoins: z.any().optional(),
  stickers: retroStickersSchema,
  difficulty: difficultySchema,
  assigneeIds: z.array(z.string().trim().min(1)).default([]).optional(),
});

const updateCardSchema = z.object({
  cardId: z.string().uuid(),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  note: z.string().trim().max(5000).nullable().optional(),
  status: cardStatusSchema.optional(),
  color: z.enum(cardColorValues).optional(),
  checklist: z.array(checklistItemSchema).optional(),
  startDate: z.string().datetime().nullable().optional(),
  startDateAllDay: z.boolean().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  isStarred: z.boolean().optional(),
  rewardCoins: z.number().int().nonnegative().optional(),
  privateCoins: z.any().optional(),
  stickers: retroStickersSchema.optional(),
  difficulty: difficultySchema,
  assigneeIds: z.array(z.string().trim().min(1)).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createCardSchema.parse(await request.json());
    const projectId = await getProjectIdForColumn(payload.columnId);

    if (!projectId) {
      return jsonError("Column not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const position = await prisma.card.count({
      where: { columnId: payload.columnId }
    });
    let privateCoins = withDifficulty(payload.privateCoins, payload.difficulty);
    if (payload.assigneeIds !== undefined) {
      privateCoins = withAssignees(privateCoins, payload.assigneeIds);
    }
    if (payload.startDate !== undefined || payload.startDateAllDay !== undefined) {
      privateCoins = withStartDate(privateCoins, payload.startDate, payload.startDateAllDay ?? false);
    }
    const card = await prisma.card.create({
      data: {
        columnId: payload.columnId,
        title: payload.title,
        description: payload.description,
        note: payload.note,
        status: payload.status,
        color: payload.color,
        checklist: payload.checklist,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        dueDateAllDay: payload.dueDateAllDay,
        priority: payload.priority,
        isStarred: payload.isStarred ?? false,
        rewardCoins: payload.rewardCoins,
        privateCoins: privateCoins as any,
        stickers: payload.stickers,
        position
      }
    });

    return NextResponse.json({ card: serializeCard(card) }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = updateCardSchema.parse(await request.json());
    const projectId = await getProjectIdForCard(payload.cardId);

    if (!projectId) {
      return jsonError("Card not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const card = await prisma.$transaction(async (tx) => {
      if (payload.status === "DONE") {
        await processCardDonePayouts(tx, payload.cardId, userId, projectId);
      }

      const shouldUpdateCoins =
        payload.privateCoins !== undefined ||
        payload.difficulty !== undefined ||
        payload.assigneeIds !== undefined ||
        payload.startDate !== undefined ||
        payload.startDateAllDay !== undefined;

      let nextPrivateCoins: any = undefined;
      if (shouldUpdateCoins) {
        const currentCard = await tx.card.findUnique({
          where: { id: payload.cardId },
          select: { privateCoins: true }
        });
        const currentCoins =
          typeof currentCard?.privateCoins === "object" && currentCard.privateCoins !== null
            ? (currentCard.privateCoins as Record<string, unknown>)
            : {};
        const incomingCoins =
          typeof payload.privateCoins === "object" && payload.privateCoins !== null
            ? (payload.privateCoins as Record<string, unknown>)
            : {};

        let mergedCoins: Record<string, unknown> = {
          ...currentCoins,
          ...incomingCoins
        };

        if (payload.difficulty !== undefined) {
          mergedCoins = withDifficulty(mergedCoins, payload.difficulty);
        }
        if (payload.assigneeIds !== undefined) {
          mergedCoins = withAssignees(mergedCoins, payload.assigneeIds);
        }
        if (payload.startDate !== undefined || payload.startDateAllDay !== undefined) {
          mergedCoins = withStartDate(
            mergedCoins,
            payload.startDate !== undefined ? payload.startDate : extractStartDate(mergedCoins),
            payload.startDateAllDay !== undefined ? payload.startDateAllDay : extractStartDateAllDay(mergedCoins)
          );
        }
        nextPrivateCoins = mergedCoins;
      }

      return tx.card.update({
        where: { id: payload.cardId },
        data: {
          title: payload.title,
          description: payload.description,
          note: payload.note,
          status: payload.status,
          color: payload.color,
          checklist: payload.checklist,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate,
          dueDateAllDay: payload.dueDateAllDay,
          priority: payload.priority,
          rewardCoins: payload.rewardCoins,
          ...(nextPrivateCoins !== undefined && { privateCoins: nextPrivateCoins as any }),
          stickers: payload.stickers,
          ...(payload.isStarred !== undefined && { isStarred: payload.isStarred }),
        }
      });
    });

    return NextResponse.json({ card: serializeCard(card) });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return jsonError("Card id is required.", 422);
    }

    const parsedCardId = z.string().uuid().safeParse(cardId);

    if (!parsedCardId.success) {
      return jsonError("Invalid card id.", 422);
    }

    const projectId = await getProjectIdForCard(parsedCardId.data);

    if (!projectId) {
      return jsonError("Card not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const card = await prisma.card.delete({
      where: { id: parsedCardId.data },
      select: {
        columnId: true
      }
    });
    const remainingCards = await prisma.card.findMany({
      where: { columnId: card.columnId },
      orderBy: { position: "asc" },
      select: { id: true }
    });

    await prisma.$transaction(
      remainingCards.map((remainingCard, position) =>
        prisma.card.update({
          where: { id: remainingCard.id },
          data: { position }
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
