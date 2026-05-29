import { describe, expect, it } from "vitest";

import {
  buildCalendarDays,
  filterCalendarItems,
  type CalendarFilterState,
  type CalendarViewMode,
  type UnifiedCalendarItem
} from "./view";

const baseFilters: CalendarFilterState = {
  showCards: true,
  showNotes: true,
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
});
