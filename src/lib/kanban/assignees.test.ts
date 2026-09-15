import { describe, expect, it } from "vitest";
import {
  extractAssigneeIds,
  filterCardsByAssignee,
  resolveAssignees,
  withAssignees,
  type CardAssignee,
} from "./assignees";

describe("assignees module", () => {
  describe("extractAssigneeIds", () => {
    it("returns empty array for non-record or missing assigneeIds", () => {
      expect(extractAssigneeIds(null)).toEqual([]);
      expect(extractAssigneeIds(undefined)).toEqual([]);
      expect(extractAssigneeIds({})).toEqual([]);
      expect(extractAssigneeIds({ assigneeIds: null })).toEqual([]);
      expect(extractAssigneeIds({ assigneeIds: "not-an-array" })).toEqual([]);
    });

    it("extracts and trims string IDs, filtering out invalid values", () => {
      const input = {
        assigneeIds: ["user-1", "  user-2  ", "", 123, null, "user-3"],
      };
      expect(extractAssigneeIds(input)).toEqual(["user-1", "user-2", "user-3"]);
    });

    it("deduplicates IDs while preserving order", () => {
      const input = {
        assigneeIds: ["user-1", "user-2", "user-1", "user-3", "user-2"],
      };
      expect(extractAssigneeIds(input)).toEqual(["user-1", "user-2", "user-3"]);
    });
  });

  describe("withAssignees", () => {
    it("attaches sanitized assigneeIds to privateCoins preserving existing keys", () => {
      const existing = {
        difficulty: 8,
        projectCoinsClaimed: true,
      };
      const result = withAssignees(existing, ["user-1", " user-2 "]);
      expect(result).toEqual({
        difficulty: 8,
        projectCoinsClaimed: true,
        assigneeIds: ["user-1", "user-2"],
      });
    });

    it("removes assigneeIds when given empty array or null", () => {
      const existing = {
        difficulty: 5,
        assigneeIds: ["user-1"],
      };
      const resultEmpty = withAssignees(existing, []);
      expect(resultEmpty.assigneeIds).toBeUndefined();
      expect(resultEmpty.difficulty).toBe(5);

      const resultNull = withAssignees(existing, null);
      expect(resultNull.assigneeIds).toBeUndefined();
    });

    it("handles non-record input safely", () => {
      const result = withAssignees(null, ["user-1"]);
      expect(result).toEqual({ assigneeIds: ["user-1"] });
    });
  });

  describe("resolveAssignees", () => {
    const members: CardAssignee[] = [
      { id: "u1", name: "Alice", email: "alice@test.com" },
      { id: "u2", name: "Bob", email: "bob@test.com" },
      { id: "u3", name: "Charlie", email: "charlie@test.com" },
    ];

    it("resolves IDs to CardAssignee objects in order", () => {
      const resolved = resolveAssignees(["u2", "u1"], members);
      expect(resolved).toEqual([members[1], members[0]]);
    });

    it("ignores IDs that do not exist in members list", () => {
      const resolved = resolveAssignees(["u1", "u999"], members);
      expect(resolved).toEqual([members[0]]);
    });

    it("returns empty array when assigneeIds or members are empty", () => {
      expect(resolveAssignees([], members)).toEqual([]);
      expect(resolveAssignees(["u1"], [])).toEqual([]);
      expect(resolveAssignees(null, members)).toEqual([]);
    });
  });

  describe("filterCardsByAssignee", () => {
    const cards = [
      { id: "c1", assigneeIds: ["u1", "u2"] },
      { id: "c2", assigneeIds: ["u2"] },
      { id: "c3", assigneeIds: [] },
      { id: "c4", assigneeIds: undefined },
      { id: "c5", assigneeIds: ["u3"] },
    ];

    it("returns all cards when filter is null, undefined, or 'ALL'", () => {
      expect(filterCardsByAssignee(cards, null)).toEqual(cards);
      expect(filterCardsByAssignee(cards, undefined)).toEqual(cards);
      expect(filterCardsByAssignee(cards, "ALL")).toEqual(cards);
    });

    it("returns only unassigned cards when filter is 'UNASSIGNED'", () => {
      const unassigned = filterCardsByAssignee(cards, "UNASSIGNED");
      expect(unassigned.map((c) => c.id)).toEqual(["c3", "c4"]);
    });

    it("filters by specific userId", () => {
      const u2Cards = filterCardsByAssignee(cards, "u2");
      expect(u2Cards.map((c) => c.id)).toEqual(["c1", "c2"]);
    });

    it("filters by 'ME' using currentUserId", () => {
      const myCards = filterCardsByAssignee(cards, "ME", "u3");
      expect(myCards.map((c) => c.id)).toEqual(["c5"]);
    });

    it("returns empty array if 'ME' has no currentUserId", () => {
      const myCards = filterCardsByAssignee(cards, "ME", null);
      expect(myCards).toEqual(cards);
    });
  });
});
