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

const cardStatusSchema = z.enum(["TODO", "DOING", "WAITING", "DONE"]);
const cardColorSchema = z.enum(cardColorValues).default("DEFAULT");
const checklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(160),
  checked: z.boolean()
});

const createCardSchema = z.object({
  columnId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  status: cardStatusSchema.default("TODO"),
  color: cardColorSchema,
  checklist: z.array(checklistItemSchema).default([]),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().default(false)
});

const updateCardSchema = z.object({
  cardId: z.string().uuid(),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: cardStatusSchema.optional(),
  color: z.enum(cardColorValues).optional(),
  checklist: z.array(checklistItemSchema).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  dueDateAllDay: z.boolean().optional()
});

function serializeCard<T extends {
  status: string;
  color: string;
  checklist: unknown;
  dueDate: Date | null;
  dueDateAllDay: boolean;
}>(card: T) {
  return {
    ...card,
    status: card.status as CardStatus,
    color: normalizeCardColor(card.color),
    checklist: Array.isArray(card.checklist) ? (card.checklist as ChecklistItem[]) : [],
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    dueDateAllDay: card.dueDateAllDay
  };
}

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
    const card = await prisma.card.create({
      data: {
        columnId: payload.columnId,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        color: payload.color,
        checklist: payload.checklist,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        dueDateAllDay: payload.dueDateAllDay,
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

    const card = await prisma.card.update({
      where: { id: payload.cardId },
      data: {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        color: payload.color,
        checklist: payload.checklist,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate,
        dueDateAllDay: payload.dueDateAllDay
      }
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

    const projectId = await getProjectIdForCard(cardId);

    if (!projectId) {
      return jsonError("Card not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const card = await prisma.card.delete({
      where: { id: cardId },
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
