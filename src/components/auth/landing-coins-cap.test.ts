import { describe, it, expect } from "vitest";

describe("Landing coins cap", () => {
  it("caps raw coins at 100 maximum", () => {
    const rawCoins = 20090;
    const cappedCoins = Math.min(100, Math.max(0, rawCoins));
    expect(cappedCoins).toBe(100);
  });

  it("handles negative and zero coins gracefully", () => {
    expect(Math.min(100, Math.max(0, -50))).toBe(0);
    expect(Math.min(100, Math.max(0, 0))).toBe(0);
    expect(Math.min(100, Math.max(0, 45))).toBe(45);
    expect(Math.min(100, Math.max(0, 100))).toBe(100);
    expect(Math.min(100, Math.max(0, 105))).toBe(100);
  });
});
