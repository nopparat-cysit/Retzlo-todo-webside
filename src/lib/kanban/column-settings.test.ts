import { describe, expect, it } from "vitest";

import {
  columnIconOptions,
  columnSettingsSchema,
  columnStatusOptions,
  columnThemeOptions,
  getColumnIconOption,
  getColumnThemeOption
} from "@/lib/kanban/column-settings";

describe("column settings", () => {
  it("trims column names and accepts known color and icon ids", () => {
    const result = columnSettingsSchema.parse({
      name: "  Review  ",
      color: columnThemeOptions[1].id,
      icon: columnIconOptions[2].id
    });

    expect(result).toEqual({
      name: "Review",
      color: columnThemeOptions[1].id,
      icon: columnIconOptions[2].id,
      defaultCardStatus: "TODO"
    });
  });

  it("accepts every default card status for columns", () => {
    expect(columnStatusOptions.map((option) => option.value)).toEqual(["TODO", "DOING", "WAITING", "DONE"]);

    for (const option of columnStatusOptions) {
      const result = columnSettingsSchema.parse({
        name: `${option.label} lane`,
        color: "default",
        icon: "kanban",
        defaultCardStatus: option.value
      });

      expect(result.defaultCardStatus).toBe(option.value);
    }
  });

  it("rejects blank names, unknown colors, unknown icons, and unknown statuses", () => {
    expect(() =>
      columnSettingsSchema.parse({
        name: "   ",
        color: "mystery",
        icon: "unknown",
        defaultCardStatus: "MYSTERY"
      })
    ).toThrow();
  });

  it("falls back to default theme and icon for existing columns", () => {
    expect(getColumnThemeOption(null).id).toBe("default");
    expect(getColumnIconOption(undefined).id).toBe("kanban");
  });
});