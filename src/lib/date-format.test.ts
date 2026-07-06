import { describe, expect, it } from "vitest";

import { formatMediumDateTime, formatShortDate, formatShortDue, formatTime } from "@/lib/date-format";

describe("date formatting", () => {
  it("formats dates with a stable locale and timezone", () => {
    expect(formatShortDate("2026-05-27T12:00:00.000Z")).toBe("May 27");
    expect(formatShortDue("2026-05-27T12:00:00.000Z", true)).toBe("May 27 - All day");
  });

  it("formats timed due dates without depending on the browser locale", () => {
    expect(formatTime("2026-05-27T12:00:00.000Z")).toBe("7:00 PM");
    expect(formatShortDue("2026-05-27T12:00:00.000Z", false)).toBe("May 27 - 7:00 PM");
  });

  it("does not emit mojibake separators", () => {
    const label = formatShortDue("2026-05-27T12:00:00.000Z", true);
    const mojibakeLead = String.fromCharCode(195);
    const mojibakeMarker = String.fromCharCode(194);

    expect(label).not.toContain(mojibakeLead);
    expect(label).not.toContain(mojibakeMarker);
  });

  it("formats medium date time labels consistently", () => {
    expect(formatMediumDateTime("2026-05-27T12:00:00.000Z", true)).toBe("May 27, 2026");
    expect(formatMediumDateTime("2026-05-27T12:00:00.000Z", false)).toBe("May 27, 2026, 7:00 PM");
  });
});
