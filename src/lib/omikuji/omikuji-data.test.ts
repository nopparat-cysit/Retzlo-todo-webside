import { describe, it, expect } from "vitest";
import {
  getAllFortunes,
  getFortuneByNumber,
  getRandomFortune,
  getDailyFortune,
  getRankVisual,
  validateOmikujiCsv
} from "./omikuji-data";

describe("omikuji-data engine", () => {
  it("should load exactly 100 bilingual fortunes", () => {
    const fortunes = getAllFortunes();
    expect(fortunes).toHaveLength(100);
    expect(fortunes[0].number).toBe(1);
    expect(fortunes[99].number).toBe(100);
  });

  it("should retrieve a specific fortune with both TH and EN fields", () => {
    const fortune1 = getFortuneByNumber(1);
    expect(fortune1).toBeDefined();
    expect(fortune1?.rank_jp).toBe("大吉");
    expect(fortune1?.rank_romaji).toBe("Daikichi");
    expect(fortune1?.rank_th).toBe("โชคดีมาก");
    expect(fortune1?.rank_en).toBe("Great Blessing");
    expect(fortune1?.title_th).toBeTruthy();
    expect(fortune1?.title_en).toBeTruthy();
    expect(fortune1?.career_work_th).toBeTruthy();
    expect(fortune1?.career_work_en).toBeTruthy();
    expect(fortune1?.personal_growth_th).toBeTruthy();
    expect(fortune1?.personal_growth_en).toBeTruthy();
  });

  it("should return random fortune within range 1 to 100", () => {
    const random = getRandomFortune();
    expect(random.number).toBeGreaterThanOrEqual(1);
    expect(random.number).toBeLessThanOrEqual(100);
  });

  it("should be deterministic for daily fortunes on the same day", () => {
    const date = new Date(2026, 9, 24); // Oct 24, 2026
    const daily1 = getDailyFortune("user-123", date);
    const daily2 = getDailyFortune("user-123", date);
    expect(daily1.number).toBe(daily2.number);
  });

  it("should return appropriate visual metadata for ranks", () => {
    const daikichiMeta = getRankVisual("Daikichi");
    expect(daikichiMeta.kanji).toBe("大吉");
    expect(daikichiMeta.sealColor).toBe("#b91c1c");

    const kyoMeta = getRankVisual("Kyo");
    expect(kyoMeta.kanji).toBe("凶");
    expect(kyoMeta.sealColor).toBe("#334155");
  });

  it("should validate CSV content accurately", () => {
    const validCsv = `id,number,rank_jp,rank_romaji,rank_th,title_th,central_theme_th,career_work_th,finance_wealth_th,love_relationships_th,health_wellness_th,personal_growth_th
kannon-001,1,大吉,Daikichi,โชคดีมาก,หัวข้อทดสอบ,แกนกลาง,การงาน,การเงิน,ความรัก,สุขภาพ,การเติบโต`;

    const result = validateOmikujiCsv(validCsv);
    expect(result.valid).toBe(true);
    expect(result.count).toBe(1);
    expect(result.fortunes?.[0].title_th).toBe("หัวข้อทดสอบ");

    const invalidCsv = `id,number\nkannon-001,1`;
    const invalidResult = validateOmikujiCsv(invalidCsv);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});
