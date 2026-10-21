import { describe, expect, it } from "vitest";

import {
  buildCalendarDays,
  filterCalendarItems,
  getCalendarSummary,
  type CalendarFilterState,
  type CalendarViewMode,
  type UnifiedCalendarItem
} from "./view";

const baseFilters: CalendarFilterState = {
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
  timeScope: "all"
};

const items: UnifiedCalendarItem[] = [
  {
    id: "card-1",
    type: "card",
    title: "Todo card",
    dueDate: "2026-05-19T12:00:00.000Z",
    dueDateAllDay: true,
    status: "TODO"
  },
  {
    id: "card-2",
    type: "card",
    title: "Done card",
    dueDate: "2026-05-20T10:30:00.000Z",
    dueDateAllDay: false,
    status: "DONE"
  },
  {
    id: "note-1",
    type: "note",
    title: "Starred note",
    dueDate: "2026-05-20T12:00:00.000Z",
    dueDateAllDay: true,
    isStarred: true
  },
  {
    id: "note-2",
    type: "note",
    title: "Plain note",
    dueDate: "2026-05-21T09:00:00.000Z",
    dueDateAllDay: false,
    isStarred: false
  }
];

describe("buildCalendarDays", () => {
  it("builds a 35-day month grid from the Sunday before the month", () => {
    const days = buildCalendarDays({
      anchorDate: "2026-05-27",
      mode: "month",
      customDays: 5
    });

    expect(days).toHaveLength(35);
    expect(days[0].key).toBe("2026-04-26");
    expect(days[34].key).toBe("2026-05-30");
  });

  it.each<[CalendarViewMode, number]>([
    ["day3", 3],
    ["day5", 5],
    ["week", 7],
    ["custom", 9]
  ])("builds %s ranges from the selected start date", (mode, length) => {
    const days = buildCalendarDays({
      anchorDate: "2026-05-19",
      mode,
      customDays: 9
    });

    expect(days).toHaveLength(length);
    expect(days[0].key).toBe("2026-05-19");
    expect(days.at(-1)?.key).toBe(`2026-05-${18 + length}`);
  });
});

describe("filterCalendarItems", () => {
  it("filters by item source, status, note scope, and time scope", () => {
    const filtered = filterCalendarItems(items, {
      ...baseFilters,
      showCards: true,
      showNotes: true,
      statuses: {
        TODO: false,
        DOING: false,
        WAITING: false,
        DONE: true
      },
      noteScope: "starred",
      timeScope: "timed"
    });

    expect(filtered.map((item) => item.id)).toEqual(["card-2"]);
  });

  it("keeps only starred notes when cards are hidden", () => {
    const filtered = filterCalendarItems(items, {
      ...baseFilters,
      showCards: false,
      noteScope: "starred"
    });

    expect(filtered.map((item) => item.id)).toEqual(["note-1"]);
  });

  it("filters diary checklist items according to showDiaryChecklist filter", () => {
    const itemsWithDiary: UnifiedCalendarItem[] = [
      ...items,
      {
        id: "diary-item-1",
        type: "diary_checklist",
        title: "Weekly Review",
        dueDate: "2026-05-20T09:00:00.000Z",
        dueDateAllDay: true,
        completed: false
      }
    ];

    const shown = filterCalendarItems(itemsWithDiary, {
      ...baseFilters,
      showCards: false,
      showNotes: false,
      showDiaryChecklist: true
    });
    expect(shown.map((i) => i.id)).toEqual(["diary-item-1"]);

    const hidden = filterCalendarItems(itemsWithDiary, {
      ...baseFilters,
      showCards: false,
      showNotes: false,
      showDiaryChecklist: false
    });
    expect(hidden).toEqual([]);
  });

  it("filters items by keyword search query", () => {
    const searchMatch = filterCalendarItems(items, {
      ...baseFilters,
      searchQuery: "starred"
    });
    expect(searchMatch.map((i) => i.id)).toEqual(["note-1"]);

    const multiMatch = filterCalendarItems(items, {
      ...baseFilters,
      searchQuery: "card"
    });
    expect(multiMatch.map((i) => i.id)).toEqual(["card-1", "card-2"]);
  });

  it("filters cards by assigned user IDs and excludes notes/diaries", () => {
    const itemsWithAssignees: UnifiedCalendarItem[] = [
      {
        id: "card-user-1",
        type: "card",
        title: "User 1 task",
        dueDate: "2026-05-20T10:00:00.000Z",
        dueDateAllDay: true,
        status: "TODO",
        assigneeIds: ["user-1", "user-2"]
      },
      {
        id: "card-user-2",
        type: "card",
        title: "User 2 only task",
        dueDate: "2026-05-20T11:00:00.000Z",
        dueDateAllDay: true,
        status: "TODO",
        assigneeIds: ["user-2"]
      },
      {
        id: "note-alone",
        type: "note",
        title: "Note without assignees",
        dueDate: "2026-05-20T12:00:00.000Z",
        dueDateAllDay: true,
        isStarred: false
      }
    ];

    const user1Only = filterCalendarItems(itemsWithAssignees, {
      ...baseFilters,
      assigneeIds: ["user-1"]
    });
    expect(user1Only.map((i) => i.id)).toEqual(["card-user-1"]);

    const user2Only = filterCalendarItems(itemsWithAssignees, {
      ...baseFilters,
      assigneeIds: ["user-2"]
    });
    expect(user2Only.map((i) => i.id)).toEqual(["card-user-1", "card-user-2"]);
  });

  it("filters cards by priority", () => {
    const itemsWithPriority: UnifiedCalendarItem[] = [
      {
        id: "card-high",
        type: "card",
        title: "High priority task",
        dueDate: "2026-05-20T10:00:00.000Z",
        dueDateAllDay: true,
        status: "TODO",
        priority: "HIGH"
      },
      {
        id: "card-low",
        type: "card",
        title: "Low priority task",
        dueDate: "2026-05-20T11:00:00.000Z",
        dueDateAllDay: true,
        status: "TODO",
        priority: "LOW"
      }
    ];

    const highOnly = filterCalendarItems(itemsWithPriority, {
      ...baseFilters,
      priorities: {
        URGENT: true,
        HIGH: true,
        MEDIUM: true,
        LOW: false
      }
    });
    expect(highOnly.map((i) => i.id)).toEqual(["card-high"]);
  });
});

describe("getCalendarSummary", () => {
  it("counts visible items, unique focus days, and completed cards", () => {
    const summary = getCalendarSummary(items, [
      { key: "2026-05-19" },
      { key: "2026-05-20" },
      { key: "2026-05-21" }
    ]);

    expect(summary).toEqual({ total: 4, focusDays: 3, completed: 1 });
  });
});
