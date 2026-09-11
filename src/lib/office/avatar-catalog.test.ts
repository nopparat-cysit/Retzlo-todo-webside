import { describe, expect, it } from "vitest";
import {
  ACCESSORIES,
  DEFAULT_AVATAR_CONFIG,
  HAIR_COLORS,
  HAIRSTYLES,
  OUTFIT_COLORS,
  OUTFITS,
  PETS,
  SKIN_TONES,
  drawAvatar,
  getRandomAvatarConfig,
  type AvatarAnimation,
  type AvatarDirection
} from "./avatar-catalog";

describe("Avatar Catalog Data", () => {
  it("has exactly 10 hairstyles with valid IDs and names", () => {
    expect(HAIRSTYLES).toHaveLength(10);
    for (const item of HAIRSTYLES) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.nameTh).toBeTruthy();
      expect(item.icon).toBeTruthy();
    }
  });

  it("has exactly 10 outfits with valid IDs and names", () => {
    expect(OUTFITS).toHaveLength(10);
    for (const item of OUTFITS) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.nameTh).toBeTruthy();
    }
  });

  it("has exactly 10 accessories with valid IDs and names", () => {
    expect(ACCESSORIES).toHaveLength(10);
    for (const item of ACCESSORIES) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.nameTh).toBeTruthy();
    }
  });

  it("has exactly 10 pets with valid IDs and names", () => {
    expect(PETS).toHaveLength(10);
    for (const item of PETS) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.nameTh).toBeTruthy();
    }
  });

  it("has exactly 10 skin tones", () => {
    expect(SKIN_TONES).toHaveLength(10);
    for (const tone of SKIN_TONES) {
      expect(tone.value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("has exactly 10 hair colors", () => {
    expect(HAIR_COLORS).toHaveLength(10);
    for (const color of HAIR_COLORS) {
      expect(color.value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("has exactly 10 outfit colors", () => {
    expect(OUTFIT_COLORS).toHaveLength(10);
    for (const color of OUTFIT_COLORS) {
      expect(color.value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("provides valid default avatar config", () => {
    expect(HAIRSTYLES.some((h) => h.id === DEFAULT_AVATAR_CONFIG.hairstyleId)).toBe(true);
    expect(OUTFITS.some((o) => o.id === DEFAULT_AVATAR_CONFIG.outfitId)).toBe(true);
    expect(ACCESSORIES.some((a) => a.id === DEFAULT_AVATAR_CONFIG.accessoryId)).toBe(true);
    expect(PETS.some((p) => p.id === DEFAULT_AVATAR_CONFIG.petId)).toBe(true);
    expect(SKIN_TONES.some((s) => s.id === DEFAULT_AVATAR_CONFIG.skinToneId)).toBe(true);
    expect(HAIR_COLORS.some((h) => h.id === DEFAULT_AVATAR_CONFIG.hairColorId)).toBe(true);
    expect(OUTFIT_COLORS.some((o) => o.id === DEFAULT_AVATAR_CONFIG.outfitColorId)).toBe(true);
  });

  it("generates random valid configurations", () => {
    const randomConfig = getRandomAvatarConfig("Tester");
    expect(randomConfig.name).toBe("Tester");
    expect(HAIRSTYLES.some((h) => h.id === randomConfig.hairstyleId)).toBe(true);
    expect(OUTFITS.some((o) => o.id === randomConfig.outfitId)).toBe(true);
    expect(ACCESSORIES.some((a) => a.id === randomConfig.accessoryId)).toBe(true);
    expect(PETS.some((p) => p.id === randomConfig.petId)).toBe(true);
  });

  it("drawAvatar executes without error across all animations and directions", () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      fillRect: () => {},
      clearRect: () => {},
      fillText: () => {},
      fillStyle: "",
      font: "",
    } as unknown as CanvasRenderingContext2D;

    const animations: AvatarAnimation[] = ["idle", "walk", "work", "coffee", "wave", "cheer", "sleep"];
    const directions: AvatarDirection[] = ["down", "up", "left", "right"];

    for (const anim of animations) {
      for (const dir of directions) {
        expect(() => {
          drawAvatar(mockCtx, 100, 100, DEFAULT_AVATAR_CONFIG, anim, dir, 10);
        }).not.toThrow();
      }
    }
  });
});
