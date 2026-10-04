import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Board views switcher, sidebar sub-menu, and settings UX contracts", () => {
  const sidebarSource = readFileSync(
    join(process.cwd(), "src/components/kanban/board-sidebar-dropdown.tsx"),
    "utf8"
  );
  const boardSource = readFileSync(
    join(process.cwd(), "src/components/kanban/board.tsx"),
    "utf8"
  );
  const listViewSource = readFileSync(
    join(process.cwd(), "src/components/kanban/board-list-view.tsx"),
    "utf8"
  );
  const settingsManagerSource = readFileSync(
    join(process.cwd(), "src/components/project/project-boards-manager.tsx"),
    "utf8"
  );

  it("provides an inline accordion sub-menu in the sidebar instead of a single select dropdown", () => {
    // Accordion toggle & state
    expect(sidebarSource).toContain("isExpanded");
    expect(sidebarSource).toContain("toggleAccordion");
    expect(sidebarSource).toContain("retrod:boards-accordion");

    // Renders boards list directly in sub-menu
    expect(sidebarSource).toContain("boardsList.map");
    expect(sidebarSource).toContain("retrod:starred-boards");

    // Has ... more options dropdown per board
    expect(sidebarSource).toContain("handleToggleStar");
    expect(sidebarSource).toContain("handleSaveAsTemplate");
    expect(sidebarSource).toContain("Star board");
    expect(sidebarSource).toContain("Manage members");
    expect(sidebarSource).toContain("Save as template");

    // Direct link to board settings page
    expect(sidebarSource).toContain("settings?tab=board-general&boardId=");
  });

  it("preserves reactive renaming and board-switching events in sidebar", () => {
    expect(sidebarSource).toContain("setBoardsList");
    expect(sidebarSource).toMatch(/addEventListener\(["']board-renamed["']/);
    expect(sidebarSource).toContain("switchingBoardId");
    expect(sidebarSource).toMatch(/window\.dispatchEvent\(\s*new CustomEvent\(["']board-switching["']/);
    expect(sidebarSource).toContain("setSwitchingBoardId(b.id)");
  });

  it("integrates Board and List view switching in KanbanBoard", () => {
    // View mode state
    expect(boardSource).toContain('viewMode === "list"');
    expect(boardSource).toContain('viewMode === "board"');
    expect(boardSource).toContain("handleSwitchViewMode");
    expect(boardSource).toContain("kanban_active_view_mode");

    // Top view switcher tabs with icons
    expect(boardSource).toContain("<KanbanSquare");
    expect(boardSource).toContain("<ListFilter");
    expect(boardSource).toContain("Switch to Board view");
    expect(boardSource).toContain("Switch to List view");

    // Renders BoardListView when viewMode is list
    expect(boardSource).toContain("<BoardListView");

    // Card Density Companion Toggle sits beside Board view switcher with clear labels & 2x badge
    expect(boardSource).toContain('viewMode === "board" && onToggleDensity');
    expect(boardSource).toContain("Normal");
    expect(boardSource).toContain("Compact");
    expect(boardSource).toContain("2x");
    expect(boardSource).toContain("2 เท่า");
  });

  it("provides Jira-style table columns and status grouping in BoardListView", () => {
    expect(listViewSource).toContain("Task Title");
    expect(listViewSource).toContain("Status");
    expect(listViewSource).toContain("Priority");
    expect(listViewSource).toContain("Assignee");
    expect(listViewSource).toContain("Due Date");

    // Checkbox completion
    expect(listViewSource).toContain("handleToggleCardComplete");

    // Column moving / quick status changing
    expect(listViewSource).toContain("handleMoveColumn");

    // Inline task creation
    expect(listViewSource).toContain("handleQuickAdd");
    expect(listViewSource).toContain("Add Task");
  });

  it("supports multi-board UX in ProjectBoardsManager with search, filters, layout toggle, and deep-link highlight", () => {
    // Search and filter
    expect(settingsManagerSource).toContain("searchQuery");
    expect(settingsManagerSource).toContain("filterType");
    expect(settingsManagerSource).toContain("filteredBoards");
    expect(settingsManagerSource).toContain("Search boards by name...");

    // Stats bar
    expect(settingsManagerSource).toContain("Total Boards");
    expect(settingsManagerSource).toContain("Total Tasks");
    expect(settingsManagerSource).toContain("Public Boards");
    expect(settingsManagerSource).toContain("Private Boards");

    // Layout switcher (Grid vs Table)
    expect(settingsManagerSource).toContain("layoutMode");
    expect(settingsManagerSource).toContain('<LayoutGrid className="h-3.5 w-3.5"');
    expect(settingsManagerSource).toContain('<List className="h-3.5 w-3.5"');

    // Deep link auto-highlight
    expect(settingsManagerSource).toContain("highlightedBoardId");
    expect(settingsManagerSource).toContain("board-setting-card-");
    expect(settingsManagerSource).toContain("Current Selection");
  });

  it("provides full interactive spreadsheet table view matching reference grid in BoardListView", () => {
    // Headers matching English spreadsheet view
    expect(listViewSource).toContain("<span>Table</span>");
    expect(listViewSource).toContain("Task Title");
    expect(listViewSource).toContain("Priority");
    expect(listViewSource).toContain("Assignee");
    expect(listViewSource).toContain("Status");
    expect(listViewSource).toContain("Start Date");
    expect(listViewSource).toContain("Due Date");
    expect(listViewSource).toContain("Story Points");
    expect(listViewSource).toContain("Files");
    expect(listViewSource).toContain("Notes");

    // Priority pills with P0, P1, P2
    expect(listViewSource).toContain("P0");
    expect(listViewSource).toContain("P1");
    expect(listViewSource).toContain("P2");
    expect(listViewSource).toContain("handleUpdatePriority");

    // Status pills matching English labels
    expect(listViewSource).toContain('label: "Done"');
    expect(listViewSource).toContain('label: "In Progress"');
    expect(listViewSource).toContain('label: "To Do"');

    // Assignee dropdown assignment
    expect(listViewSource).toContain("handleUpdateAssignee");

    // Inline title edit and date editing
    expect(listViewSource).toContain("handleSaveTitle");
    expect(listViewSource).toContain("handleSaveDate");

    // ConfirmModal on task deletion
    expect(listViewSource).toContain("<ConfirmModal");
    expect(listViewSource).toContain("handleConfirmDelete");

    // DatePickers consistently use DD/MM/YYYY placeholder for empty state
    expect(listViewSource).toContain('placeholder="DD/MM/YYYY"');
    expect(listViewSource).not.toContain('placeholder="-"');
  });

  it("renders AssigneeAvatar and Avatar with actual profile photos instead of raw letter divs", () => {
    // BoardListView uses AssigneeAvatar in assignee cells and dropdown items
    expect(listViewSource).toContain('import { AssigneeAvatar } from "@/components/kanban/assignee-avatar"');
    expect(listViewSource).toContain("<AssigneeAvatar user={cardAssigneeList[0]} size={20} />");
    expect(listViewSource).toContain("<AssigneeAvatar user={member} size={20} />");

    // ProjectBoardsManager uses Avatar for board members and selection modals
    expect(settingsManagerSource).toContain('import { Avatar } from "@/components/ui/avatar"');
    expect(settingsManagerSource).toContain("<Avatar");
  });

  it("displays row index number by default and swaps to completion checkbox on hover in table view", () => {
    // Both flat and grouped views hide the row number on hover
    expect(listViewSource).toContain("group-hover/row:hidden select-none");
    // Both flat and grouped views show the checkbox on hover
    expect(listViewSource).toContain("hidden group-hover/row:grid h-4 w-4");
    // Completed state renders checked button immediately
    expect(listViewSource).toContain("border-emerald-500 bg-emerald-500 text-white");
  });
});

