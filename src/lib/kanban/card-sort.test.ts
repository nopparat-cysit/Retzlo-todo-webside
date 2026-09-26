import { describe, expect, it } from "vitest";
import { sortCards, CardSortOption } from "./card-sort";
import { Card } from "@/types/kanban";

function mockCard(overrides: Partial<Card>): Card {
  return {
    id: "card-1",
    title: "Test Card",
    description: null,
    note: null,
    columnId: "col-1",
    position: 0,
    status: "TODO",
    priority: "MEDIUM",
    color: "DEFAULT",
    isStarred: false,
    dueDate: null,
    dueDateAllDay: false,
    startDate: null,
    startDateAllDay: false,
    checklist: [],
    assigneeIds: [],
    difficulty: null,
    ...overrides
  };
}

describe("sortCards", () => {
  const cards: Card[] = [
    mockCard({ id: "c1", title: "Task 1", difficulty: 3, priority: "LOW", dueDate: "2026-09-30T10:00:00Z", position: 0 }),
    mockCard({ id: "c2", title: "Task 2", difficulty: 8, priority: "HIGH", dueDate: "2026-09-27T10:00:00Z", position: 1 }),
    mockCard({ id: "c3", title: "Task 3", difficulty: 1, priority: "HIGH", dueDate: "2026-10-05T10:00:00Z", position: 2 }),
    mockCard({ id: "c4", title: "Task 4", difficulty: 5, priority: "MEDIUM", dueDate: null, position: 3 }),
    mockCard({ id: "c5", title: "Task 5", difficulty: null, priority: "LOW", dueDate: null, position: 4 })
  ];

  it("returns cards unmodified when sortOption is manual", () => {
    const result = sortCards(cards, "manual");
    expect(result.map((c) => c.id)).toEqual(["c1", "c2", "c3", "c4", "c5"]);
  });

  it("sorts by Story Points descending (8 -> 1, then nulls)", () => {
    const result = sortCards(cards, "difficulty_desc");
    expect(result.map((c) => c.id)).toEqual(["c2", "c4", "c1", "c3", "c5"]);
  });

  it("sorts by Story Points ascending (1 -> 8, then nulls at bottom)", () => {
    const result = sortCards(cards, "difficulty_asc");
    expect(result.map((c) => c.id)).toEqual(["c3", "c1", "c4", "c2", "c5"]);
  });

  it("sorts by Priority descending (High -> Medium -> Low)", () => {
    const result = sortCards(cards, "priority_desc");
    expect(result.map((c) => c.id)).toEqual(["c2", "c3", "c4", "c1", "c5"]);
  });

  it("sorts by Priority ascending (Low -> Medium -> High)", () => {
    const result = sortCards(cards, "priority_asc");
    expect(result.map((c) => c.id)).toEqual(["c1", "c5", "c4", "c2", "c3"]);
  });

  it("sorts by Due Date ascending (earliest first, nulls at bottom)", () => {
    const result = sortCards(cards, "due_date");
    expect(result.map((c) => c.id)).toEqual(["c2", "c1", "c3", "c4", "c5"]);
  });

  it("maintains stable order fallback if values are identical", () => {
    const tieCards: Card[] = [
      mockCard({ id: "t1", difficulty: 5, position: 0 }),
      mockCard({ id: "t2", difficulty: 5, position: 1 }),
      mockCard({ id: "t3", difficulty: 5, position: 2 })
    ];
    const result = sortCards(tieCards, "difficulty_desc");
    expect(result.map((c) => c.id)).toEqual(["t1", "t2", "t3"]);
  });
});
