export type DiaryRepeatUnit = "DAY" | "MONTH";

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
