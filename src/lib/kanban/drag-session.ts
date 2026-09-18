import { moveCard, type MoveCardInput } from "./reorder";
import type { ColumnWithCards } from "@/types/kanban";

export interface CardDragSession {
  cardId: string;
  sourceColumnId: string;
  sourceIndex: number;
  snapshot: ColumnWithCards[];
}

export interface CardCollisionTarget {
  columnId: string;
  cardId?: string;
  placement: "before" | "after" | "append";
}

export interface CardReorderPayload {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceOrderedCardIds: string[];
  destinationOrderedCardIds: string[];
}

export function createCardDragSession(snapshot: ColumnWithCards[], cardId: string): CardDragSession | null {
  const source = snapshot.find(column => column.cards.some(card => card.id === cardId));
  if (!source) return null;
  return { cardId, sourceColumnId: source.id, sourceIndex: source.cards.findIndex(card => card.id === cardId), snapshot };
}

/** The source belongs to the session, never to the remounted draggable's metadata. */
export function getCardDropTarget(
  session: CardDragSession,
  liveColumns: ColumnWithCards[],
  collision: CardCollisionTarget | null
): MoveCardInput | null {
  if (!collision) return null;
  const destination = session.snapshot.find(column => column.id === collision.columnId);
  const liveDestination = liveColumns.find(column => column.id === collision.columnId);
  if (!destination || !liveDestination) return null;
  const cards = destination.cards.filter(card => card.id !== session.cardId);
  let destinationIndex = cards.length;
  if (collision.placement !== "append") {
    const anchorIndex = cards.findIndex(card => card.id === collision.cardId);
    if (anchorIndex < 0 || !liveDestination.cards.some(card => card.id === collision.cardId)) return null;
    destinationIndex = anchorIndex + (collision.placement === "after" ? 1 : 0);
  }
  return { cardId: session.cardId, sourceColumnId: session.sourceColumnId, destinationColumnId: destination.id, destinationIndex };
}

/** Null means cancel or no-op: callers must not send a reorder request. */
export function prepareCardMove(session: CardDragSession, target: MoveCardInput | null): {
  columns: ColumnWithCards[];
  payload: CardReorderPayload;
} | null {
  if (!target || target.cardId !== session.cardId || target.sourceColumnId !== session.sourceColumnId) return null;
  if (target.destinationColumnId === session.sourceColumnId && target.destinationIndex === session.sourceIndex) return null;
  const result = moveCard(session.snapshot, target);
  if (result.affectedColumnIds.length === 0) return null;
  const ids = (columnId: string) => result.columns.find(column => column.id === columnId)!.cards.map(card => card.id);
  return {
    columns: result.columns,
    payload: { cardId: session.cardId, sourceColumnId: session.sourceColumnId, destinationColumnId: target.destinationColumnId, sourceOrderedCardIds: ids(session.sourceColumnId), destinationOrderedCardIds: ids(target.destinationColumnId) }
  };
}
