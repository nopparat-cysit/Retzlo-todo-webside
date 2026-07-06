import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("product polish contracts", () => {
  it("exposes a design-system audit page with every shared primitive family", () => {
    const source = read("src/app/design-system/page.tsx");

    [
      "@/components/ui/app-modal",
      "@/components/ui/button",
      "@/components/ui/date-time-field",
      "@/components/ui/entity-card",
      "@/components/ui/filter-select",
      "@/components/ui/input",
      "@/components/ui/segmented-control",
      "@/components/ui/select",
      "@/components/ui/state",
      "@/components/ui/toolbar"
    ].forEach((importPath) => {
      expect(source).toContain(importPath);
    });

    expect(source).toContain("Toast feedback");
    expect(source).toContain("Design System");
  });

  it("keeps EmptyState and EntityCard flexible enough for polished product surfaces", () => {
    const stateSource = read("src/components/ui/state.tsx");
    const entityCardSource = read("src/components/ui/entity-card.tsx");

    expect(stateSource).toContain("tone?:");
    expect(stateSource).toContain("icon?: ReactNode");
    expect(stateSource).toContain("visual?: ReactNode");
    expect(stateSource).toContain("data-state-tone");

    expect(entityCardSource).toContain("media?: ReactNode");
    expect(entityCardSource).toContain("badges?: ReactNode");
    expect(entityCardSource).toContain("progress?: ReactNode");
    expect(entityCardSource).toContain("footer?: ReactNode");
  });

  it("keeps cursor effects restrained and opt-out friendly", () => {
    const source = read("src/components/ui/cursor-aura.tsx");

    expect(source).toContain("retrod:cursor-effects");
    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain("pointerType === \"touch\"");
    expect(source).toContain("data-cursor-aura");
  });
});
