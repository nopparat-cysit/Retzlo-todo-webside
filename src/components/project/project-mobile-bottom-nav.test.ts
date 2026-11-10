import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("ProjectMobileBottomNav floating detached and transfer animation", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/project/project-mobile-bottom-nav.tsx"),
    "utf8"
  );

  it("renders floating detached pill container with responsive centered positioning and safe area offset", () => {
    expect(source).toContain("fixed bottom-2.5 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[350px] max-w-[368px]");
    expect(source).toContain("rounded-full border border-stone-200/90 bg-white/92 backdrop-blur-xl p-1.5");
    expect(source).toContain("dark:border-white/15 dark:bg-[#0c0e24]/92");
    expect(source).toContain("bottom: \"calc(0.5rem + env(safe-area-inset-bottom, 0px))\"");
  });

  it("implements sliding transfer animation with cubic-bezier spring easing and frosted capsule highlight", () => {
    expect(source).toContain("transform: `translateX(${Math.max(0, activeIndex) * 100}%)`");
    expect(source).toContain("transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]");
    expect(source).toContain("bg-gradient-to-b from-indigo-50 to-indigo-100/80 border border-indigo-200/90");
  });

  it("provides optimistic active state updates and tactile click feedback", () => {
    expect(source).toContain("optimisticSegment");
    expect(source).toContain("setOptimisticSegment(item.segment)");
    expect(source).toContain("active:scale-95");
    expect(source).toContain("scale-110");
  });

  it("does not render awkward dot protrusion under tab label", () => {
    expect(source).not.toContain("h-0.5 w-0.5 rounded-full");
    expect(source).toContain("text-[10px]");
  });

  it("includes all 4 primary workspace tabs with saved board restoration", () => {
    expect(source).toContain('label: "Board"');
    expect(source).toContain('label: "Calendar"');
    expect(source).toContain('label: "Diary"');
    expect(source).toContain('label: "Notes"');
    expect(source).toContain("project_${projectId}_last_board");
  });

  it("includes all 4 primary workspace tabs in 4-column layout without Spaces tab", () => {
    expect(source).not.toContain('label: "Spaces"');
    expect(source).toContain("grid-cols-4");
    expect(source).toContain("w-1/4");
    expect(source).toContain("projectId?: string");
    expect(source).toContain("retzlo_last_project_id");
  });
});
