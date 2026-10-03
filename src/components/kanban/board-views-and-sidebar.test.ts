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
    expect(sidebarSource).toContain("/settings?boardId=");
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
  });

  it("provides Jira-style table columns and status grouping in BoardListView", () => {
    expect(listViewSource).toContain("Work (Task Title)");
    expect(listViewSource).toContain("Status / Column");
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
    // Headers matching reference screenshot
    expect(listViewSource).toContain("ตารางงาน (Table)");
    expect(listViewSource).toContain("งาน / Work (Task Title)");
    expect(listViewSource).toContain("รายการสำคัญ / Priority");
    expect(listViewSource).toContain("เจ้าของ / Assignee");
    expect(listViewSource).toContain("สถานะ / Status / Column");
    expect(listViewSource).toContain("วันที่เริ่มต้น");
    expect(listViewSource).toContain("วันที่สิ้นสุด / Due Date");
    expect(listViewSource).toContain("ความยาก");
    expect(listViewSource).toContain("ส่งไฟล์");
    expect(listViewSource).toContain("โน้ต");

    // Priority pills with P0, P1, P2
    expect(listViewSource).toContain("P0");
    expect(listViewSource).toContain("P1");
    expect(listViewSource).toContain("P2");
    expect(listViewSource).toContain("handleUpdatePriority");

    // Status pills matching reference
    expect(listViewSource).toContain("เสร็จสมบูรณ์");
    expect(listViewSource).toContain("กำลังดำเนิน...");
    expect(listViewSource).toContain("ยังไม่เริ่ม");

    // Assignee dropdown assignment
    expect(listViewSource).toContain("handleUpdateAssignee");

    // Inline title edit and date editing
    expect(listViewSource).toContain("handleSaveTitle");
    expect(listViewSource).toContain("handleSaveDate");

    // ConfirmModal on task deletion
    expect(listViewSource).toContain("<ConfirmModal");
    expect(listViewSource).toContain("handleConfirmDelete");
  });
});

