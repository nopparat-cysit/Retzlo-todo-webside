import { describe, expect, it } from "vitest";

import { DEFAULT_PROJECT_STICKER, parseProjectAppearancePayload } from "@/lib/projects/appearance";

describe("project appearance validation", () => {
  it("accepts supported theme colors and shared sticker paths", () => {
    expect(
      parseProjectAppearancePayload({
        themeColor: "AMBER",
        sticker: "/stickers/retro/retro-sticker-13-project-folder.png"
      })
    ).toEqual({
      themeColor: "AMBER",
      sticker: "/stickers/retro/retro-sticker-13-project-folder.png"
    });
  });

  it("defaults blank project appearance values", () => {
    expect(parseProjectAppearancePayload({})).toEqual({
      themeColor: "DEFAULT",
      sticker: DEFAULT_PROJECT_STICKER
    });
  });

  it("rejects unsupported sticker paths", () => {
    expect(() => parseProjectAppearancePayload({ sticker: "/bad/sticker.png" })).toThrow();
  });
});
