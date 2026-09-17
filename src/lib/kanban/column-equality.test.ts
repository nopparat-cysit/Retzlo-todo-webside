import { describe, expect, it } from "vitest";
import { areColumnsEqual } from "./column-equality";
import type { ColumnWithCards } from "@/types/kanban";

describe("areColumnsEqual", () => {
  const baseColumn: ColumnWithCards = {
    id: "col-1",
    name: "To Do",
    position: 0,
    color: "default",
    icon: "kanban",
    defaultCardStatus: "TODO",
    wipLimit: 5,
    cards: [
      {
        id: "card-1",
        title: "Test Card",
        description: "Desc",
        note: null,
        position: 0,
        status: "TODO",
        color: "DEFAULT",
        checklist: [{ id: "c1", label: "Check 1", checked: false }],
        dueDate: "2026-09-20T00:00:00.000Z",
        dueDateAllDay: true,
        priority: "MEDIUM",
        isStarred: false,
        columnId: "col-1",
        rewardCoins: 10,
        difficulty: 2,
        assigneeIds: ["user-1"]
      }
    ]
  };

  it("returns true for identical column objects", () => {
    const colsA = [baseColumn];
    const colsB = [JSON.parse(JSON.stringify(baseColumn))];
    expect(areColumnsEqual(colsA, colsB)).toBe(true);
  });

  it("returns false if column count differs", () => {
    expect(areColumnsEqual([baseColumn], [])).toBe(false);
  });

  it("returns false if column properties change", () => {
    const colModified = { ...baseColumn, name: "In Progress" };
    expect(areColumnsEqual([baseColumn], [colModified])).toBe(false);
  });

  it("returns false if card positions change", () => {
    const colModified: ColumnWithCards = {
      ...baseColumn,
      cards: [
        {
          ...baseColumn.cards[0],
          position: 1
        }
      ]
    };
    expect(areColumnsEqual([baseColumn], [colModified])).toBe(false);
  });

  it("returns false if card checklist changes", () => {
    const colModified: ColumnWithCards = {
      ...baseColumn,
      cards: [
        {
          ...baseColumn.cards[0],
          checklist: [{ id: "c1", label: "Check 1", checked: true }]
        }
      ]
    };
    expect(areColumnsEqual([baseColumn], [colModified])).toBe(false);
  });

  it("returns false if card assignees change", () => {
    const colModified: ColumnWithCards = {
      ...baseColumn,
      cards: [
        {
          ...baseColumn.cards[0],
          assigneeIds: ["user-2"]
        }
      ]
    };
    expect(areColumnsEqual([baseColumn], [colModified])).toBe(false);
  });
});
