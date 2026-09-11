import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "src/components/project/projects-dashboard.tsx"), "utf8");

describe("ProjectsDashboard project editing contract", () => {
  it("renders ConfirmModal in EditProjectModal for save confirmation", () => {
    expect(source).toContain("function EditProjectModal");
    expect(source).toMatch(/function EditProjectModal[\s\S]*<ConfirmModal[\s\S]*open=\{confirmSaveOpen\}[\s\S]*onConfirm=\{handleSave\}/);
  });

  it("guards against accidental close with hasUnsavedChanges on AppModal in EditProjectModal", () => {
    expect(source).toMatch(/function EditProjectModal[\s\S]*hasUnsavedChanges=\{isDirty\}/);
    expect(source).toContain("const isDirty =");
  });

  it("includes coverImage in the update payload when saving project edits", () => {
    expect(source).toMatch(/PATCH[\s\S]*coverImage:\s*coverPreview/);
  });

  it("supports optimistic updates when project is edited or deleted", () => {
    expect(source).toContain("onUpdateProject?: (updated: ProjectDashboardItem) => void");
    expect(source).toContain("onDeleteProject?: (id: string) => void");
    expect(source).toContain("setProjectList((prev) => prev.map");
    expect(source).toContain("setProjectList((prev) => prev.filter");
  });

  it("renders ConfirmModal for project deletion", () => {
    expect(source).toMatch(/function ProjectCard[\s\S]*<ConfirmModal[\s\S]*open=\{deleteOpen\}[\s\S]*onConfirm=\{async/);
  });
});
