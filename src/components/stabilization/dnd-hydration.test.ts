import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectNavSource = readFileSync(new URL("../project/project-sortable-nav.tsx", import.meta.url), "utf8");
const columnSource = readFileSync(new URL("../kanban/column.tsx", import.meta.url), "utf8");

describe("dnd hydration stability", () => {
  it("suppresses dnd-kit generated aria id hydration drift on sortable handles", () => {
    expect(projectNavSource).toMatch(/suppressHydrationWarning[\s\S]*\{\.\.\.attributes\}/);
    expect(columnSource).toMatch(/suppressHydrationWarning[\s\S]*\{\.\.\.attributes\}/);
  });
});
