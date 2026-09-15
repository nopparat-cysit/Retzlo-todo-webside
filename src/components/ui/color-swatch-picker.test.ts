import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./color-swatch-picker.tsx", import.meta.url), "utf8");

describe("ColorSwatchPicker component", () => {
  it("defaults to cardColorOptions from theme", () => {
    expect(source).toContain('import { cardColorOptions } from "@/lib/theme/card-colors"');
    expect(source).toContain("options = cardColorOptions");
  });

  it("applies retro amber ring styling for selected swatch", () => {
    expect(source).toContain("border-dusk-amber");
    expect(source).toContain("shadow-[0_0_0_2px_rgba(249,199,132,0.16)]");
  });

  it("includes accessible aria-label and aria-pressed attributes", () => {
    expect(source).toContain("aria-label=");
    expect(source).toContain("aria-pressed={isSelected}");
  });
});
