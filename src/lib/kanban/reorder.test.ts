import { describe, expect, it } from "vitest";

import { moveCard } from "./reorder";
import type { Card, ColumnWithCards } from "@/types/kanban";

function card(id: string, columnId: string, position: number): Card {
  return {
    id,
    title: id.toUpperCase(),
    description: null,
    note: null,
    position,
    status: "TODO",
    color: "DEFAULT",
    checklist: [],
    dueDate: null,
    dueDateAllDay: false,
    priority: "MEDIUM",
    isStarred: false,
    columnId
  };
}

const baseColumns = (): ColumnWithCards[] => [
  {
    id: "todo",
    name: "Todo",
    position: 0,
    color: "default",
    icon: "kanban",
    cards: [card("a", "todo", 0), card("b", "todo", 1), card("c", "todo", 2)]
  },
  {
    id: "done",
    name: "Done",
    position: 1,
    color: "default",
    icon: "kanban",
    cards: [card("d", "done", 0)]
  },
  {
    id: "empty",
    name: "Empty",
    position: 2,
    color: "default",
    icon: "kanban",
    cards: []
  }
];

describe("moveCard", () => {
  it("reorders cards inside the same column and recalculates positions", () => {
    const result = moveCard(baseColumns(), {
      cardId: "a",
      sourceColumnId: "todo",
      destinationColumnId: "todo",
      destinationIndex: 2
    });

    expect(result.columns[0].cards.map((card) => `${card.id}:${card.position}`)).toEqual([
      "b:0",
      "c:1",
      "a:2"
    ]);
    expect(result.affectedColumnIds).toEqual(["todo"]);
  });

  it("moves a card to a different column and updates its column id", () => {
    const result = moveCard(baseColumns(), {
      cardId: "b",
      sourceColumnId: "todo",
      destinationColumnId: "done",
      destinationIndex: 1
    });

    expect(result.columns[0].cards.map((card) => `${card.id}:${card.position}:${card.columnId}`)).toEqual([
      "a:0:todo",
      "c:1:todo"
    ]);
    expect(result.columns[1].cards.map((card) => `${card.id}:${card.position}:${card.columnId}`)).toEqual([
      "d:0:done",
      "b:1:done"
    ]);
    expect(result.affectedColumnIds).toEqual(["todo", "done"]);
  });

  it("moves a card into an empty column at position zero", () => {
    const result = moveCard(baseColumns(), {
      cardId: "c",
      sourceColumnId: "todo",
      destinationColumnId: "empty",
      destinationIndex: 0
    });

    expect(result.columns[2].cards).toEqual([
      {
        id: "c",
        title: "C",
        description: null,
        note: null,
        position: 0,
        status: "TODO",
        color: "DEFAULT",
        checklist: [],
        dueDate: null,
        dueDateAllDay: false,
        priority: "MEDIUM",
        isStarred: false,
        columnId: "empty"
      }
    ]);
    expect(result.affectedColumnIds).toEqual(["todo", "empty"]);
  });
});
