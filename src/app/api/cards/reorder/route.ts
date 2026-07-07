import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { processCardDonePayouts } from "@/lib/kanban/payout";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, getProjectIdForCard, requireUserId } from "@/lib/project-auth";

const reorderCardsSchema = z.object({
  cardId: z.string().uuid(),
  sourceColumnId: z.string().uuid(),
  destinationColumnId: z.string().uuid(),
  sourceOrderedCardIds: z.array(z.string().uuid()),
  destinationOrderedCardIds: z.array(z.string().uuid())
});

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = reorderCardsSchema.parse(await request.json());
    const projectId = await getProjectIdForCard(payload.cardId);

    if (!projectId) {
      return jsonError("Card not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    await prisma.$transaction(async (tx) => {
      const columns = await tx.column.findMany({
        where: {
          id: { in: [payload.sourceColumnId, payload.destinationColumnId] },
          board: { projectId }
        },
        select: { id: true }
      });

      if (columns.length !== (payload.sourceColumnId === payload.destinationColumnId ? 1 : 2)) {
        throw new Error("Invalid reorder columns.");
      }

      const destinationColumn = await tx.column.findUnique({
        where: { id: payload.destinationColumnId },
        select: { defaultCardStatus: true }
      });

      if (!destinationColumn) {
        throw new Error("Destination column not found.");
      }

      if (payload.sourceColumnId !== payload.destinationColumnId && destinationColumn.defaultCardStatus === "DONE") {
        await processCardDonePayouts(tx, payload.cardId, userId, projectId);
      }

      const updates =
        payload.sourceColumnId === payload.destinationColumnId
          ? payload.destinationOrderedCardIds.map((id, position) => ({
              id,
              columnId: payload.destinationColumnId,
              position
            }))
          : [
              ...payload.sourceOrderedCardIds.map((id, position) => ({
                id,
                columnId: payload.sourceColumnId,
                position
              })),
              ...payload.destinationOrderedCardIds.map((id, position) => ({
                id,
                columnId: payload.destinationColumnId,
                position
              }))
            ];

      await Promise.all(
        updates.map((update) =>
          tx.card.update({
            where: { id: update.id },
            data: {
              columnId: update.columnId,
              position: update.position,
              ...(update.id === payload.cardId && { status: destinationColumn.defaultCardStatus })
            }
          })
        )
      );
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}