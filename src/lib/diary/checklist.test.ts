import { describe, expect, it } from "vitest";

import {
  getDiaryChecklistSummary,
  isDiaryChecklistItemCompletedOnDate,
  isDiaryChecklistItemDueOnDate,
  normalizeDiaryChecklist,
  toggleDiaryChecklistCompletion
} from "@/lib/diary/checklist";

describe("diary checklist helpers", () => {
  it("normalizes scheduled checklist items from JSON", () => {
    expect(
      normalizeDiaryChecklist([
        {
          id: "item-1",
          label: "Drink water",
          description: "Morning habit",
          intervalDays: "3",
          startDate: "2026-06-01",
          dueTime: "09:30",
          completedDates: ["2026-06-04", "bad-date"]
        }
      ])
    ).toEqual([
      {
        id: "item-1",
        label: "Drink water",
        description: "Morning habit",
        intervalDays: 3,
        startDate: "2026-06-01",
        dueTime: "09:30",
        completedDates: ["2026-06-04"]
      }
    ]);
  });

  it("checks checklist recurrence per item", () => {
    const [item] = normalizeDiaryChecklist([
      { id: "item-1", label: "Clean desk", intervalDays: 3, startDate: "2026-06-01" }
    ]);

    expect(isDiaryChecklistItemDueOnDate(item, "2026-06-01")).toBe(true);
    expect(isDiaryChecklistItemDueOnDate(item, "2026-06-02")).toBe(false);
    expect(isDiaryChecklistItemDueOnDate(item, "2026-06-04")).toBe(true);
  });

  it("uses the parent diary start date when a checklist item has no valid start date", () => {
    expect(
      normalizeDiaryChecklist([{ id: "item-1", label: "Stretch", startDate: "bad-date" }], "2026-06-10")[0].startDate
    ).toBe("2026-06-10");
  });

  it("uses checklist item recurrence for the diary due summary before parent recurrence", () => {
    const summary = getDiaryChecklistSummary(
      {
        checklist: [{ id: "item-1", label: "Water plants", intervalDays: 3, startDate: "2026-06-01" }],
        intervalDays: 10,
        startDate: "2026-06-02"
      },
      "2026-06-04"
    );

    expect(summary).toMatchObject({
      hasChecklist: true,
      isDue: true,
      dueCount: 1,
      totalCount: 1
    });
  });

  it("falls back to the parent diary recurrence when no checklist items exist", () => {
    const summary = getDiaryChecklistSummary(
      {
        checklist: [],
        intervalDays: 3,
        startDate: "2026-06-01"
      },
      "2026-06-04"
    );

    expect(summary).toMatchObject({
      hasChecklist: false,
      isDue: true,
      dueCount: 1,
      totalCount: 0
    });
  });

  it("toggles completion for only the selected date", () => {
    const items = normalizeDiaryChecklist([
      { id: "item-1", label: "Read", intervalDays: 1, startDate: "2026-06-01" }
    ]);
    const checked = toggleDiaryChecklistCompletion(items, "item-1", "2026-06-21", true);

    expect(isDiaryChecklistItemCompletedOnDate(checked[0], "2026-06-21")).toBe(true);
    expect(isDiaryChecklistItemCompletedOnDate(checked[0], "2026-06-22")).toBe(false);
    expect(toggleDiaryChecklistCompletion(checked, "item-1", "2026-06-21", false)[0].completedDates).toEqual([]);
  });
});
