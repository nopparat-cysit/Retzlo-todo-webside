import type { ColumnWithCards } from "@/types/kanban";

export interface MoveCardInput {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  destinationIndex: number;
}

export interface MoveCardResult {
  columns: ColumnWithCards[];
  affectedColumnIds: string[];
}

function withPositions(cards: ColumnWithCards["cards"], columnId: string): ColumnWithCards["cards"] {
  return cards.map((card, position) => ({
    ...card,
    columnId,
    position
  }));
}

export function moveCard(columns: ColumnWithCards[], input: MoveCardInput): MoveCardResult {
  const sourceColumn = columns.find((column) => column.id === input.sourceColumnId);
  const destinationColumn = columns.find((column) => column.id === input.destinationColumnId);
  const movedCard = sourceColumn?.cards.find((card) => card.id === input.cardId);

  if (!sourceColumn || !destinationColumn || !movedCard) {
    return {
      columns,
      affectedColumnIds: []
    };
  }

  const nextColumns = columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== input.cardId)
  }));

  const destinationIndex = Math.max(0, input.destinationIndex);
  const affectedColumnIds =
    input.sourceColumnId === input.destinationColumnId
      ? [input.sourceColumnId]
      : [input.sourceColumnId, input.destinationColumnId];

  const columnsWithMovedCard = nextColumns.map((column) => {
    if (column.id !== input.destinationColumnId) {
      return column;
    }

    const cards = [...column.cards];
    cards.splice(destinationIndex, 0, {
      ...movedCard,
      columnId: input.destinationColumnId
    });

    return {
      ...column,
      cards
    };
  });

  return {
    columns: columnsWithMovedCard.map((column) =>
      affectedColumnIds.includes(column.id)
        ? {
            ...column,
            cards: withPositions(column.cards, column.id)
          }
        : column
    ),
    affectedColumnIds
  };
}

export function reorderColumns(columns: ColumnWithCards[], activeId: string, overId: string): ColumnWithCards[] {
  const activeIndex = columns.findIndex((column) => column.id === activeId);
  const overIndex = columns.findIndex((column) => column.id === overId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return columns;
  }

  const nextColumns = [...columns];
  const [movedColumn] = nextColumns.splice(activeIndex, 1);
  nextColumns.splice(overIndex, 0, movedColumn);

  return nextColumns.map((column, position) => ({
    ...column,
    position
  }));
}
