import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./confirm-modal.tsx", import.meta.url), "utf8");

describe("ConfirmModal layering", () => {
  it("renders through the shared body portal", () => {
    expect(source).toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect(source).toMatch(/<ModalPortal>[\s\S]*role="dialog"[\s\S]*<\/ModalPortal>/);
  });

  it("isolates pointer and click events from sortable ancestors", () => {
    expect(source).toMatch(/onPointerDown=\{\(event\) => event\.stopPropagation\(\)\}/);
    expect(source).toMatch(/onClick=\{\(event\) => event\.stopPropagation\(\)\}/);
    expect(source).toMatch(/function handleKeyDown[\s\S]*e\.stopPropagation\(\)/);
  });
});
