import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Board Settings Modal - Board Switcher Dropdown Integration", () => {
  const modalPath = join(process.cwd(), "src/components/kanban/board-settings-modal.tsx");
  const modalContent = readFileSync(modalPath, "utf-8");

  it("exports availableBoards and onBoardChange in BoardSettingsModalProps", () => {
    expect(modalContent).toContain("availableBoards?: Array<{");
    expect(modalContent).toContain("onBoardChange?: (newBoardId: string) => void;");
  });

  it("renders a DropdownMenu trigger on the board title in the modal header", () => {
    expect(modalContent).toContain('id="board-settings-title"');
    expect(modalContent).toMatch(/<DropdownMenu>[\s\S]*<DropdownMenuTrigger asChild>[\s\S]*<ChevronDown/);
    expect(modalContent).toContain("Select Board");
    expect(modalContent).toContain("handleSelectBoard");
  });

  it("loads project boards on mount and listens for board-renamed events", () => {
    expect(modalContent).toMatch(/fetch\(`\/api\/projects\/\$\{projectId\}\/boards`\)/);
    expect(modalContent).toContain('addEventListener("board-renamed"');
  });

  it("protects unsaved changes with a ConfirmModal when user attempts to switch boards", () => {
    expect(modalContent).toContain("discardConfirmOpen");
    expect(modalContent).toMatch(/<ConfirmModal[\s\S]*open=\{discardConfirmOpen\}[\s\S]*title="Discard Unsaved Changes\?"/);
    expect(modalContent).toContain("applySwitchBoard");
  });

  it("dynamically passes activeBoardId to attributes, columns, danger tabs, and settings links", () => {
    expect(modalContent).toContain("<BoardAttributesTab");
    expect(modalContent).toContain("boardId={activeBoardId}");
    expect(modalContent).toContain("<BoardColumnsTab");
    expect(modalContent).toContain("<BoardDangerTab");
    expect(modalContent).toMatch(/href=\{`\/project\/\$\{projectId\}\/settings\?tab=board-general&boardId=\$\{activeBoardId\}`\}/);
  });
});
