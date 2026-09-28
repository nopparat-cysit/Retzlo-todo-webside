import { describe, expect, it } from "vitest";
import { isDiaryItemDueOnDate, getDaysInMonth } from "./recurrence";

describe("Diary Recurrence Logic", () => {
  describe("getDaysInMonth", () => {
    it("returns correct days for various months and leap years", () => {
      expect(getDaysInMonth(2026, 0)).toBe(31); // Jan 2026
      expect(getDaysInMonth(2026, 1)).toBe(28); // Feb 2026 (non-leap)
      expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap)
      expect(getDaysInMonth(2026, 3)).toBe(30); // Apr 2026
      expect(getDaysInMonth(2026, 4)).toBe(31); // May 2026
      expect(getDaysInMonth(2026, 8)).toBe(30); // Sep 2026
      expect(getDaysInMonth(2026, 9)).toBe(31); // Oct 2026
    });
  });

  describe("Daily and Day-Interval Recurrence", () => {
    it("handles daily interval (1 day)", () => {
      const start = "2026-09-01";
      expect(isDiaryItemDueOnDate(start, "2026-09-01", 1, "DAY")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-09-02", 1, "DAY")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-09-30", 1, "DAY")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-10-01", 1, "DAY")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-08-31", 1, "DAY")).toBe(false); // Before start
    });

    it("handles 7-day weekly interval", () => {
      const start = "2026-09-07";
      expect(isDiaryItemDueOnDate(start, "2026-09-07", 7, "DAY")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-09-14", 7, "DAY")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-09-21", 7, "DAY")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-09-08", 7, "DAY")).toBe(false);
    });
  });

  describe("Monthly Recurrence (User Requirement: 28th of every month)", () => {
    it("matches exact 28th across months of different lengths (28, 29, 30, 31 days)", () => {
      const start = "2026-09-28"; // Starts on September 28

      // September (30 days)
      expect(isDiaryItemDueOnDate(start, "2026-09-28", 1, "MONTH")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-09-27", 1, "MONTH")).toBe(false);
      expect(isDiaryItemDueOnDate(start, "2026-09-29", 1, "MONTH")).toBe(false);

      // October (31 days)
      expect(isDiaryItemDueOnDate(start, "2026-10-28", 1, "MONTH")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-10-27", 1, "MONTH")).toBe(false);

      // November (30 days)
      expect(isDiaryItemDueOnDate(start, "2026-11-28", 1, "MONTH")).toBe(true);

      // December (31 days)
      expect(isDiaryItemDueOnDate(start, "2026-12-28", 1, "MONTH")).toBe(true);

      // January 2027 (31 days)
      expect(isDiaryItemDueOnDate(start, "2027-01-28", 1, "MONTH")).toBe(true);

      // February 2027 (28 days) -> Still due on the 28th!
      expect(isDiaryItemDueOnDate(start, "2027-02-28", 1, "MONTH")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2027-02-27", 1, "MONTH")).toBe(false);

      // March 2027 (31 days) -> Still due on the 28th!
      expect(isDiaryItemDueOnDate(start, "2027-03-28", 1, "MONTH")).toBe(true);

      // Dates before start date are not due
      expect(isDiaryItemDueOnDate(start, "2026-08-28", 1, "MONTH")).toBe(false);
    });

    it("clamps to month end when start day is 31st and month has fewer days", () => {
      const start = "2026-01-31"; // 31st

      // Jan 31 -> due
      expect(isDiaryItemDueOnDate(start, "2026-01-31", 1, "MONTH")).toBe(true);

      // Feb (28 days) -> due on Feb 28 (month-end)
      expect(isDiaryItemDueOnDate(start, "2026-02-28", 1, "MONTH")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-02-27", 1, "MONTH")).toBe(false);

      // Mar (31 days) -> due on Mar 31
      expect(isDiaryItemDueOnDate(start, "2026-03-31", 1, "MONTH")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-03-30", 1, "MONTH")).toBe(false);

      // Apr (30 days) -> due on Apr 30 (month-end)
      expect(isDiaryItemDueOnDate(start, "2026-04-30", 1, "MONTH")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-04-29", 1, "MONTH")).toBe(false);
    });

    it("clamps to month end when start day is 30th and month is February", () => {
      const start = "2026-04-30"; // 30th

      // Apr 30 -> due
      expect(isDiaryItemDueOnDate(start, "2026-04-30", 1, "MONTH")).toBe(true);

      // May 30 -> due on the 30th
      expect(isDiaryItemDueOnDate(start, "2026-05-30", 1, "MONTH")).toBe(true);

      // Feb 2027 (28 days) -> due on Feb 28
      expect(isDiaryItemDueOnDate(start, "2027-02-28", 1, "MONTH")).toBe(true);
    });

    it("supports multi-month interval (e.g. every 2 months)", () => {
      const start = "2026-09-28";
      expect(isDiaryItemDueOnDate(start, "2026-09-28", 2, "MONTH")).toBe(true);
      expect(isDiaryItemDueOnDate(start, "2026-10-28", 2, "MONTH")).toBe(false); // +1 month -> skip
      expect(isDiaryItemDueOnDate(start, "2026-11-28", 2, "MONTH")).toBe(true); // +2 months -> due
      expect(isDiaryItemDueOnDate(start, "2026-12-28", 2, "MONTH")).toBe(false);
      expect(isDiaryItemDueOnDate(start, "2027-01-28", 2, "MONTH")).toBe(true);
    });
  });
});
