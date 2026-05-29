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
