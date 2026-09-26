import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Board Switch Skeleton and Overdue Alignment Contracts", () => {
  const boardSource = readFileSync(join(process.cwd(), "src/components/kanban/board.tsx"), "utf8");
  const tabsBarSource = readFileSync(join(process.cwd(), "src/components/kanban/board-tabs-bar.tsx"), "utf8");
  const cssSource = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  const selectSource = readFileSync(join(process.cwd(), "src/components/ui/select.tsx"), "utf8");

  it("dispatches board-switching event and manages switching state in BoardTabsBar", () => {
    expect(tabsBarSource).toContain("switchingBoardId");
    expect(tabsBarSource).toMatch(/window\.dispatchEvent\(\s*new CustomEvent\(["']board-switching["']/);
    expect(tabsBarSource).toContain("setSwitchingBoardId(b.id)");
  });

  it("renders BoardSkeleton immediately when switching boards in KanbanBoard", () => {
    expect(boardSource).toContain("isSwitchingBoard");
    expect(boardSource).toMatch(/addEventListener\(["']board-switching["']/);
    expect(boardSource).toContain("<BoardSkeleton />");
    expect(boardSource).toMatch(/isSwitchingBoard\s*\?\s*\(\s*<div[\s\S]*<BoardSkeleton \/>/);
  });

  it("aligns overdue alert button with stat pills in the Premium Control Bar without floating absolute offset", () => {
    // Ensure absolute positioning is removed from overdue button
    expect(boardSource).not.toContain("!absolute !top-2.5 !right-2.5");
    // Ensure overdue button is inside the Premium Control Bar alongside Total, Prog, and Done
    expect(boardSource).toMatch(/Premium Control Bar[\s\S]*Total[\s\S]*Prog[\s\S]*Done[\s\S]*Overdue Indicator Icon/);
    // Ensure matching height and rounded corners
    expect(boardSource).toMatch(/flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border/);
  });

  it("ensures dark mode dropdowns in SelectContent use midnight background to avoid white-on-white", () => {
    expect(selectSource).toContain("dark:bg-[#0e1025]");
    expect(cssSource).toContain('[data-theme="dark"] [data-radix-select-content]');
    expect(cssSource).toContain(".dark [data-radix-select-content]");
    expect(cssSource).toMatch(/\.dark \[data-radix-select-content\]\s*\{[\s\S]*background-color: #0e1025 !important;/);
  });
});
