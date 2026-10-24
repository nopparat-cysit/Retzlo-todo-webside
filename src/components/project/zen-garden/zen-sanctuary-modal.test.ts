import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./zen-sanctuary-modal.tsx", import.meta.url), "utf8");

describe("ZenSanctuaryModal contract & render safety", () => {
  it("renders through the shared body portal to prevent popover clipping", () => {
    expect(source).toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect(source).toContain("<ModalPortal>");
    expect(source).toContain("</ModalPortal>");
  });

  it("safely accesses bilingual season strings without rendering raw objects as React children", () => {
    // Must NOT render raw `{seasonLabels}` as a child which causes "Objects are not valid as a React child"
    expect(source).not.toMatch(/<p[^>]*>\s*\{seasonLabels\}\s*<\/p>/);
    expect(source).toContain("{isEn ? seasonLabels.en : seasonLabels.th}");
  });

  it("renders the resolved bilingual fortune in the dedicated reader", () => {
    expect(source).toContain("<ZenFortuneReading");
    expect(source).toContain("resolveFortuneData");
    expect(source).toContain("dimensions={dimensions}");
  });

  it("supports daily watering to reveal omikuji fortune and award bonus coins", () => {
    expect(source).toContain('action: "nurture"');
    expect(source).toContain("handleDailyWater");
    expect(source).toContain("ZenGameToolLadle");
  });
});
