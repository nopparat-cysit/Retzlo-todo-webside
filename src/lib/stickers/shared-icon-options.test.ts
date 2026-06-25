import { describe, expect, it } from "vitest";

import { getSharedIconForName, isSharedIconPath, sharedIconOptions } from "@/lib/stickers/shared-icon-options";

describe("shared icon options", () => {
  it("combines reward icons and retro stickers without duplicate concept ids", () => {
    expect(sharedIconOptions).toHaveLength(65);
    expect(new Set(sharedIconOptions.map((icon) => icon.id)).size).toBe(sharedIconOptions.length);
    expect(sharedIconOptions.some((icon) => icon.id === "gift")).toBe(true);
    expect(sharedIconOptions.some((icon) => icon.id === ("reward-gift" as string))).toBe(false);
    expect(sharedIconOptions.some((icon) => icon.id === "water-bottle")).toBe(true);
    expect(sharedIconOptions.some((icon) => icon.id === "battery-charge")).toBe(true);
  });

  it("matches reward names to the shared icon library", () => {
    expect(getSharedIconForName("Movie Ticket").id).toBe("reward-ticket");
    expect(getSharedIconForName("Coffee Break").id).toBe("coffee-cup");
    expect(getSharedIconForName("Keyboard Coupon").id).toBe("keyboard-key");
  });

  it("validates shared icon paths", () => {
    expect(isSharedIconPath("/stickers/retro/retro-sticker-18-gift.png")).toBe(true);
    expect(isSharedIconPath("/stickers/retro/retro-sticker-26-water-bottle.png")).toBe(true);
    expect(isSharedIconPath("/stickers/retro/retro-sticker-50-battery-charge.png")).toBe(true);
    expect(isSharedIconPath("/stickers/rewards/reward-icon-04-game.png")).toBe(true);
    expect(isSharedIconPath("/stickers/rewards/reward-icon-02-gift.png")).toBe(false);
  });
});
