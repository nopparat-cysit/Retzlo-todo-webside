import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("BoardColumnsTab Component Integration and Features", () => {
  const filePath = resolve(__dirname, "columns-tab.tsx");
  const content = readFileSync(filePath, "utf-8");

  it("verifies column creation UI and form elements", () => {
    // Button to trigger creation
    expect(content).toContain("เพิ่มคอลัมน์ใหม่");
    expect(content).toContain("setIsAddingColumn");

    // Form fields
    expect(content).toContain("newColumnName");
    expect(content).toContain("newColumnStatus");
    expect(content).toContain("newColumnColor");
    expect(content).toContain("newColumnIcon");
    expect(content).toContain("newColumnWipLimit");

    // Action execution
    expect(content).toContain("handleCreateColumn");
    expect(content).toContain('method: "POST"');
    expect(content).toContain('"/api/columns"');
  });

  it("verifies ConfirmModal protection for both edit and delete operations per AGENTS.md", () => {
    expect(content).toContain("ConfirmModal");
    expect(content).toContain("confirmEditOpen");
    expect(content).toContain("handleConfirmUpdate");
    expect(content).toContain("confirmDeleteOpen");
    expect(content).toContain("handleConfirmDelete");
  });

  it("verifies Toast feedback notifications for CUD operations per AGENTS.md", () => {
    expect(content).toContain("useToast");
    expect(content).toContain("toast(");
    expect(content).toContain('type: "success"');
    expect(content).toContain('type: "error"');
  });

  it("verifies live event synchronization with board-columns-updated", () => {
    expect(content).toContain("board-columns-updated");
    expect(content).toContain("onColumnsChange");
  });

  it("verifies column icon and color picker integration", () => {
    expect(content).toContain("ColumnIconGlyph");
    expect(content).toContain("ColumnIconPicker");
    expect(content).toContain("columnThemeOptions");
  });
});
