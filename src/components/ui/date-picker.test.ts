import { describe, expect, it } from "vitest";
import {
  formatDateToISO,
  formatDisplayDateShort,
  formatDisplayDateThai,
  parseDateString
} from "@/components/ui/date-picker";
import { formatDisplayTime, parseTimeString } from "@/components/ui/time-picker";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Custom DatePicker and TimePicker logic and contracts", () => {
  it("correctly parses date strings in multiple formats", () => {
    expect(parseDateString("2026-10-03")).toEqual({ year: 2026, month: 9, day: 3 });
    expect(parseDateString("2026-10-03T14:30:00.000Z")).toEqual({ year: 2026, month: 9, day: 3 });
    expect(parseDateString("")).toBeNull();
    expect(parseDateString(null)).toBeNull();
    expect(parseDateString("invalid")).toBeNull();
  });

  it("correctly formats date to ISO YYYY-MM-DD", () => {
    expect(formatDateToISO(2026, 9, 3)).toBe("2026-10-03");
    expect(formatDateToISO(2026, 0, 15)).toBe("2026-01-15");
  });

  it("formats display dates for Thai and short formats", () => {
    expect(formatDisplayDateShort("2026-10-03")).toBe("03/10/2026");
    expect(formatDisplayDateThai("2026-10-03")).toBe("3 ตุลาคม 2026");
    expect(formatDisplayDateShort("")).toBe("");
  });

  it("correctly parses time strings", () => {
    expect(parseTimeString("14:30")).toEqual({ hour: "14", minute: "30" });
    expect(parseTimeString("09:05")).toEqual({ hour: "09", minute: "05" });
    expect(parseTimeString("9:5")).toEqual({ hour: "09", minute: "05" });
    expect(parseTimeString("")).toBeNull();
    expect(parseTimeString("invalid")).toBeNull();
    expect(parseTimeString("25:00")).toBeNull();
  });

  it("formats display time correctly", () => {
    expect(formatDisplayTime("14:30")).toBe("14:30 น.");
    expect(formatDisplayTime("09:00")).toBe("09:00 น.");
    expect(formatDisplayTime("")).toBe("");
  });

  it("verifies global DatePicker component implementation contract", () => {
    const src = readFileSync(join(process.cwd(), "src/components/ui/date-picker.tsx"), "utf8");
    expect(src).toContain("export function DatePicker");
    expect(src).toContain("export function CalendarView");
    expect(src).toContain("MONTH_NAMES_TH");
    expect(src).toContain("WEEKDAY_NAMES");
    expect(src).toContain("showShortcuts");
    expect(src).toContain("today");
    expect(src).toContain("tomorrow");
    expect(src).toContain("next-week");
  });

  it("verifies global TimePicker component implementation contract", () => {
    const src = readFileSync(join(process.cwd(), "src/components/ui/time-picker.tsx"), "utf8");
    expect(src).toContain("export function TimePicker");
    expect(src).toContain("export function TimeView");
    expect(src).toContain("HOURS");
    expect(src).toContain("MINUTES");
    expect(src).toContain("PRESET_TIMES");
  });

  it("verifies global DateTimePicker component implementation contract", () => {
    const src = readFileSync(join(process.cwd(), "src/components/ui/date-time-picker.tsx"), "utf8");
    expect(src).toContain("export function DateTimePicker");
    expect(src).toContain("setActiveTab");
    expect(src).toContain("CalendarView");
    expect(src).toContain("TimeView");
  });

  it("verifies DateTimeField has been upgraded to use custom pickers instead of native browser inputs", () => {
    const src = readFileSync(join(process.cwd(), "src/components/ui/date-time-field.tsx"), "utf8");
    expect(src).toContain("<DatePicker");
    expect(src).toContain("<TimePicker");
    expect(src).not.toContain('type="date"');
    expect(src).not.toContain('type="time"');
  });

  it("verifies DatePicker and TimePicker support form name and required props", () => {
    const dateSrc = readFileSync(join(process.cwd(), "src/components/ui/date-picker.tsx"), "utf8");
    expect(dateSrc).toContain("name?: string");
    expect(dateSrc).toContain("required?: boolean");
    expect(dateSrc).toContain('type="hidden"');

    const timeSrc = readFileSync(join(process.cwd(), "src/components/ui/time-picker.tsx"), "utf8");
    expect(timeSrc).toContain("name?: string");
    expect(timeSrc).toContain("required?: boolean");
    expect(timeSrc).toContain('type="hidden"');
  });

  it("verifies system-wide modules use unified DatePicker and TimePicker without native inputs", () => {
    const diaryChecklist = readFileSync(join(process.cwd(), "src/components/diary/diary-checklist.tsx"), "utf8");
    expect(diaryChecklist).toContain("<DatePicker");
    expect(diaryChecklist).toContain("<TimePicker");
    expect(diaryChecklist).not.toContain('type="date"');
    expect(diaryChecklist).not.toContain('type="time"');

    const diaryListPanel = readFileSync(join(process.cwd(), "src/components/diary/diary-list-panel.tsx"), "utf8");
    expect(diaryListPanel).toContain("<DatePicker");
    expect(diaryListPanel).not.toContain('type="date"');

    const diaryTodo = readFileSync(join(process.cwd(), "src/components/diary/diary-todo.tsx"), "utf8");
    expect(diaryTodo).toContain("<DatePicker");
    expect(diaryTodo).not.toContain('type="date"');

    const diaryHub = readFileSync(join(process.cwd(), "src/components/hub/diary-hub-panel.tsx"), "utf8");
    expect(diaryHub).toContain("<DatePicker");
    expect(diaryHub).not.toContain('type="date"');

    const fabHub = readFileSync(join(process.cwd(), "src/components/hub/fab-hub.tsx"), "utf8");
    expect(fabHub).toContain("<DatePicker");
    expect(fabHub).toContain("<TimePicker");
    expect(fabHub).not.toContain('type="date"');
    expect(fabHub).not.toContain('type="time"');

    const quickHub = readFileSync(join(process.cwd(), "src/components/project/project-quick-hub.tsx"), "utf8");
    expect(quickHub).toContain("<DatePicker");
    expect(quickHub).not.toContain('type="date"');
  });
});
