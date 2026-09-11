import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "src/components/modules/module-selector.tsx"), "utf8");

describe("ModuleSelector default module feature", () => {
  it("imports default module helpers and toast", () => {
    expect(source).toContain("getDefaultModule");
    expect(source).toContain("setDefaultModule");
    expect(source).toContain("useToast");
  });

  it("renders a star button on available module cards", () => {
    expect(source).toContain("<Star");
    expect(source).toContain("handleToggleStar");
    expect(source).toContain("e.stopPropagation()");
  });

  it("displays '★ Default' tag and amber styling when a module is default", () => {
    expect(source).toContain("★ Default");
    expect(source).toContain("border-dusk-amber");
    expect(source).toContain("fill-dusk-amber text-dusk-amber");
  });

  it("shows toast notifications when setting or clearing default module", () => {
    expect(source).toContain('set as default startup module');
    expect(source).toContain('Removed "');
  });
});
