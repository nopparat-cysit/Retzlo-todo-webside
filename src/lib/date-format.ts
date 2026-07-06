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

export function formatShortDate(value: string | Date): string {
  return shortDateFormatter.format(toDate(value));
}

export function formatWeekday(value: string | Date): string {
  return weekdayFormatter.format(toDate(value));
}

export function formatDiaryDate(value: string | Date): string {
  return diaryDateFormatter.format(toDate(value));
}

export function formatTime(value: string | Date): string {
  return timeFormatter.format(toDate(value));
}

export function formatMediumDate(value: string | Date): string {
  return mediumDateFormatter.format(toDate(value));
}

export function formatMediumDateTime(value: string | Date, allDay = false): string {
  const date = toDate(value);

  if (allDay) return formatMediumDate(date);

  return `${formatMediumDate(date)}, ${formatTime(date)}`;
}

export function formatShortDue(value: string | Date | null, allDay: boolean): string {
  if (!value) return "";

  if (allDay) return `${formatShortDate(value)} - All day`;

  return `${formatShortDate(value)} - ${formatTime(value)}`;
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}
