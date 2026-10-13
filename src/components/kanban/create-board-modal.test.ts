import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Unified CreateBoardModal contract and feature parity", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/kanban/create-board-modal.tsx"),
    "utf8"
  );

  it("exports CreateBoardModal component with proper typing", () => {
    expect(source).toContain("export function CreateBoardModal");
    expect(source).toContain("export interface CreateBoardModalProps");
    expect(source).toContain("export interface CreatedBoardResult");
  });

  it("supports BoardTemplatePicker for template selection", () => {
    expect(source).toContain("<BoardTemplatePicker");
    expect(source).toContain("DEFAULT_BOARD_TEMPLATE_ID");
    expect(source).toContain("templateId");
  });

  it("supports Public vs Private privacy selection", () => {
    expect(source).toContain("isPrivate");
    expect(source).toContain("setIsPrivate(false)");
    expect(source).toContain("setIsPrivate(true)");
    expect(source).toContain("<Globe");
    expect(source).toContain("<Lock");
  });

  it("supports selective member assignment for private boards", () => {
    expect(source).toContain("selectedMemberIds");
    expect(source).toContain("toggleMember");
    expect(source).toContain("memberUserIds");
  });

  it("posts to boards endpoint with unified payload", () => {
    expect(source).toMatch(/fetch\(`\/api\/projects\/\$\{projectId\}\/boards`,\s*\{/);
    expect(source).toContain('method: "POST"');
    expect(source).toContain("trimmedName");
  });

  it("triggers toast notification upon board creation", () => {
    expect(source).toMatch(/toast\(\{\s*message:.*created successfully/);
  });
});
