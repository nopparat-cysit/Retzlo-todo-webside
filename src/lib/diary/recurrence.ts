export type DiaryRepeatUnit = "DAY" | "MONTH" | "ONCE";

interface UtcDateParts {
  time: number;
  year: number;
  month: number;
  day: number;
}

function toUtcDayParts(value: string | Date): UtcDateParts {
  const date =
    typeof value === "string"
      ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
      : new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));

  return {
    time: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(), // 0 to 11
    day: date.getUTCDate() // 1 to 31
  };
}

/**
 * Returns the number of days in the specified month (1-31).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Checks whether a recurring diary item is scheduled / due on `selectedDate`.
 *
 * - When `repeatUnit === "DAY"`: repeats every `intervalDays` days from `startDate`.
 * - When `repeatUnit === "MONTH"`: repeats every `intervalDays` months on the same day of the month
 *   as `startDate` (e.g. every 28th of every month).
 *   If the month has fewer days than `startDate`'s day (e.g. day 31 in Feb or Apr),
 *   it falls on the last day of that month.
 */
export function isDiaryItemDueOnDate(
  startDate: string | Date,
  selectedDate: string | Date,
  intervalDays: number,
  repeatUnit: DiaryRepeatUnit = "DAY"
): boolean {
  if (repeatUnit === "ONCE") {
    const start = toUtcDayParts(startDate);
    const selected = toUtcDayParts(selectedDate);
    return selected.time === start.time;
  }

  if (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365) {
    return false;
  }

  const start = toUtcDayParts(startDate);
  const selected = toUtcDayParts(selectedDate);

  // If selectedDate is before startDate, it's not due yet
  if (selected.time < start.time) {
    return false;
  }

  if (repeatUnit === "MONTH") {
    const monthDiff = (selected.year - start.year) * 12 + (selected.month - start.month);
    if (monthDiff < 0 || monthDiff % intervalDays !== 0) {
      return false;
    }

    const maxDayInMonth = getDaysInMonth(selected.year, selected.month);
    // If startDate's day-of-month is higher than max days in selected month (e.g. 31 in Feb),
    // clamp to the last day of this month. Otherwise, exact match on the day.
    const targetDay = Math.min(start.day, maxDayInMonth);
    return selected.day === targetDay;
  }

  // Default: DAY repeat
  const diffDays = Math.floor((selected.time - start.time) / 86_400_000);
  return diffDays >= 0 && diffDays % intervalDays === 0;
}

/**
 * Normalizes a string or Date object into a YYYY-MM-DD date key without timezone shifting.
 */
export function normalizeDateKey(value: string | Date): string {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${parsed.getFullYear()}-${month}-${day}`;
    }
    return value;
  }
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

/**
 * Returns true if a diary schedule is weekly (intervalDays >= 7) or monthly (repeatUnit === "MONTH").
 */
export function isWeeklyOrMonthlyDiary(item: {
  repeatUnit?: DiaryRepeatUnit | string | null;
  intervalDays?: number | null;
}): boolean {
  if (item.repeatUnit === "MONTH" || item.repeatUnit === "ONCE") {
    return true;
  }
  const interval = typeof item.intervalDays === "number" ? item.intervalDays : 1;
  return interval >= 7;
}

/**
 * Returns true if a diary schedule is a day diary (repeatUnit !== "MONTH" and intervalDays < 7).
 */
export function isDailyDiary(item: {
  repeatUnit?: DiaryRepeatUnit | string | null;
  intervalDays?: number | null;
}): boolean {
  return !isWeeklyOrMonthlyDiary(item);
}

function isChecklistItemWeeklyOrMonthlyDue(
  item: unknown,
  itemKey: string,
  fallbackStartDate?: string | Date
): boolean {
  if (!item || typeof item !== "object") return false;
  const entry = item as Record<string, unknown>;
  const repeatUnit = entry.repeatUnit === "MONTH" ? "MONTH" : "DAY";
  const intervalDays = typeof entry.intervalDays === "number" ? entry.intervalDays : 1;

  const isWeeklyOrMonthly = repeatUnit === "MONTH" || intervalDays >= 7;
  if (!isWeeklyOrMonthly) {
    return false;
  }

  const startDate =
    typeof entry.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.startDate)
      ? entry.startDate
      : fallbackStartDate ?? "1970-01-01";

  return isDiaryItemDueOnDate(startDate, itemKey, intervalDays, repeatUnit);
}

/**
 * Determines whether a diary item / checklist item should be displayed on a calendar date.
 *
 * Rule:
 * - If the date has arrived (itemDate <= todayDate), always display.
 * - If the date is in the future (itemDate > todayDate):
 *   - Day diary items (daily or interval < 7 days) are strictly suppressed until that day arrives.
 *   - Weekly (interval >= 7 days) and monthly (repeatUnit === "MONTH") schedules ARE displayed.
 */
export function shouldShowDiaryOnCalendarDate(options: {
  itemDate: string | Date;
  todayDate?: string | Date;
  diary?: {
    repeatUnit?: DiaryRepeatUnit | string | null;
    intervalDays?: number | null;
    checklist?: unknown;
    startDate?: string | Date;
  } | null;
  checklistItem?: {
    repeatUnit?: DiaryRepeatUnit | string | null;
    intervalDays?: number | null;
  } | null;
}): boolean {
  const itemKey = normalizeDateKey(options.itemDate);
  const todayKey = normalizeDateKey(options.todayDate ?? new Date());

  if (!itemKey || !todayKey) {
    return true;
  }

  // Today and past dates always display
  if (itemKey <= todayKey) {
    return true;
  }

  // Once-off items (Todo) scheduled for this exact future date should ALWAYS display
  if (options.checklistItem?.repeatUnit === "ONCE" || options.diary?.repeatUnit === "ONCE") {
    return true;
  }

  // Future date (itemKey > todayKey):
  // 1. If evaluating a specific checklist item, its OWN schedule is authoritative.
  // Daily checklist items (< 7 days and repeatUnit !== "MONTH") must NEVER display on future dates!
  if (options.checklistItem) {
    return isWeeklyOrMonthlyDiary(options.checklistItem);
  }

  // 2. If evaluating at the diary container level (without a specific checklist item):
  if (options.diary) {
    const checklist = Array.isArray(options.diary.checklist) ? options.diary.checklist : [];
    if (checklist.length > 0) {
      // If the diary contains checklist items, it should only appear on a future date
      // if at least one weekly or monthly checklist item is due on that date.
      return checklist.some((cli) =>
        isChecklistItemWeeklyOrMonthlyDue(cli, itemKey, options.diary?.startDate)
      );
    }

    // If it has no checklist items, check the diary's own recurrence
    return isWeeklyOrMonthlyDiary(options.diary);
  }

  return false;
}
