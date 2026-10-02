import { describe, expect, it } from "vitest";

import { getSharedIconForName, isSharedIconPath, sharedIconOptions } from "@/lib/stickers/shared-icon-options";
import { cardStickerOptions, normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";

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

  it("keeps stickers 26–50 out of the card picker without changing the shared library", () => {
    expect(cardStickerOptions).toHaveLength(65);
    expect(new Set(cardStickerOptions.map((icon) => icon.id)).size).toBe(cardStickerOptions.length);
    expect(cardStickerOptions.some((icon) => /\/retro-sticker-(?:2[6-9]|[34]\d|50)-/.test(icon.src))).toBe(false);
    expect(cardStickerOptions.some((icon) => icon.id === "reward-game")).toBe(true);
    expect(cardStickerOptions.some((icon) => icon.id === "idea-bulb")).toBe(true);
    expect(cardStickerOptions.some((icon) => icon.id === "hardhat")).toBe(true);
    expect(cardStickerOptions.some((icon) => icon.id === "ladybug")).toBe(false);
    expect(cardStickerOptions.some((icon) => icon.id === "notification-bell")).toBe(true);
    expect(cardStickerOptions.some((icon) => icon.id === "potted-plant")).toBe(false);
    expect(cardStickerOptions.some((icon) => icon.id === "suitcase")).toBe(true);
    expect(sharedIconOptions.some((icon) => icon.id === "water-bottle")).toBe(true);
    expect(normalizeRetroStickerSelection([
      "/stickers/retro/retro-sticker-26-water-bottle.png",
      "/stickers/retro/retro-sticker-51-idea-bulb.png",
      "/stickers/retro/retro-sticker-55-hardhat.png",
      "/stickers/retro/unknown.png"
    ])).toEqual([
      "/stickers/retro/retro-sticker-26-water-bottle.png",
      "/stickers/retro/retro-sticker-51-idea-bulb.png",
      "/stickers/retro/retro-sticker-55-hardhat.png"
    ]);
  });
});
