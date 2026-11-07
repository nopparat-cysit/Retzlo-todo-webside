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

  it("renders mobile quick-jump column navigation strip and assigns matching column anchors", () => {
    expect(boardSource).toContain("Mobile Quick Column Jump Navigation");
    expect(boardSource).toContain("sm:hidden flex items-center gap-1.5 overflow-x-auto");
    expect(boardSource).toContain('scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })');
    expect(boardSource).toContain("column-${col.id}");

    expect(columnSource).toContain("id={`column-${column.id}`}");
  });

  it("hides desktop-only triggers and secondary tools on mobile topbar while keeping primary actions visible", () => {
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><ProjectTopbarTools /></div>');
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><FocusModeToggle /></div>');
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><CommandPaletteTrigger variant="topbar" /></div>');
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><LanguageSwitcher /></div>');
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><HelpButton /></div>');
    expect(shellSource).toContain("<FocusModeToggle />");
    expect(shellSource).toContain("<NotificationsPopover />");
    expect(shellSource).toContain("<AiChatTrigger />");
    expect(shellSource).toContain("<UserProfilePopover");
  });

  it("removes redundant topbar menu button in favor of bottom navigation bar trigger", () => {
    const headerStart = shellSource.indexOf("<header");
    const headerEnd = shellSource.indexOf("</header>");
    const headerSource = shellSource.slice(headerStart, headerEnd);
    expect(headerSource).not.toContain('htmlFor="project-sidebar-toggle"');
  });

  it("organizes board search, add column, and filter strip cleanly for mobile viewports without emptiness", () => {
    expect(boardSource).toContain("flex items-center gap-2");
    expect(boardSource).toContain("pt-1.5 border-t border-stone-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2");
    expect(boardSource).toContain("overflow-x-auto scrollbar-none py-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap");
    expect(boardSource).toContain("isMobileFiltersOpen || activeFilterCount > 0");
  });

  it("guarantees minimum height on KanbanColumn for mobile viewport protection", () => {
    expect(columnSource).toContain("min-h-[360px] sm:min-h-0");
  });

  it("mounts mobile bottom navigation bar and allows smooth vertical overflow on mobile shell", () => {
    expect(shellSource).toContain("overflow-x-hidden lg:overflow-hidden");
    expect(shellSource).toContain("pb-14 lg:pb-0");
    expect(shellSource).toContain("<ProjectMobileBottomNav");
  });

  it("positions star FAB elevated above mobile bottom nav to prevent overlapping Menu button", () => {
    expect(fabSource).toContain("bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3.5 sm:bottom-6 sm:right-6");
  });

  it("prevents button wrapping and layout breaks in projects dashboard", () => {
    expect(dashboardSource).toContain("flex items-center justify-between gap-2.5 sm:gap-3");
    expect(dashboardSource).toContain("overflow-x-auto scrollbar-none flex-nowrap");
    expect(dashboardSource).toContain("mt-auto pt-2.5 border-t border-stone-200/80 flex items-center gap-1.5 flex-nowrap dark:border-white/10");
  });

  it("ensures calendar top controls and month grid are horizontally scrollable on mobile", () => {
    expect(calendarSource).toContain("flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 sm:overflow-visible sm:flex-wrap");
    expect(calendarSource).toContain("overflow-x-auto");
    expect(calendarSource).toContain('viewMode === "month" && "min-w-[560px] sm:min-w-0"');
  });
});
