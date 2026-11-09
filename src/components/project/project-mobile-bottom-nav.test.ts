import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("ProjectMobileBottomNav floating detached and transfer animation", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/project/project-mobile-bottom-nav.tsx"),
    "utf8"
  );

  it("renders floating detached pill container with responsive centered positioning and safe area offset", () => {
    expect(source).toContain("fixed bottom-3 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[380px] max-w-[420px]");
    expect(source).toContain("rounded-full border border-stone-200/80 bg-white/92");
    expect(source).toContain("backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/90");
    expect(source).toContain("bottom: \"calc(0.75rem + env(safe-area-inset-bottom, 0px))\"");
  });

  it("implements sliding transfer animation with cubic-bezier spring easing", () => {
    expect(source).toContain("transform: `translateX(${Math.max(0, activeIndex) * 100}%)`");
    expect(source).toContain("transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]");
    expect(source).toContain("bg-dusk-lavender/15 border border-dusk-lavender/35");
  });

  it("provides optimistic active state updates and tactile click feedback", () => {
    expect(source).toContain("optimisticSegment");
    expect(source).toContain("setOptimisticSegment(item.segment)");
    expect(source).toContain("active:scale-90");
    expect(source).toContain("scale-110");
  });

  it("renders active dot indicator under the selected tab label", () => {
    expect(source).toContain("h-1 w-1 rounded-full bg-dusk-lavender");
    expect(source).toContain("isActive ? \"scale-100 opacity-100\" : \"scale-0 opacity-0\"");
  });

  it("includes all 4 primary workspace tabs with saved board restoration", () => {
    expect(source).toContain('label: "Board"');
    expect(source).toContain('label: "Calendar"');
    expect(source).toContain('label: "Diary"');
    expect(source).toContain('label: "Notes"');
    expect(source).toContain("project_${projectId}_last_board");
  });
});
