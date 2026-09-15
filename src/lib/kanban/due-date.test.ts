import { describe, expect, it } from "vitest";

import {
  applyDueShortcut,
  composeDueDate,
  composeStartDate,
  extractStartDate,
  extractStartDateAllDay,
  formatCardDateRange,
  withStartDate
} from "./due-date";

describe("due date helpers", () => {
  it("sets tomorrow from a base date", () => {
    expect(applyDueShortcut("tomorrow", new Date("2026-05-22T08:00:00.000Z"))).toBe("2026-05-23");
  });

  it("sets next week from a base date", () => {
    expect(applyDueShortcut("next-week", new Date("2026-05-22T08:00:00.000Z"))).toBe("2026-05-29");
  });

  it("treats a date without time as all day", () => {
    expect(composeDueDate("2026-05-22", "")).toEqual({
      dueDate: "2026-05-22T12:00:00.000Z",
      dueDateAllDay: true
    });
  });

  it("keeps date with time as timed", () => {
    expect(composeDueDate("2026-05-22", "09:30").dueDateAllDay).toBe(false);
  });

  it("composes startDate with and without time", () => {
    expect(composeStartDate("2026-05-20", "")).toEqual({
      startDate: "2026-05-20T12:00:00.000Z",
      startDateAllDay: true
    });
    expect(composeStartDate("2026-05-20", "10:00").startDateAllDay).toBe(false);
    expect(composeStartDate("", "")).toEqual({
      startDate: null,
      startDateAllDay: false
    });
  });

  it("extracts and updates startDate in privateCoins safely", () => {
    expect(extractStartDate(null)).toBeNull();
    expect(extractStartDate({ startDate: "2026-05-20T12:00:00.000Z" })).toBe("2026-05-20T12:00:00.000Z");
    expect(extractStartDateAllDay({ startDateAllDay: true })).toBe(true);
    expect(extractStartDateAllDay({})).toBe(false);

    const coinsWithStart = withStartDate({ difficulty: 5 }, "2026-05-20T12:00:00.000Z", true);
    expect(coinsWithStart).toMatchObject({
      difficulty: 5,
      startDate: "2026-05-20T12:00:00.000Z",
      startDateAllDay: true
    });

    const clearedCoins = withStartDate(coinsWithStart, null);
    expect(clearedCoins.startDate).toBeUndefined();
    expect(clearedCoins.startDateAllDay).toBeUndefined();
    expect(clearedCoins.difficulty).toBe(5);
  });

  it("formats card date range properly", () => {
    const formatMock = (val: string | Date) => new Date(val).toISOString().slice(5, 10);

    expect(
      formatCardDateRange({
        startDate: "2026-05-20T12:00:00.000Z",
        dueDate: "2026-05-25T12:00:00.000Z",
        formatFn: formatMock
      })
    ).toBe("05-20 → 05-25");

    expect(
      formatCardDateRange({
        startDate: "2026-05-20T12:00:00.000Z",
        formatFn: formatMock
      })
    ).toBe("เริ่ม: 05-20");

    expect(
      formatCardDateRange({
        dueDate: "2026-05-25T12:00:00.000Z",
        formatFn: formatMock
      })
    ).toBe("05-25");

    expect(formatCardDateRange({})).toBe("");
  });
});
