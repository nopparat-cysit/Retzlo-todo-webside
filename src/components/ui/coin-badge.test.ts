import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./coin-badge.tsx", import.meta.url), "utf8");

describe("CoinBadge component", () => {
  it("imports and renders Coins icon from lucide-react", () => {
    expect(source).toContain('import { Coins } from "lucide-react"');
    expect(source).toContain("<Coins");
  });

  it("applies dusk-amber token styling across all variants", () => {
    expect(source).toContain("border-dusk-amber");
    expect(source).toContain("text-dusk-amber");
  });

  it("handles non-finite values safely", () => {
    expect(source).toContain("Number.isFinite(amount) ? amount : 0");
  });
});
