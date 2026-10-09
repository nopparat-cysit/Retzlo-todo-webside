import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  formatDisplayTime,
  HOURS,
  MINUTES,
  parseTimeString,
  PRESET_TIMES
} from "@/components/ui/time-picker";

describe("Intuitive TimePicker & TimeView Redesign", () => {
  it("handles parseTimeString and formatDisplayTime correctly", () => {
    expect(parseTimeString("08:35")).toEqual({ hour: "08", minute: "35" });
    expect(parseTimeString("0:0")).toEqual({ hour: "00", minute: "00" });
    expect(parseTimeString("23:59")).toEqual({ hour: "23", minute: "59" });
    expect(parseTimeString("24:00")).toBeNull();
    expect(parseTimeString("12:60")).toBeNull();
    expect(parseTimeString(null)).toBeNull();

    expect(formatDisplayTime("08:35")).toBe("08:35");
    expect(formatDisplayTime("")).toBe("");
  });

  it("exports standard 24 hours and 5-minute interval minutes", () => {
    expect(HOURS).toHaveLength(24);
    expect(HOURS[0]).toBe("00");
    expect(HOURS[23]).toBe("23");

    expect(MINUTES).toContain("00");
    expect(MINUTES).toContain("15");
    expect(MINUTES).toContain("30");
    expect(MINUTES).toContain("45");
  });

  it("exports rich preset times with icons", () => {
    expect(PRESET_TIMES.length).toBeGreaterThanOrEqual(5);
    expect(PRESET_TIMES.some((p) => p.time === "09:00")).toBe(true);
    expect(PRESET_TIMES.some((p) => p.time === "12:00")).toBe(true);
    expect(PRESET_TIMES.some((p) => p.time === "17:00")).toBe(true);
  });

  it("verifies TimeView has direct typeable inputs, single-column scrollers, and confirmation button", () => {
    const src = readFileSync(new URL("./time-picker.tsx", import.meta.url), "utf8");

    // Must have interactive numeric inputs
    expect(src).toContain('inputMode="numeric"');
    expect(src).toContain("handleHourInputChange");
    expect(src).toContain("handleMinuteInputChange");
    expect(src).toContain("stepHour");
    expect(src).toContain("stepMinute");

    // Must have single-column scrollers (flex-col, not grid-cols-2 in list)
    expect(src).toContain("hourListRef");
    expect(src).toContain("minuteListRef");
    expect(src).toContain("scrollIntoView");

    // Must have explicit confirmation button
    expect(src).toContain("onConfirm");
    expect(src).toContain("Confirm");
    expect(src).toContain("All Day / Clear");
  });
});
