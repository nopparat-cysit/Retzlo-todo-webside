import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("visual consistency guardrails", () => {
  it("uses shared EmptyState for hub and calendar empty surfaces", () => {
    const files = [
      "src/components/hub/notes-hub-panel.tsx",
      "src/components/hub/diary-hub-panel.tsx",
      "src/components/kanban/project-calendar.tsx",
      "src/components/project/projects-dashboard.tsx"
    ];

    files.forEach((path) => {
      const source = read(path);
      expect(source, path).toContain('import { EmptyState } from "@/components/ui/state"');
      expect(source, path).toContain("<EmptyState");
    });
  });

  it("keeps migrated feature empty states out of one-off handmade markup", () => {
    const notesHub = read("src/components/hub/notes-hub-panel.tsx");
    const diaryHub = read("src/components/hub/diary-hub-panel.tsx");
    const calendar = read("src/components/kanban/project-calendar.tsx");
    const projects = read("src/components/project/projects-dashboard.tsx");

    expect(notesHub).not.toContain("No notes in this filter.");
    expect(diaryHub).not.toContain("No diary items in this filter.");
    expect(calendar).not.toContain("No matching calendar items");
    expect(calendar).not.toContain("No items match the selected filters for this day.");
    expect(projects).not.toContain("No upcoming due dates yet.");
  });

  it("shows real product module cards in the design-system reference", () => {
    const source = read("src/app/design-system/design-system-preview.tsx");

    ["Project card", "Board card", "Finance panel", "Vital panel"].forEach((label) => {
      expect(source).toContain(label);
    });
  });
});
