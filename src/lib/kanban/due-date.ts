export type DueShortcut = "today" | "tomorrow" | "next-week" | "clear";

export function applyDueShortcut(shortcut: DueShortcut, from = new Date()): string {
  if (shortcut === "clear") {
    return "";
  }

  const date = new Date(from);

  if (shortcut === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  if (shortcut === "next-week") {
    date.setDate(date.getDate() + 7);
  }

  return date.toISOString().slice(0, 10);
}

export function composeDueDate(date: string, time: string): { dueDate: string | null; dueDateAllDay: boolean } {
  if (!date) {
    return {
      dueDate: null,
      dueDateAllDay: false
    };
  }

  if (!time) {
    return {
      dueDate: new Date(`${date}T12:00:00.000Z`).toISOString(),
      dueDateAllDay: true
    };
  }

  return {
    dueDate: new Date(`${date}T${time}:00.000`).toISOString(),
    dueDateAllDay: false
  };
}

export function composeStartDate(date: string, time: string): { startDate: string | null; startDateAllDay: boolean } {
  if (!date) {
    return {
      startDate: null,
      startDateAllDay: false
    };
  }

  if (!time) {
    return {
      startDate: new Date(`${date}T12:00:00.000Z`).toISOString(),
      startDateAllDay: true
    };
  }

  return {
    startDate: new Date(`${date}T${time}:00.000`).toISOString(),
    startDateAllDay: false
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function extractStartDate(privateCoins: unknown): string | null {
  if (!isRecord(privateCoins) || typeof privateCoins.startDate !== "string" || !privateCoins.startDate.trim()) {
    return null;
  }
  return privateCoins.startDate.trim();
}

export function extractStartDateAllDay(privateCoins: unknown): boolean {
  if (!isRecord(privateCoins)) {
    return false;
  }
  return Boolean(privateCoins.startDateAllDay);
}

export function withStartDate(
  privateCoins: unknown,
  startDate: string | null | undefined,
  startDateAllDay = false
): Record<string, unknown> {
  const next = isRecord(privateCoins) ? { ...privateCoins } : {};

  if (!startDate || typeof startDate !== "string" || !startDate.trim()) {
    delete next.startDate;
    delete next.startDateAllDay;
    return next;
  }

  next.startDate = startDate.trim();
  next.startDateAllDay = Boolean(startDateAllDay);
  return next;
}

export function formatCardDateRange(params: {
  startDate?: string | null;
  startDateAllDay?: boolean;
  dueDate?: string | null;
  dueDateAllDay?: boolean;
  formatFn?: (value: string | Date, allDay?: boolean) => string;
}): string {
  const { startDate, startDateAllDay = false, dueDate, dueDateAllDay = false, formatFn } = params;
  const format = formatFn ?? ((val, allDay) => {
    const d = new Date(val);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (allDay) return dateStr;
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${dateStr}, ${timeStr}`;
  });

  if (startDate && dueDate) {
    return `${format(startDate, startDateAllDay)} → ${format(dueDate, dueDateAllDay)}`;
  }
  if (startDate) {
    return `เริ่ม: ${format(startDate, startDateAllDay)}`;
  }
  if (dueDate) {
    return format(dueDate, dueDateAllDay);
  }
  return "";
}
