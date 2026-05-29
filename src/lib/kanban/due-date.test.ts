import { describe, expect, it } from "vitest";

import { applyDueShortcut, composeDueDate } from "./due-date";

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
});
