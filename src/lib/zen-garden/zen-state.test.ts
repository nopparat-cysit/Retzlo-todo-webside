import { describe, expect, it } from "vitest";

import {
  BOTANICAL_PLANTS,
  calculateZenGrowth,
  canWaterToday,
  computeNewStreak,
  getNextLockedPlant,
  getTodayZenWisdom,
  getUnlockedPlants,
  parseZenGardenState
} from "./zen-state";

describe("Zen Garden State & Growth Engine", () => {
  it("defines 10 distinct botanical plants across 3 progressive tiers", () => {
    expect(BOTANICAL_PLANTS).toHaveLength(10);
    const tier1 = BOTANICAL_PLANTS.filter((p) => p.tier === 1);
    const tier2 = BOTANICAL_PLANTS.filter((p) => p.tier === 2);
    const tier3 = BOTANICAL_PLANTS.filter((p) => p.tier === 3);

    expect(tier1).toHaveLength(4);
    expect(tier2).toHaveLength(3);
    expect(tier3).toHaveLength(3);

    // Verify costs are ascending
    for (let i = 1; i < BOTANICAL_PLANTS.length; i++) {
      expect(BOTANICAL_PLANTS[i].cost).toBeGreaterThan(BOTANICAL_PLANTS[i - 1].cost);
    }
  });

  it("calculates unlocked plants accurately based on user coin balance", () => {
    expect(getUnlockedPlants(0)).toHaveLength(0);
    expect(getUnlockedPlants(10)).toHaveLength(1);
    expect(getUnlockedPlants(382)).toHaveLength(6); // Sprout (10), Blossom (30), Bamboo (60), Aloe (100), Lotus (180), Pampas (280)
    expect(getUnlockedPlants(1500)).toHaveLength(10);
  });

  it("determines the next locked plant milestone", () => {
    const nextForZero = getNextLockedPlant(0);
    expect(nextForZero?.id).toBe("sprout");

    const nextFor382 = getNextLockedPlant(382);
    expect(nextFor382?.id).toBe("bonsai");
    expect(nextFor382?.cost).toBe(400);

    const nextForMax = getNextLockedPlant(1000);
    expect(nextForMax).toBeNull();
  });

  it("calculates sanctuary growth metrics correctly", () => {
    const growth = calculateZenGrowth(382);
    expect(growth.unlockedCount).toBe(6);
    expect(growth.totalCount).toBe(10);
    expect(growth.percentage).toBe(60);
    expect(growth.currentTier).toBe(2);
    expect(growth.nextPlant?.name).toBe("Bonsai Pine");
  });

  it("parses raw JSON state safely with defensive fallbacks", () => {
    const parsed = parseZenGardenState(null);
    expect(parsed.nurtureStreak).toBe(0);
    expect(parsed.lastWateredDate).toBeNull();
    expect(parsed.activeGuardianId).toBe("sprout");
    expect(parsed.totalNourished).toBe(0);

    const custom = parseZenGardenState({
      nurtureStreak: 7,
      lastWateredDate: "2026-10-15",
      activeGuardianId: "lotus",
      totalNourished: 42,
      totalZenMinutes: 15,
      soundMuted: true
    });
    expect(custom.nurtureStreak).toBe(7);
    expect(custom.lastWateredDate).toBe("2026-10-15");
    expect(custom.activeGuardianId).toBe("lotus");
    expect(custom.totalNourished).toBe(42);
    expect(custom.totalZenMinutes).toBe(15);
    expect(custom.soundMuted).toBe(true);
  });

  it("determines if the sanctuary can be watered today", () => {
    expect(canWaterToday(null, "2026-10-16")).toBe(true);
    expect(canWaterToday("2026-10-15", "2026-10-16")).toBe(true);
    expect(canWaterToday("2026-10-16", "2026-10-16")).toBe(false);
  });

  it("computes new streak accurately based on consecutive watering dates", () => {
    // Initial watering
    expect(computeNewStreak(null, 0, "2026-10-16")).toBe(1);

    // Consecutive day watering (yesterday -> today)
    expect(computeNewStreak("2026-10-15", 3, "2026-10-16")).toBe(4);

    // Same day watering (no streak increase)
    expect(computeNewStreak("2026-10-16", 4, "2026-10-16")).toBe(4);

    // Missed a day (e.g. 2 days ago -> today): resets streak to 1
    expect(computeNewStreak("2026-10-13", 10, "2026-10-16")).toBe(1);
  });

  it("provides daily bilingual Zen wisdom quotes", () => {
    const wisdom = getTodayZenWisdom(new Date("2026-10-16T12:00:00Z"));
    expect(wisdom.en).toBeTruthy();
    expect(wisdom.th).toBeTruthy();
  });
});
