import { describe, expect, it } from "vitest";
import { AI_CREDIT_COSTS, AI_TIER_LIMITS } from "./credits";

describe("AI Credit & Quota System", () => {
  it("defines correct credit costs for breakdown and summary", () => {
    expect(AI_CREDIT_COSTS.BREAKDOWN).toBe(1);
    expect(AI_CREDIT_COSTS.SUMMARY).toBe(2);
  });

  it("defines tier limits with 50 credits for Free Tier", () => {
    expect(AI_TIER_LIMITS.FREE).toBe(50);
    expect(AI_TIER_LIMITS.PRO).toBe(200);
    expect(AI_TIER_LIMITS.ADMIN).toBeGreaterThanOrEqual(999999);
  });
});
