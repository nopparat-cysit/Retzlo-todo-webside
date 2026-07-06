import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("visual consistency guardrails", () => {
  it("uses shared EmptyState for finance, hub, and calendar empty surfaces", () => {
    const files = [
      "src/components/finance/finance-empty-state.tsx",
      "src/components/finance/category-breakdown.tsx",
      "src/components/finance/subscription-list.tsx",
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
    const finance = read("src/components/finance/transaction-list.tsx");
    const categories = read("src/components/finance/category-breakdown.tsx");
    const subscriptions = read("src/components/finance/subscription-list.tsx");
    const projects = read("src/components/project/projects-dashboard.tsx");

    expect(notesHub).not.toContain("No notes in this filter.");
    expect(diaryHub).not.toContain("No diary items in this filter.");
    expect(calendar).not.toContain("No matching calendar items");
    expect(calendar).not.toContain("No items match the selected filters for this day.");
    expect(finance).not.toContain("No transactions yet.");
    expect(categories).not.toContain("No expense data this month.");
    expect(subscriptions).not.toContain("No active recurring bills.");
    expect(projects).not.toContain("No upcoming due dates yet.");
  });

  it("shows real product module cards in the design-system reference", () => {
    const source = read("src/app/design-system/design-system-preview.tsx");

    ["Project card", "Board card", "Finance panel", "Vital panel"].forEach((label) => {
      expect(source).toContain(label);
    });
  });
});
