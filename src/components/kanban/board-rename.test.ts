import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Board rename capabilities and contracts", () => {
  const boardSource = readFileSync(join(process.cwd(), "src/components/kanban/board.tsx"), "utf8");
  const tabsBarSource = readFileSync(join(process.cwd(), "src/components/kanban/board-tabs-bar.tsx"), "utf8");
  const modalSource = readFileSync(join(process.cwd(), "src/components/kanban/board-settings-modal.tsx"), "utf8");
  const apiSource = readFileSync(join(process.cwd(), "src/app/api/boards/[boardId]/route.ts"), "utf8");

  it("provides direct inline board renaming on the KanbanBoard with ConfirmModal protection", () => {
    expect(boardSource).toContain("isEditingBoardName");
    expect(boardSource).toContain("requestRenameBoard");
    expect(boardSource).toContain("handleConfirmRenameBoard");
    expect(boardSource).toMatch(/<ConfirmModal[\s\S]*open=\{confirmRenameOpen\}[\s\S]*title="Rename Board"/);
    expect(boardSource).toContain("board-renamed");
  });

  it("listens to board-renamed events and updates BoardTabsBar reactively", () => {
    expect(tabsBarSource).toContain("setBoardsList");
    expect(tabsBarSource).toMatch(/addEventListener\(["']board-renamed["']/);
    expect(tabsBarSource).toContain("boardsList.map");
  });

  it("preserves user input in BoardSettingsModal without being overwritten by background fetch", () => {
    expect(modalSource).toMatch(/setName\(\(prev\)\s*=>\s*\(prev\s*===\s*boardName/);
    expect(modalSource).toContain("board-renamed");
  });

  it("authorizes board rename for project members with access while guarding privacy changes to owners/admins", () => {
    expect(apiSource).toContain("isOwnerOrAdmin");
    expect(apiSource).toMatch(/payload\.isPrivate\s*!==\s*undefined[\s\S]*!isOwnerOrAdmin/);
    expect(apiSource).toContain("canAccessBoard(board, userId, membership.role)");
  });
});
