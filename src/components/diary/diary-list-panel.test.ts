import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("DiaryListPanel layout", () => {
  it("uses the approved reward-style diary workspace structure", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain('data-diary-layout="reward-style"');
    expect(source).toContain('data-diary-hero-layout="single-row"');
    expect(source).toContain('data-diary-list-rail="pinned-lists"');
    expect(source).toContain('data-diary-checklist-panel="today-checklist"');
  });

  it("keeps page scrolling inside diary panels instead of the whole page", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain("grid h-full min-h-0");
    expect(source).toContain("overflow-y-auto");
    expect(source).not.toContain("md:grid-cols-2 2xl:grid-cols-3");
  });

  it("embeds filter and sort controls inside the diary shelf sidebar", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain("Diary Shelf");
    expect(source).toContain("FilterSelect");
    expect(source).toContain("Sort: Due status");
  });
});
