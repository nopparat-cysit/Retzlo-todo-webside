import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Kanban responsive and touch optimizations", () => {
  const boardSource = readFileSync(join(process.cwd(), "src/components/kanban/board.tsx"), "utf8");
  const columnSource = readFileSync(join(process.cwd(), "src/components/kanban/column.tsx"), "utf8");
  const shellSource = readFileSync(join(process.cwd(), "src/components/project/project-shell.tsx"), "utf8");
  const dashboardSource = readFileSync(join(process.cwd(), "src/components/project/projects-dashboard.tsx"), "utf8");
  const calendarSource = readFileSync(join(process.cwd(), "src/components/kanban/project-calendar.tsx"), "utf8");

  it("configures MouseSensor and TouchSensor with activation constraints to prevent mobile scroll conflicts", () => {
    expect(boardSource).toContain("MouseSensor");
    expect(boardSource).toContain("TouchSensor");
    expect(boardSource).toContain("useSensor(MouseSensor");
    expect(boardSource).toContain("useSensor(TouchSensor");
    expect(boardSource).toContain("distance: 5");
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

  it("hides desktop-only triggers on mobile topbar while keeping FocusModeToggle mounted", () => {
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><FocusModeToggle /></div>');
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><CommandPaletteTrigger variant="topbar" /></div>');
    expect(shellSource).toContain('<div className="hidden sm:inline-flex"><HelpButton /></div>');
    expect(shellSource).toContain("<FocusModeToggle />");
  });

  it("adds mobile-only utility header for profile and tools access in ProjectsDashboard", () => {
    expect(dashboardSource).toContain("Mobile-only Utility Header for Instant Profile & Tool Access");
    expect(dashboardSource).toContain("flex lg:hidden items-center justify-between pb-3 border-b");
    expect(dashboardSource).toContain("<LanguageSwitcher />");
    expect(dashboardSource).toContain("<NotificationsPopover />");
    expect(dashboardSource).toContain("<AiChatTrigger");
    expect(dashboardSource).toContain("<UserProfilePopover");
  });

  it("ensures month calendar view is horizontally scrollable and legible on mobile screens", () => {
    expect(calendarSource).toContain("overflow-x-auto");
    expect(calendarSource).toContain('viewMode === "month" && "min-w-[560px] sm:min-w-0"');
  });
});
