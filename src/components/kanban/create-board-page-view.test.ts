import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("CreateBoardPageView full-page dedicated workflow and preview UX contract", () => {
  const source = readFileSync(
    join(process.cwd(), "src/components/kanban/create-board-page-view.tsx"),
    "utf8"
  );
  const pageSource = readFileSync(
    join(process.cwd(), "src/app/(dashboard)/project/[id]/board/new/page.tsx"),
    "utf8"
  );

  it("exports CreateBoardPageView component and props interface", () => {
    expect(source).toContain("export function CreateBoardPageView");
    expect(source).toContain("export interface CreateBoardPageViewProps");
  });

  it("provides dedicated route with project authorization and shell integration", () => {
    expect(pageSource).toContain("requireUserId");
    expect(pageSource).toContain("getProjectMembership");
    expect(pageSource).toContain("<CreateBoardPageView");
  });

  it("implements responsive 2-column layout with form on left and mockup preview on right", () => {
    expect(source).toContain("lg:col-span-5");
    expect(source).toContain("lg:col-span-7");
    expect(source).toContain("lg:sticky");
    expect(source).toContain("Live Board Preview");
    expect(source).toContain("<BoardMockupPreview");
  });

  it("provides back link navigation to the active project board", () => {
    expect(source).toContain("<ArrowLeft");
    expect(source).toContain("Back to Board");
    expect(source).toContain("/project/${projectId}/board");
  });

  it("supports template selection with preview separated to right-side panel and vertical layout", () => {
    expect(source).toContain("<BoardTemplatePicker");
    expect(source).toContain("hidePreview={true}");
    expect(source).toContain('layout="vertical"');
    expect(source).toContain("DEFAULT_BOARD_TEMPLATE_ID");
  });

  it("submits unified POST payload to projects boards endpoint and shows toast notification", () => {
    expect(source).toMatch(/fetch\(`\/api\/projects\/\$\{projectId\}\/boards`,\s*\{/);
    expect(source).toContain('method: "POST"');
    expect(source).toMatch(/toast\(\{\s*message:.*created successfully/);
  });

  it("provides persistent top-right Create Board action linked to form", () => {
    expect(source).toContain('form="create-board-page-form"');
    expect(source).toContain('id="create-board-page-form"');
  });
});
