export const RETROD_LOCALE = "en-US";
export const RETROD_TIME_ZONE = "Asia/Bangkok";

const shortDateFormatter = new Intl.DateTimeFormat(RETROD_LOCALE, {
  month: "short",
  day: "numeric",
  timeZone: RETROD_TIME_ZONE
});

const mediumDateFormatter = new Intl.DateTimeFormat(RETROD_LOCALE, {
  dateStyle: "medium",
  timeZone: RETROD_TIME_ZONE
});

const weekdayFormatter = new Intl.DateTimeFormat(RETROD_LOCALE, {
  weekday: "short",
  timeZone: RETROD_TIME_ZONE
});

const diaryDateFormatter = new Intl.DateTimeFormat(RETROD_LOCALE, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: RETROD_TIME_ZONE
});

const timeFormatter = new Intl.DateTimeFormat(RETROD_LOCALE, {
  hour: "numeric",
  minute: "2-digit",
  timeZone: RETROD_TIME_ZONE
});

export function formatShortDate(value: string | Date | null | undefined): string {
  const date = toSafeDate(value);
  if (!date) return "";
  return shortDateFormatter.format(date);
}

export function formatWeekday(value: string | Date | null | undefined): string {
  const date = toSafeDate(value);
  if (!date) return "";
  return weekdayFormatter.format(date);
}

export function formatDiaryDate(value: string | Date | null | undefined): string {
  const date = toSafeDate(value);
  if (!date) return "";
  return diaryDateFormatter.format(date);
}

export function formatTime(value: string | Date | null | undefined): string {
  const date = toSafeDate(value);
  if (!date) return "";
  return timeFormatter.format(date);
}

export function formatMediumDate(value: string | Date | null | undefined): string {
  const date = toSafeDate(value);
  if (!date) return "";
  return mediumDateFormatter.format(date);
}

export function formatMediumDateTime(value: string | Date | null | undefined, allDay = false): string {
  const date = toSafeDate(value);
  if (!date) return "";

  if (allDay) return formatMediumDate(date);

  return `${formatMediumDate(date)}, ${formatTime(date)}`;
}

export function formatShortDue(value: string | Date | null | undefined, allDay: boolean): string {
  const date = toSafeDate(value);
  if (!date) return "";

  if (allDay) return `${formatShortDate(date)} - All day`;

  return `${formatShortDate(date)} - ${formatTime(date)}`;
}

export function toSafeDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDate(value: string | Date | null | undefined): Date {
  const date = toSafeDate(value);
  return date ?? new Date();
}
