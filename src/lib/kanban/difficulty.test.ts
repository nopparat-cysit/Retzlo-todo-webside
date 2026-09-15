import { describe, expect, it } from "vitest";
import {
  DIFFICULTY_SCORES,
  calculateColumnPoints,
  extractDifficulty,
  getDifficultyMetadata,
  isValidDifficultyScore,
  sanitizeDifficultyScore,
  withDifficulty,
} from "./difficulty";

describe("difficulty module", () => {
  it("defines the exact allowed difficulty scores [1, 3, 5, 8, 16, 21]", () => {
    expect(DIFFICULTY_SCORES).toEqual([1, 3, 5, 8, 16, 21]);
  });

  describe("isValidDifficultyScore", () => {
    it("returns true for valid difficulty numbers", () => {
      expect(isValidDifficultyScore(1)).toBe(true);
      expect(isValidDifficultyScore(3)).toBe(true);
      expect(isValidDifficultyScore(5)).toBe(true);
      expect(isValidDifficultyScore(8)).toBe(true);
      expect(isValidDifficultyScore(16)).toBe(true);
      expect(isValidDifficultyScore(21)).toBe(true);
    });

    it("returns false for invalid numbers and non-numbers", () => {
      expect(isValidDifficultyScore(0)).toBe(false);
      expect(isValidDifficultyScore(2)).toBe(false);
      expect(isValidDifficultyScore(4)).toBe(false);
      expect(isValidDifficultyScore(7)).toBe(false);
      expect(isValidDifficultyScore(13)).toBe(false);
      expect(isValidDifficultyScore(20)).toBe(false);
      expect(isValidDifficultyScore(22)).toBe(false);
      expect(isValidDifficultyScore(-1)).toBe(false);
      expect(isValidDifficultyScore(NaN)).toBe(false);
      expect(isValidDifficultyScore("5")).toBe(false);
      expect(isValidDifficultyScore(null)).toBe(false);
      expect(isValidDifficultyScore(undefined)).toBe(false);
    });
  });

  describe("sanitizeDifficultyScore", () => {
    it("parses valid numbers and numeric strings", () => {
      expect(sanitizeDifficultyScore(1)).toBe(1);
      expect(sanitizeDifficultyScore(3)).toBe(3);
      expect(sanitizeDifficultyScore(5)).toBe(5);
      expect(sanitizeDifficultyScore(8)).toBe(8);
      expect(sanitizeDifficultyScore(16)).toBe(16);
      expect(sanitizeDifficultyScore(21)).toBe(21);
      expect(sanitizeDifficultyScore(" 8 ")).toBe(8);
      expect(sanitizeDifficultyScore("21")).toBe(21);
    });

    it("returns null for invalid inputs", () => {
      expect(sanitizeDifficultyScore(null)).toBeNull();
      expect(sanitizeDifficultyScore(undefined)).toBeNull();
      expect(sanitizeDifficultyScore("")).toBeNull();
      expect(sanitizeDifficultyScore("abc")).toBeNull();
      expect(sanitizeDifficultyScore(13)).toBeNull();
      expect(sanitizeDifficultyScore(0)).toBeNull();
      expect(sanitizeDifficultyScore(-5)).toBeNull();
    });
  });

  describe("getDifficultyMetadata", () => {
    it("returns metadata with label, pointsLabel, and color classes", () => {
      const meta = getDifficultyMetadata(5);
      expect(meta).not.toBeNull();
      expect(meta?.score).toBe(5);
      expect(meta?.pointsLabel).toBe("5 pts");
      expect(meta?.badgeClass).toContain("bg-amber");
      expect(meta?.title).toContain("5 pts");
    });

    it("returns null for null, undefined, or invalid scores", () => {
      expect(getDifficultyMetadata(null)).toBeNull();
      expect(getDifficultyMetadata(undefined)).toBeNull();
      // @ts-expect-error testing invalid score
      expect(getDifficultyMetadata(99)).toBeNull();
    });
  });

  describe("calculateColumnPoints", () => {
    it("returns 0 for empty or invalid card arrays", () => {
      expect(calculateColumnPoints([])).toBe(0);
      // @ts-expect-error testing invalid input
      expect(calculateColumnPoints(null)).toBe(0);
    });

    it("returns 0 when no cards have difficulty set", () => {
      const cards = [
        { difficulty: null },
        { difficulty: undefined },
        { difficulty: null },
      ];
      expect(calculateColumnPoints(cards)).toBe(0);
    });

    it("correctly sums valid difficulty points across cards", () => {
      const cards = [
        { difficulty: 1 as const },
        { difficulty: 3 as const },
        { difficulty: 5 as const },
      ];
      expect(calculateColumnPoints(cards)).toBe(9);
    });

    it("handles mixed cards with null, invalid, and high scores (16, 21)", () => {
      const cards = [
        { difficulty: null },
        { difficulty: 1 as const },
        null,
        { difficulty: 8 as const },
        { difficulty: 16 as const },
        { difficulty: 21 as const },
      ];
      expect(calculateColumnPoints(cards)).toBe(46);
    });
  });

  describe("extractDifficulty & withDifficulty", () => {
    it("extracts difficulty from privateCoins object", () => {
      expect(extractDifficulty(null)).toBeNull();
      expect(extractDifficulty({})).toBeNull();
      expect(extractDifficulty({ difficulty: 8 })).toBe(8);
      expect(extractDifficulty({ difficulty: 99 })).toBeNull();
    });

    it("injects difficulty preserving other keys", () => {
      const existing = {
        projectCoinsClaimed: true,
        "user-123": { coins: 50, claimed: false },
      };
      const updated = withDifficulty(existing, 16);
      expect(updated).toEqual({
        projectCoinsClaimed: true,
        "user-123": { coins: 50, claimed: false },
        difficulty: 16,
      });

      const cleared = withDifficulty(updated, null);
      expect(cleared.difficulty).toBeUndefined();
      expect(cleared.projectCoinsClaimed).toBe(true);
    });
  });
});
