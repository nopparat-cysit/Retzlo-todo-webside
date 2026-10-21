import type { CardStatus } from "@/types/kanban";

export type CalendarViewMode = "month" | "day3" | "day5" | "week" | "custom";
export type CalendarNoteScope = "all" | "starred" | "plain";
export type CalendarTimeScope = "all" | "allDay" | "timed";

export interface CalendarFilterState {
  showCards: boolean;
  showNotes: boolean;
  showDiaryChecklist: boolean;
  statuses: Record<CardStatus, boolean>;
  noteScope: CalendarNoteScope;
  timeScope: CalendarTimeScope;
  searchQuery?: string;
  priorities?: Record<string, boolean>;
  assigneeIds?: string[];
}

export interface CalendarDay {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
}

export type UnifiedCalendarItem =
  | {
      id: string;
      type: "card";
      title: string;
      dueDate: string;
      dueDateAllDay: boolean;
      status: CardStatus;
      priority?: string;
      assigneeIds?: string[];
      description?: string | null;
      note?: string | null;
    }
  | {
      id: string;
      type: "note";
      title: string;
      dueDate: string;
      dueDateAllDay: boolean;
      isStarred: boolean;
      content?: string | null;
    }
  | {
      id: string;
      type: "diary_checklist";
      title: string;
      dueDate: string;
      dueDateAllDay: boolean;
      completed: boolean;
    };

export const defaultCalendarFilters: CalendarFilterState = {
  showCards: true,
  showNotes: true,
  showDiaryChecklist: true,
  statuses: {
    TODO: true,
    DOING: true,
    WAITING: true,
    DONE: true
  },
  noteScope: "all",
  timeScope: "all",
  searchQuery: "",
  priorities: {
    URGENT: true,
    HIGH: true,
    MEDIUM: true,
    LOW: true
  },
  assigneeIds: []
};

export function buildCalendarDays({
  anchorDate,
  mode,
  customDays
}: {
  anchorDate: string;
  mode: CalendarViewMode;
  customDays: number;
}): CalendarDay[] {
  const anchor = parseDateKey(anchorDate);

  if (mode === "month") {
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return buildDays(gridStart, 35, anchor.getMonth());
  }

  const length = mode === "day3" ? 3 : mode === "day5" ? 5 : mode === "week" ? 7 : clampDays(customDays);

  return buildDays(anchor, length, anchor.getMonth());
}

export function filterCalendarItems<T extends UnifiedCalendarItem>(items: T[], filters: CalendarFilterState): T[] {
  const query = (filters.searchQuery || "").trim().toLowerCase();
  const filterAssignees = Boolean(filters.assigneeIds && filters.assigneeIds.length > 0);
  const anyPriorityDisabled = Boolean(filters.priorities && Object.values(filters.priorities).some((val) => !val));

  return items.filter((item) => {
    // 1. Keyword search (checks title, and description/content if present)
    if (query) {
      const titleMatch = item.title.toLowerCase().includes(query);
      let contentMatch = false;
      if (item.type === "note" && "content" in item && item.content) {
        contentMatch = item.content.toLowerCase().includes(query);
      } else if (item.type === "card") {
        if ("description" in item && item.description) {
          contentMatch = item.description.toLowerCase().includes(query);
        }
        if (!contentMatch && "note" in item && item.note) {
          contentMatch = item.note.toLowerCase().includes(query);
        }
      }
      if (!titleMatch && !contentMatch) return false;
    }

    // 2. Type-specific checks
    if (item.type === "card") {
      if (!filters.showCards || !filters.statuses[item.status]) return false;

      // Assignee Filter
      if (filterAssignees) {
        const itemAssignees = ("assigneeIds" in item && Array.isArray(item.assigneeIds)) ? item.assigneeIds : [];
        const matchesAssignee = filters.assigneeIds!.some((id) => itemAssignees.includes(id));
        if (!matchesAssignee) return false;
      }

      // Priority Filter
      if (anyPriorityDisabled && filters.priorities) {
        const cardPriority = ("priority" in item && item.priority ? item.priority : "MEDIUM").toUpperCase();
        if (filters.priorities[cardPriority] === false) {
          return false;
        }
      }
    }

    if (item.type === "note") {
      if (!filters.showNotes) return false;
      if (filterAssignees) return false;
      if (filters.noteScope === "starred" && !item.isStarred) return false;
      if (filters.noteScope === "plain" && item.isStarred) return false;
    }

    if (item.type === "diary_checklist") {
      if (!filters.showDiaryChecklist) return false;
      if (filterAssignees) return false;
    }

    // 3. Time scope checks
    if (filters.timeScope === "allDay" && !item.dueDateAllDay) return false;
    if (filters.timeScope === "timed" && item.dueDateAllDay) return false;

    return true;
  });
}

export function groupCalendarItems<T extends UnifiedCalendarItem>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = toDateKey(item.dueDate);
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});
}

export function getCalendarSummary(
  items: UnifiedCalendarItem[],
  days: Array<{ key: string }>
) {
  const visibleKeys = new Set(days.map((day) => day.key));
  const visibleItems = items.filter((item) => visibleKeys.has(toDateKey(item.dueDate)));

  return {
    total: visibleItems.length,
    focusDays: new Set(visibleItems.map((item) => toDateKey(item.dueDate))).size,
    completed: visibleItems.filter((item) => item.type === "card" && item.status === "DONE").length
  };
}

export function toDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function shiftDateKey(value: string, days: number): string {
  const date = parseDateKey(value);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function buildDays(start: Date, length: number, currentMonth: number): CalendarDay[] {
  return Array.from({ length }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      key: toDateKey(date),
      isCurrentMonth: date.getMonth() === currentMonth
    };
  });
}

function parseDateKey(value: string): Date {
  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function clampDays(value: number): number {
  if (!Number.isFinite(value)) return 5;

  return Math.min(14, Math.max(1, Math.trunc(value)));
}
