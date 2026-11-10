import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Kanban responsive and touch optimizations", () => {
  const boardSource = readFileSync(join(process.cwd(), "src/components/kanban/board.tsx"), "utf8");
  const columnSource = readFileSync(join(process.cwd(), "src/components/kanban/column.tsx"), "utf8");
  const shellSource = readFileSync(join(process.cwd(), "src/components/project/project-shell.tsx"), "utf8");
  const dashboardSource = readFileSync(join(process.cwd(), "src/components/project/projects-dashboard.tsx"), "utf8");
  const calendarSource = readFileSync(join(process.cwd(), "src/components/kanban/project-calendar.tsx"), "utf8");
  const fabSource = readFileSync(join(process.cwd(), "src/components/hub/fab-hub.tsx"), "utf8");
  const diarySource = readFileSync(join(process.cwd(), "src/components/diary/diary-list-panel.tsx"), "utf8");
  const bottomNavSource = readFileSync(join(process.cwd(), "src/components/project/project-mobile-bottom-nav.tsx"), "utf8");
  const skeletonSource = readFileSync(join(process.cwd(), "src/components/ui/skeleton.tsx"), "utf8");

  it("configures MouseSensor and TouchSensor with activation constraints to prevent mobile scroll conflicts", () => {
    expect(boardSource).toContain("MouseSensor");
    expect(boardSource).toContain("TouchSensor");
    expect(boardSource).toContain("useSensor(MouseSensor");
    expect(boardSource).toContain("useSensor(TouchSensor");
    expect(boardSource).toContain("distance: 4");
    expect(boardSource).toContain("delay: 250");
    expect(boardSource).toContain("tolerance: 6");
    expect(boardSource).toContain("useSensors(mouseSensor, touchSensor)");
  });

  it("renders mobile segmented column tab bar and assigns matching column anchors", () => {
    expect(boardSource).toContain("Mobile Segmented Column Tab Bar");
    expect(boardSource).toContain("sm:hidden flex items-center gap-1 p-1 rounded-xl");
    expect(boardSource).toContain("key={`tab-${col.id}`}");
    expect(boardSource).toContain("setActiveMobileColumnId(col.id)");
    expect(boardSource).toContain("id={`column-${column.id}`}");

    expect(columnSource).toContain("id={`column-${column.id}`}");
  });

  it("provides sticky topbar and definite viewport height on project shell", () => {
    expect(shellSource).toContain("sticky top-1.5 sm:top-2 z-40 backdrop-blur-xl bg-ink-950/80");
    expect(shellSource).toContain("h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-1.5rem)] min-h-0");
    expect(shellSource).toContain("flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl overflow-hidden");
    expect(shellSource).toContain("relative z-10 min-h-0 min-w-0 max-w-full flex-1 flex flex-col pb-16 sm:pb-20 lg:pb-0 overflow-hidden");
  });

  it("shows Menu trigger on mobile and BackButton on desktop in workspace topbar", () => {
    const headerStart = shellSource.indexOf("<header");
    const headerEnd = shellSource.indexOf("</header>");
    const headerSource = shellSource.slice(headerStart, headerEnd);
    expect(headerSource).toContain('htmlFor="project-sidebar-toggle"');
    expect(headerSource).toContain('<div className="hidden lg:inline-flex">');
    expect(headerSource).toContain("<BackButton />");
  });

  it("includes Home icon link to /projects in sidebar drawer", () => {
    expect(shellSource).toContain('<Home className="h-3.5 w-3.5" />');
    expect(shellSource).toContain("<span>Projects</span>");
  });

  it("completely hides Star FAB on mobile to keep bottom nav unobstructed", () => {
    expect(fabSource).toContain("hidden lg:flex");
  });

  it("hides duplicate profile toolbar on mobile in projects dashboard", () => {
    expect(dashboardSource).toContain("mt-3 hidden lg:flex items-center justify-between rounded-xl");
  });

  it("organizes board search, add column, and filter strip cleanly for mobile viewports without emptiness", () => {
    expect(boardSource).toContain("flex items-center gap-2");
    expect(boardSource).toContain("pt-1.5 border-t border-stone-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2");
    expect(boardSource).toContain("isMobileFiltersOpen || activeFilterCount > 0");
  });

  it("ensures mobile columns use adaptive viewport width without 335px overflow", () => {
    expect(columnSource).toContain("w-full sm:w-[320px]");
    expect(columnSource).toContain("min-h-0 sm:min-h-0");
  });

  it("disables board name renaming on mobile screens to prevent header blowout", () => {
    expect(boardSource).toContain('if (typeof window !== "undefined" && window.innerWidth < 640) return;');
    expect(boardSource).toContain("hidden sm:grid opacity-0 group-hover/title:opacity-100");
  });

  it("fits calendar month view 100% inside mobile viewport without 560px cut-off", () => {
    expect(calendarSource).not.toContain('min-w-[560px]');
    expect(calendarSource).toContain("dotColor");
  });

  it("compacts diary hero panel and description on mobile screens", () => {
    expect(diarySource).toContain("hidden sm:block mt-1");
  });

  it("keeps bottom nav dedicated to tabs and removes redundant bottom menu button", () => {
    expect(bottomNavSource).not.toContain('htmlFor="project-sidebar-toggle"');
    expect(bottomNavSource).not.toContain("<span>Menu</span>");
    expect(bottomNavSource).toContain("Board");
    expect(bottomNavSource).toContain("Calendar");
    expect(bottomNavSource).toContain("Diary");
    expect(bottomNavSource).toContain("Notes");
  });

  it("supports collapsible tools in board header with persistence and quick indicators", () => {
    expect(boardSource).toContain("isToolsCollapsed");
    expect(boardSource).toContain("toggleToolsCollapse");
    expect(boardSource).toContain("retzlo_board_");
    expect(boardSource).toContain("grid-rows-[0fr]");
    expect(boardSource).toContain("grid-rows-[1fr]");
    expect(boardSource).toContain("Active filters applied. Click to expand tools.");
  });

  it("tracks and highlights active column in mobile navigation", () => {
    expect(boardSource).toContain("activeMobileColumnId");
    expect(boardSource).toContain("handleColumnsScroll");
    expect(boardSource).toContain("bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100");
  });

  it("styles mobile bottom navigation as floating detached pill with transfer animation", () => {
    expect(bottomNavSource).toContain("rounded-full");
    expect(bottomNavSource).toContain("translateX");
    expect(bottomNavSource).toContain("transition-all duration-300");
    expect(bottomNavSource).not.toContain("shadow-[0_-4px_20px_rgba(0,0,0,0.35)]");
  });

  it("organizes calendar header into non-overflowing responsive rows and removes horizontal overflow strip", () => {
    expect(calendarSource).not.toContain("overflow-x-auto scrollbar-none py-1 sm:overflow-visible sm:flex-wrap");
    expect(calendarSource).toContain("Row 1: Month title & Navigation");
    expect(calendarSource).toContain("Row 2: Search input + View switcher + Filter button");
    expect(calendarSource).toContain("Row 3: Quick filter chips");
  });

  it("supports agenda schedule view mode in segmented control and view types", () => {
    expect(calendarSource).toContain('value: "list", label: "Schedule"');
  });

  it("provides inline mobile task list under compact month grid without requiring modal", () => {
    expect(calendarSource).toContain("Mobile Inline Selected Day Task List (< md)");
    expect(calendarSource).toContain("min-h-[44px] md:min-h-[135px]");
    expect(calendarSource).toContain("selectedDayHeader");
  });

  it("applies sm:flex-none sm:w-auto to active column wrapper in board to prevent horizontal expansion on desktop", () => {
    expect(boardSource).toContain("sm:flex-none sm:w-auto sm:shrink-0");
  });

  it("applies sm:flex-none sm:w-auto to column skeleton wrapper to prevent horizontal expansion on desktop", () => {
    expect(skeletonSource).toContain("sm:flex-none sm:w-auto sm:shrink-0");
  });

  it("supports collapsible tools in calendar header with persistence and quick indicators", () => {
    expect(calendarSource).toContain("isToolsCollapsed");
    expect(calendarSource).toContain("toggleToolsCollapse");
    expect(calendarSource).toContain("retzlo_calendar_");
    expect(calendarSource).toContain("grid-rows-[0fr]");
    expect(calendarSource).toContain("grid-rows-[1fr]");
    expect(calendarSource).toContain("Show Tools");
    expect(calendarSource).toContain("Hide Tools");
    expect(calendarSource).toContain("Active filters applied. Click to expand tools.");
  });
});
