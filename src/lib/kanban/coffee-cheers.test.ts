import { describe, expect, it } from "vitest";
import {
  calculateMemberTotalCoffees,
  canUserCheerCard,
  extractCardCoffeeCheers,
  hasUserCheeredCard,
  withCardCoffeeCheer
} from "./coffee-cheers";

describe("DONE Column Coffee Cheers & Anti-Cheat", () => {
  describe("extractCardCoffeeCheers", () => {
    it("handles null, undefined, or empty privateCoins safely", () => {
      expect(extractCardCoffeeCheers(null)).toEqual({ count: 0, userIds: [], cheers: {} });
      expect(extractCardCoffeeCheers(undefined)).toEqual({ count: 0, userIds: [], cheers: {} });
      expect(extractCardCoffeeCheers({})).toEqual({ count: 0, userIds: [], cheers: {} });
      expect(extractCardCoffeeCheers({ coffeeCheers: "invalid" })).toEqual({
        count: 0,
        userIds: [],
        cheers: {}
      });
    });

    it("correctly extracts structured cheers map", () => {
      const data = extractCardCoffeeCheers({
        coffeeCheers: {
          "user-1": { userId: "user-1", userName: "Alice", createdAt: "2026-09-27T10:00:00Z" },
          "user-2": true
        }
      });

      expect(data.count).toBe(2);
      expect(data.userIds).toEqual(["user-1", "user-2"]);
      expect(data.cheers["user-1"].userName).toBe("Alice");
      expect(data.cheers["user-2"].userId).toBe("user-2");
    });
  });

  describe("canUserCheerCard (Anti-Cheat 100%)", () => {
    it("denies cheer if card is not in status DONE", () => {
      const result = canUserCheerCard({
        cardStatus: "DOING",
        privateCoins: { assigneeIds: ["user-assignee"] },
        currentUserId: "teammate-1"
      });

      expect(result.canCheer).toBe(false);
      expect(result.reason).toBe("NOT_DONE");
    });

    it("denies cheer if caller is unauthenticated", () => {
      const result = canUserCheerCard({
        cardStatus: "DONE",
        privateCoins: { assigneeIds: ["user-assignee"] },
        currentUserId: null
      });

      expect(result.canCheer).toBe(false);
      expect(result.reason).toBe("NO_USER");
    });

    it("STRICT ANTI-CHEAT: denies cheer if caller is the card assignee (cannot cheer own task)", () => {
      const result = canUserCheerCard({
        cardStatus: "DONE",
        privateCoins: { assigneeIds: ["user-assignee", "user-2"] },
        currentUserId: "user-assignee"
      });

      expect(result.canCheer).toBe(false);
      expect(result.reason).toBe("SELF_CHEER_FORBIDDEN");
    });

    it("denies cheer if caller has already cheered this card (1 cheer per card)", () => {
      const privateCoins = {
        assigneeIds: ["user-assignee"],
        coffeeCheers: {
          "teammate-1": { userId: "teammate-1", createdAt: "2026-09-27T10:00:00Z" }
        }
      };

      const result = canUserCheerCard({
        cardStatus: "DONE",
        privateCoins,
        currentUserId: "teammate-1"
      });

      expect(result.canCheer).toBe(false);
      expect(result.reason).toBe("ALREADY_CHEERED");
    });

    it("allows cheer when card is DONE, caller is not an assignee, and has not yet cheered", () => {
      const privateCoins = {
        assigneeIds: ["user-assignee"]
      };

      const result = canUserCheerCard({
        cardStatus: "DONE",
        privateCoins,
        currentUserId: "teammate-1"
      });

      expect(result.canCheer).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe("withCardCoffeeCheer", () => {
    it("adds a cheer to privateCoins preserving existing data", () => {
      const initial = {
        difficulty: 5,
        assigneeIds: ["user-assignee"]
      };

      const next = withCardCoffeeCheer(initial, "teammate-1", "Bob");
      const cheerData = extractCardCoffeeCheers(next);

      expect(cheerData.count).toBe(1);
      expect(cheerData.userIds).toContain("teammate-1");
      expect(cheerData.cheers["teammate-1"].userName).toBe("Bob");
      expect((next as any).difficulty).toBe(5);
      expect(hasUserCheeredCard(next, "teammate-1")).toBe(true);
      expect(hasUserCheeredCard(next, "teammate-2")).toBe(false);
    });
  });

  describe("calculateMemberTotalCoffees", () => {
    it("sums coffee cheers on all completed cards where the member is assigned", () => {
      const cards = [
        {
          status: "DONE",
          privateCoins: {
            assigneeIds: ["member-1"],
            coffeeCheers: { "u-1": true, "u-2": true }
          }
        },
        {
          status: "DONE",
          privateCoins: {
            assigneeIds: ["member-1", "member-2"],
            coffeeCheers: { "u-3": true }
          }
        },
        {
          status: "DOING", // not done - should ignore
          privateCoins: {
            assigneeIds: ["member-1"],
            coffeeCheers: { "u-4": true }
          }
        },
        {
          status: "DONE", // assigned to someone else
          privateCoins: {
            assigneeIds: ["member-2"],
            coffeeCheers: { "u-1": true, "u-2": true, "u-3": true }
          }
        }
      ];

      expect(calculateMemberTotalCoffees(cards, "member-1")).toBe(3); // 2 + 1
      expect(calculateMemberTotalCoffees(cards, "member-2")).toBe(4); // 1 + 3
      expect(calculateMemberTotalCoffees(cards, "unknown")).toBe(0);
    });
  });
});
