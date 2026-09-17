import {
  closestCorners,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  type CollisionDetection
} from "@dnd-kit/core";

export interface ColumnSummary {
  id: string;
  cards: { id: string }[];
}

/**
 * Custom collision detection strategy for multi-container Kanban boards.
 *
 * Prevents the classic dnd-kit jitter/jumping caused by closestCenter:
 * 1. Column drag: only checks against column containers.
 * 2. Card drag:
 *    - First checks pointer coordinates with pointerWithin.
 *    - If pointer is within a column, resolves to closest card within that column or the column itself if empty.
 *    - If pointer is between cards/columns, falls back to rectIntersection and closestCorners.
 */
export function createKanbanCollisionDetection(
  getColumns: () => ColumnSummary[]
): CollisionDetection {
  return (args) => {
    // 1. Column dragging
    if (args.active.data.current?.type === "column") {
      const columnContainers = args.droppableContainers.filter(
        (container) => container.data.current?.type === "column"
      );
      return closestCorners({
        ...args,
        droppableContainers: columnContainers
      });
    }

    // 2. Card dragging
    // Exclude the active container being dragged to prevent self-collision (active.id === over.id)
    const candidateContainers = args.droppableContainers.filter(
      (container) => container.id !== args.active.id
    );
    const cardDragArgs = {
      ...args,
      droppableContainers: candidateContainers
    };

    // First, check direct pointer collisions among other containers
    const pointerCollisions = pointerWithin(cardDragArgs);
    const collisions = pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(cardDragArgs);
    const firstCollisionId = getFirstCollision(collisions, "id");

    if (firstCollisionId != null) {
      const isColumn = String(firstCollisionId).startsWith("column:");

      if (isColumn) {
        const columnId = String(firstCollisionId).replace("column:", "");
        const currentColumns = getColumns();
        const targetColumn = currentColumns.find((c) => c.id === columnId);

        // If the column has other cards, prioritize closest card within this column
        if (targetColumn && targetColumn.cards.length > 0) {
          const cardIds = new Set(
            targetColumn.cards
              .filter((card) => `card:${card.id}` !== String(args.active.id))
              .map((card) => `card:${card.id}`)
          );
          const cardsInColumn = candidateContainers.filter((container) =>
            cardIds.has(String(container.id))
          );

          if (cardsInColumn.length > 0) {
            const closestCard = closestCorners({
              ...cardDragArgs,
              droppableContainers: cardsInColumn
            });
            if (closestCard.length > 0) {
              return closestCard;
            }
          }
        }

        // Empty column or no other card match -> drop on column
        return [{ id: firstCollisionId }];
      }

      // Direct card collision
      return collisions;
    }

    // Fallback when outside droppables
    return closestCorners(cardDragArgs);
  };
}
