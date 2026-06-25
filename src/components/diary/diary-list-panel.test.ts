import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("DiaryListPanel layout", () => {
  it("uses the approved reward-style diary workspace structure", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain('data-diary-layout="reward-style"');
    expect(source).toContain('data-diary-hero-layout="single-row"');
    expect(source).toContain('data-diary-filter-toolbar="open-air"');
    expect(source).toContain('data-diary-list-rail="pinned-lists"');
    expect(source).toContain('data-diary-checklist-panel="today-checklist"');
    expect(source).toContain('data-diary-queue="next-moments"');
  });

  it("keeps page scrolling inside diary panels instead of the whole page", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain("grid h-full min-h-0");
    expect(source).toContain("grid-rows-[auto_auto_minmax(0,1fr)]");
    expect(source).toContain("overflow-y-auto");
    expect(source).not.toContain("md:grid-cols-2 2xl:grid-cols-3");
  });

  it("keeps diary filters outside the hero panel", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain('data-diary-filter-toolbar="open-air"');
    expect(source).toContain("bg-ink-950/35 text-stone-300");
  });
});
