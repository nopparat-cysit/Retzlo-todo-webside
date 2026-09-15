import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./progress-bar.tsx", import.meta.url), "utf8");

describe("ProgressBar component", () => {
  it("includes ARIA accessibility attributes", () => {
    expect(source).toContain('role="progressbar"');
    expect(source).toContain("aria-valuenow=");
    expect(source).toContain("aria-valuemin={0}");
    expect(source).toContain("aria-valuemax={100}");
  });

  it("clamps progress between 0 and 100", () => {
    expect(source).toContain("Math.min(100, Math.max(0, Math.round(Number.isFinite(value) ? value : 0)))");
  });

  it("uses the retro lo-fi gradient styling", () => {
    expect(source).toContain("from-dusk-lavender via-dusk-cyan to-dusk-amber");
  });
});
