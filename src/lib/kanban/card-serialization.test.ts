import { describe, expect, it } from "vitest";
import { serializeCard } from "./serialize-card";
import { withDifficulty } from "./difficulty";
import { withAssignees } from "./assignees";
import { withStartDate } from "./due-date";

describe("serializeCard", () => {
  it("extracts difficulty, assignees, and startDate from privateCoins JSON", () => {
    let coins = withDifficulty({}, 8);
    coins = withAssignees(coins, ["user-1", "user-2"]);
    coins = withStartDate(coins, "2026-09-20T10:00:00.000Z", false);

    const rawPrismaCard = {
      id: "card-123",
      title: "Task with metadata",
      description: "Description",
      note: null,
      status: "TODO",
      color: "DEFAULT",
      checklist: [{ id: "c1", label: "Subtask", checked: true }],
      dueDate: new Date("2026-09-25T12:00:00.000Z"),
      dueDateAllDay: true,
      priority: "HIGH",
      isStarred: true,
      rewardCoins: 10,
      privateCoins: coins,
      stickers: ["star", "rocket"]
    };

    const serialized = serializeCard(rawPrismaCard);

    expect(serialized.difficulty).toBe(8);
    expect(serialized.assigneeIds).toEqual(["user-1", "user-2"]);
    expect(serialized.startDate).toBe("2026-09-20T10:00:00.000Z");
    expect(serialized.startDateAllDay).toBe(false);
    expect(serialized.dueDate).toBe("2026-09-25T12:00:00.000Z");
    expect(serialized.dueDateAllDay).toBe(true);
    expect(serialized.priority).toBe("HIGH");
    expect(serialized.isStarred).toBe(true);
    expect(serialized.rewardCoins).toBe(10);
  });

  it("handles null or empty privateCoins safely", () => {
    const rawCard = {
      id: "card-456",
      title: "Simple Task",
      description: null,
      status: "DOING",
      color: "DEFAULT",
      checklist: null,
      dueDate: null,
      dueDateAllDay: false,
      priority: "MEDIUM",
      isStarred: false,
      rewardCoins: 0,
      privateCoins: null,
      stickers: null
    };

    const serialized = serializeCard(rawCard);

    expect(serialized.difficulty).toBeNull();
    expect(serialized.assigneeIds).toEqual([]);
    expect(serialized.startDate).toBeNull();
    expect(serialized.startDateAllDay).toBe(false);
    expect(serialized.dueDate).toBeNull();
    expect(serialized.checklist).toEqual([]);
  });
});
