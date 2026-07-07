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
    defaultCardStatus: "TODO",
    cards: [card("a", "todo", 0), card("b", "todo", 1), card("c", "todo", 2)]
  },
  {
    id: "done",
    name: "Done",
    position: 1,
    color: "default",
    icon: "kanban",
    defaultCardStatus: "DONE",
    cards: [card("d", "done", 0)]
  },
  {
    id: "empty",
    name: "??????? custom",
    position: 2,
    color: "default",
    icon: "kanban",
    defaultCardStatus: "WAITING",
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

  it("moves a card to a different column and updates its column id and status", () => {
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
    expect(result.columns[1].cards.map((card) => `${card.id}:${card.position}:${card.columnId}:${card.status}`)).toEqual([
      "d:0:done:TODO",
      "b:1:done:DONE"
    ]);
    expect(result.affectedColumnIds).toEqual(["todo", "done"]);
  });

  it("moves a card into a custom waiting column and applies that column status", () => {
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
        status: "WAITING",
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