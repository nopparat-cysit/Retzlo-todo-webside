import { describe, expect, it } from "vitest";
import {
  isDiaryItemDueOnDate,
  getDaysInMonth,
  isWeeklyOrMonthlyDiary,
  isDailyDiary,
  shouldShowDiaryOnCalendarDate,
  normalizeDateKey
} from "./recurrence";

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

  describe("Calendar Future Date Filtering (shouldShowDiaryOnCalendarDate)", () => {
    const today = "2026-10-20";

    it("identifies weekly or monthly diaries vs day diaries", () => {
      expect(isWeeklyOrMonthlyDiary({ repeatUnit: "MONTH", intervalDays: 1 })).toBe(true);
      expect(isWeeklyOrMonthlyDiary({ repeatUnit: "MONTH", intervalDays: 3 })).toBe(true);
      expect(isWeeklyOrMonthlyDiary({ repeatUnit: "DAY", intervalDays: 7 })).toBe(true);
      expect(isWeeklyOrMonthlyDiary({ repeatUnit: "DAY", intervalDays: 14 })).toBe(true);

      expect(isWeeklyOrMonthlyDiary({ repeatUnit: "DAY", intervalDays: 1 })).toBe(false);
      expect(isWeeklyOrMonthlyDiary({ repeatUnit: "DAY", intervalDays: 3 })).toBe(false);
      expect(isWeeklyOrMonthlyDiary({ repeatUnit: "DAY", intervalDays: 6 })).toBe(false);

      expect(isDailyDiary({ repeatUnit: "DAY", intervalDays: 1 })).toBe(true);
      expect(isDailyDiary({ repeatUnit: "DAY", intervalDays: 3 })).toBe(true);
      expect(isDailyDiary({ repeatUnit: "DAY", intervalDays: 7 })).toBe(false);
      expect(isDailyDiary({ repeatUnit: "MONTH", intervalDays: 1 })).toBe(false);
    });

    it("always displays diary items on today and past dates", () => {
      const dailyDiary = { repeatUnit: "DAY" as const, intervalDays: 1 };
      const dailyCli = { repeatUnit: "DAY" as const, intervalDays: 1 };

      // Past date
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-18",
          todayDate: today,
          diary: dailyDiary,
          checklistItem: dailyCli
        })
      ).toBe(true);

      // Today
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-20",
          todayDate: today,
          diary: dailyDiary,
          checklistItem: dailyCli
        })
      ).toBe(true);
    });

    it("suppresses day diary items on future dates (dateKey > todayKey)", () => {
      const dailyDiary = { repeatUnit: "DAY" as const, intervalDays: 1 };
      const dailyCli = { repeatUnit: "DAY" as const, intervalDays: 1 };

      // Tomorrow (future)
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-21",
          todayDate: today,
          diary: dailyDiary,
          checklistItem: dailyCli
        })
      ).toBe(false);

      // Next week (future)
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-28",
          todayDate: today,
          diary: dailyDiary,
          checklistItem: dailyCli
        })
      ).toBe(false);

      // 3-day diary on future date
      const threeDayDiary = { repeatUnit: "DAY" as const, intervalDays: 3 };
      const threeDayCli = { repeatUnit: "DAY" as const, intervalDays: 3 };
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-23",
          todayDate: today,
          diary: threeDayDiary,
          checklistItem: threeDayCli
        })
      ).toBe(false);
    });

    it("allows weekly and monthly diary items to be displayed on future dates", () => {
      const weeklyDiary = { repeatUnit: "DAY" as const, intervalDays: 7 };
      const weeklyCli = { repeatUnit: "DAY" as const, intervalDays: 7 };

      // Weekly schedule on future date
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-27",
          todayDate: today,
          diary: weeklyDiary,
          checklistItem: weeklyCli
        })
      ).toBe(true);

      const monthlyDiary = { repeatUnit: "MONTH" as const, intervalDays: 1 };
      const monthlyCli = { repeatUnit: "MONTH" as const, intervalDays: 1 };

      // Monthly schedule on future date
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-28",
          todayDate: today,
          diary: monthlyDiary,
          checklistItem: monthlyCli
        })
      ).toBe(true);

      // Next month
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-11-28",
          todayDate: today,
          diary: monthlyDiary,
          checklistItem: monthlyCli
        })
      ).toBe(true);
    });

    it("displays future date when a monthly checklist item is inside a daily diary", () => {
      const dailyDiary = { repeatUnit: "DAY" as const, intervalDays: 1 };
      const monthlyCli = { repeatUnit: "MONTH" as const, intervalDays: 1 };

      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-28",
          todayDate: today,
          diary: dailyDiary,
          checklistItem: monthlyCli
        })
      ).toBe(true);
    });

    it("suppresses a daily checklist item on future date even if parent diary has intervalDays >= 7", () => {
      const longIntervalDiary = { repeatUnit: "DAY" as const, intervalDays: 30 };
      const dailyCli = { repeatUnit: "DAY" as const, intervalDays: 1 };

      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-21",
          todayDate: today,
          diary: longIntervalDiary,
          checklistItem: dailyCli
        })
      ).toBe(false);

      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-25",
          todayDate: today,
          diary: longIntervalDiary,
          checklistItem: dailyCli
        })
      ).toBe(false);
    });

    it("supports diary-level check with mixed checklist items", () => {
      const diaryWithChecklist = {
        repeatUnit: "DAY" as const,
        intervalDays: 30,
        startDate: "2026-09-11",
        checklist: [
          { label: "Daily 1", intervalDays: 1, repeatUnit: "DAY", startDate: "2026-09-11" },
          { label: "Daily 2", intervalDays: 1, repeatUnit: "DAY", startDate: "2026-09-11" },
          { label: "Weekly Friday", intervalDays: 7, repeatUnit: "DAY", startDate: "2026-09-11" },
          { label: "Monthly 25th", intervalDays: 1, repeatUnit: "MONTH", startDate: "2026-10-25" }
        ]
      };

      // 2026-10-21 (Wed): Only daily items are due -> should NOT show on future date!
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-21",
          todayDate: today,
          diary: diaryWithChecklist
        })
      ).toBe(false);

      // 2026-10-22 (Thu): Only daily items are due -> should NOT show on future date!
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-22",
          todayDate: today,
          diary: diaryWithChecklist
        })
      ).toBe(false);

      // 2026-10-23 (Fri): Weekly Friday item IS due -> SHOULD show on future date!
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-23",
          todayDate: today,
          diary: diaryWithChecklist
        })
      ).toBe(true);

      // 2026-10-24 (Sat): Only daily items are due -> should NOT show on future date!
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-24",
          todayDate: today,
          diary: diaryWithChecklist
        })
      ).toBe(false);

      // 2026-10-25 (Sun): Monthly 25th item IS due -> SHOULD show on future date!
      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-25",
          todayDate: today,
          diary: diaryWithChecklist
        })
      ).toBe(true);
    });

    it("supports diary-level check without checklistItem (dashboard calendar)", () => {
      const dailyDiary = { repeatUnit: "DAY" as const, intervalDays: 1 };
      const weeklyDiary = { repeatUnit: "DAY" as const, intervalDays: 7 };
      const monthlyDiary = { repeatUnit: "MONTH" as const, intervalDays: 1 };

      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-25",
          todayDate: today,
          diary: dailyDiary
        })
      ).toBe(false);

      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-10-27",
          todayDate: today,
          diary: weeklyDiary
        })
      ).toBe(true);

      expect(
        shouldShowDiaryOnCalendarDate({
          itemDate: "2026-11-20",
          todayDate: today,
          diary: monthlyDiary
        })
      ).toBe(true);
    });
  });
});
