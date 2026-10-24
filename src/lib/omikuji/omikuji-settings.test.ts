import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import {
  getOmikujiSettings,
  saveOmikujiSettings,
  resetOmikujiSettings,
  saveCustomOmikujiFortunes,
  getActiveFortunes
} from "./omikuji-settings";
import { OmikujiFortuneItem } from "@/types/omikuji";

// In-memory mock for localStorage in Node test environment
const memoryStore = new Map<string, string>();

const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => memoryStore.set(key, value),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
  get length() {
    return memoryStore.size;
  },
  key: (index: number) => Array.from(memoryStore.keys())[index] ?? null
};

beforeAll(() => {
  // @ts-expect-error mock localStorage
  global.localStorage = mockLocalStorage;
  // @ts-expect-error mock window
  global.window = {
    localStorage: mockLocalStorage,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
});

describe("omikuji-settings", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("should return default settings when nothing is in localStorage", () => {
    const s = getOmikujiSettings();
    expect(s.enabled).toBe(true);
    expect(s.languageMode).toBe("auto");
    expect(s.drawMode).toBe("daily");
  });

  it("should save and update partial settings", () => {
    const updated = saveOmikujiSettings({
      enabled: false,
      languageMode: "en",
      drawMode: "unlimited"
    });
    expect(updated.enabled).toBe(false);
    expect(updated.languageMode).toBe("en");
    expect(updated.drawMode).toBe("unlimited");

    const reloaded = getOmikujiSettings();
    expect(reloaded.enabled).toBe(false);
    expect(reloaded.languageMode).toBe("en");
    expect(reloaded.drawMode).toBe("unlimited");
  });

  it("should reset settings to default", () => {
    saveOmikujiSettings({ enabled: false, languageMode: "th" });
    const reset = resetOmikujiSettings();
    expect(reset.enabled).toBe(true);
    expect(reset.languageMode).toBe("auto");

    const reloaded = getOmikujiSettings();
    expect(reloaded.enabled).toBe(true);
  });

  it("should save and load custom fortunes dataset", () => {
    const mockFortunes: OmikujiFortuneItem[] = [
      {
        id: "custom-1",
        number: 1,
        rank_jp: "大吉",
        rank_romaji: "Daikichi",
        rank_th: "โชคดีมาก",
        rank_en: "Great Blessing",
        title_th: "ใบพิเศษ",
        title_en: "Special Slip",
        central_theme_th: "ก้าวหน้า",
        central_theme_en: "Progress",
        career_work_th: "ราบรื่น",
        career_work_en: "Smooth",
        finance_wealth_th: "มั่งคั่ง",
        finance_wealth_en: "Wealthy",
        love_relationships_th: "อบอุ่น",
        love_relationships_en: "Warm",
        health_wellness_th: "แข็งแรง",
        health_wellness_en: "Strong",
        personal_growth_th: "เติบโต",
        personal_growth_en: "Growth"
      }
    ];

    saveCustomOmikujiFortunes("new-year-2027.csv", mockFortunes);
    const active = getActiveFortunes();
    expect(active).toHaveLength(1);
    expect(active[0].title_th).toBe("ใบพิเศษ");

    const settings = getOmikujiSettings();
    expect(settings.customCsvName).toBe("new-year-2027.csv");
    expect(settings.customFortunesCount).toBe(1);
  });
});
