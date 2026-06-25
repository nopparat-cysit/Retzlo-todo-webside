function toUtcDay(value: string | Date) {
  const date =
    typeof value === "string"
      ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
      : new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function isDiaryItemDueOnDate(startDate: string | Date, selectedDate: string | Date, intervalDays: number) {
  if (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365) {
    return false;
  }

  const start = toUtcDay(startDate);
  const selected = toUtcDay(selectedDate);
  const diffDays = Math.floor((selected - start) / 86_400_000);

  return diffDays >= 0 && diffDays % intervalDays === 0;
}
