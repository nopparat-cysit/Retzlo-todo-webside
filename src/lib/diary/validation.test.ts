import { describe, expect, it } from "vitest";

import { parseCreateDiaryItemPayload, parseUpdateDiaryItemPayload } from "@/lib/diary/validation";

describe("diary validation", () => {
  it("uses the diary start date for checklist items without their own start date", () => {
    const payload = parseCreateDiaryItemPayload({
      title: "Morning routine",
      description: "",
      color: "DEFAULT",
      intervalDays: 1,
      startDate: "2026-06-22",
      checklist: [{ id: "item-1", label: "Drink water", intervalDays: 1 }],
      isStarred: false,
      isHidden: false
    });

    expect(payload.checklist[0].startDate).toBe("2026-06-22");
  });

  it("uses the existing diary start date when updating checklist only", () => {
    const payload = parseUpdateDiaryItemPayload(
      {
        checklist: [{ id: "item-1", label: "Read", intervalDays: 7 }]
      },
      "2026-06-10"
    );

    expect(payload.checklist?.[0].startDate).toBe("2026-06-10");
  });
});
