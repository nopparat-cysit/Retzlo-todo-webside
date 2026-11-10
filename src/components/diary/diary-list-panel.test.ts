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

  it("supports collapsible tools in diary hero header with persistence and quick indicators", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain("isToolsCollapsed");
    expect(source).toContain("toggleToolsCollapse");
    expect(source).toContain("retzlo_diary_");
    expect(source).toContain("grid-rows-[0fr]");
    expect(source).toContain("grid-rows-[1fr]");
  });

  it("supports hiding checklist details with persistence and per-item toggle", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain("isChecklistDetailsHidden");
    expect(source).toContain("toggleChecklistDetailsHidden");
    expect(source).toContain("retzlo_diary_hide_checklist_details");
    expect(source).toContain("expandedItemIds");
  });

  it("supports compact details mode in DiaryChecklistPreview with localStorage persistence", () => {
    const source = readFileSync(new URL("./diary-checklist.tsx", import.meta.url), "utf8");

    expect(source).toContain("isDetailsHidden");
    expect(source).toContain("retzlo_diary_hide_checklist_details");
  });

  it("supports collapsible focus banner and multi-diary switcher rail", () => {
    const source = readFileSync(new URL("./diary-list-panel.tsx", import.meta.url), "utf8");

    expect(source).toContain("isBannerCollapsed");
    expect(source).toContain("toggleBannerCollapsed");
    expect(source).toContain("retzlo_diary_focus_banner_collapsed");
    expect(source).toContain("allDiaries");
    expect(source).toContain("onSelectDiary");
    expect(source).toContain("ChevronUp");
  });
});
