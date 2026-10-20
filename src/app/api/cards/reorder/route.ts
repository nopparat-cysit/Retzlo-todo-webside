import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { processCardDonePayouts } from "@/lib/kanban/payout";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canAccessBoard, getProjectIdForCard, requireUserId } from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { logBoardActivity } from "@/lib/kanban/activity-logger";

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

    let targetBoardId: string | null = null;
    let movedCardTitle: string = "";
    let destinationColName: string = "";
    let sourceColName: string = "";

    await prisma.$transaction(async (tx) => {
      const columns = await tx.column.findMany({
        where: {
          id: { in: [payload.sourceColumnId, payload.destinationColumnId] },
          board: { projectId }
        },
        select: {
          id: true,
          name: true,
          board: {
            select: {
              id: true,
              isPrivate: true,
              members: { select: { userId: true } }
            }
          }
        }
      });

      if (columns.length !== (payload.sourceColumnId === payload.destinationColumnId ? 1 : 2)) {
        throw new Error("Invalid reorder columns.");
      }

      // Check board access for both source and destination
      for (const col of columns) {
        if (!col.board || !canAccessBoard(col.board, userId, membership.role)) {
          throw new Error("You do not have access to this board.");
        }
      }

      const destinationColumn = await tx.column.findUnique({
        where: { id: payload.destinationColumnId },
        select: { defaultCardStatus: true, name: true, boardId: true }
      });

      if (!destinationColumn) {
        throw new Error("Destination column not found.");
      }

      // Verify that all submitted card IDs belong to the affected columns in this project
      const existingCards = await tx.card.findMany({
        where: {
          columnId: { in: [payload.sourceColumnId, payload.destinationColumnId] },
          column: { board: { projectId } }
        },
        select: { id: true, columnId: true, position: true }
      });

      const validCardIds = new Set(existingCards.map((c) => c.id));
      if (!validCardIds.has(payload.cardId)) {
        throw new Error("Card does not belong to the reorder columns.");
      }

      const allSubmittedIds =
        payload.sourceColumnId === payload.destinationColumnId
          ? payload.destinationOrderedCardIds
          : [...payload.sourceOrderedCardIds, ...payload.destinationOrderedCardIds];

      for (const id of allSubmittedIds) {
        if (!validCardIds.has(id)) {
          throw new Error("Invalid card ID in reorder list.");
        }
      }

      targetBoardId = destinationColumn.boardId;
      destinationColName = destinationColumn.name;
      const sourceColumn = columns.find((c) => c.id === payload.sourceColumnId);
      sourceColName = sourceColumn?.name || "";

      if (payload.sourceColumnId !== payload.destinationColumnId) {
        const movedCard = await tx.card.findUnique({
          where: { id: payload.cardId },
          select: { title: true }
        });
        movedCardTitle = movedCard?.title || "";

        if (destinationColumn.defaultCardStatus === "DONE") {
          await processCardDonePayouts(tx, payload.cardId, userId, projectId);
        }
        await tx.cardComment.create({
          data: {
            cardId: payload.cardId,
            authorId: userId,
            type: "SYSTEM",
            content: `moved card to ${destinationColumn.name}`,
            metadata: {
              action: "COLUMN_MOVE",
              sourceColumnId: payload.sourceColumnId,
              destinationColumnId: payload.destinationColumnId,
              destinationColumnName: destinationColumn.name
            }
          }
        });
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

      // Optimize updates: only execute updates for cards whose position or column actually changed
      const existingMap = new Map(existingCards.map((c) => [c.id, c]));
      const changedUpdates = updates.filter((u) => {
        const ex = existingMap.get(u.id);
        if (!ex) return true;
        return ex.columnId !== u.columnId || ex.position !== u.position || u.id === payload.cardId;
      });

      await Promise.all(
        changedUpdates.map((update) =>
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

    if (targetBoardId) {
      await triggerPusherEvent(
        [`retzlo-project-${projectId}`, `retzlo-board-${targetBoardId}`],
        "retzlo:sync",
        { action: "CARD_REORDER", cardId: payload.cardId, senderId: userId }
      );

      if (payload.sourceColumnId !== payload.destinationColumnId) {
        void logBoardActivity({
          boardId: targetBoardId,
          userId,
          cardId: payload.cardId,
          action: "CARD_MOVED",
          details: {
            cardTitle: movedCardTitle,
            fromColumn: sourceColName,
            toColumn: destinationColName
          }
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
