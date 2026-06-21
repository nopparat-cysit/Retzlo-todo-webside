import { describe, expect, it } from "vitest";

import {
  columnIconOptions,
  columnSettingsSchema,
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
      icon: columnIconOptions[2].id
    });
  });

  it("rejects blank names, unknown colors, and unknown icons", () => {
    expect(() =>
      columnSettingsSchema.parse({
        name: "   ",
        color: "mystery",
        icon: "unknown"
      })
    ).toThrow();
  });

  it("falls back to default theme and icon for existing columns", () => {
    expect(getColumnThemeOption(null).id).toBe("default");
    expect(getColumnIconOption(undefined).id).toBe("kanban");
  });
});
