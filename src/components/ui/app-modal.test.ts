import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./app-modal.tsx", import.meta.url), "utf8");

describe("AppModal layering contract", () => {
  it("renders through the shared body portal", () => {
    expect(source).toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect(source).toMatch(/<ModalPortal>[\s\S]*role="dialog"[\s\S]*<\/ModalPortal>/);
  });

  it("isolates pointer, click, and keyboard events from the page behind it", () => {
    expect(source).toMatch(/function handleOverlayPointerDown[\s\S]*event\.stopPropagation\(\)/);
    expect(source).toMatch(/function handleOverlayClick[\s\S]*event\.stopPropagation\(\)/);
    expect(source).toMatch(/function stopModalContentEvent[\s\S]*event\.stopPropagation\(\)/);
    expect(source).toMatch(/function handleModalContentKeyDown[\s\S]*event\.stopPropagation\(\)/);
  });

  it("routes dirty closes through the shared discard confirmation", () => {
    expect(source).toContain("hasUnsavedChanges");
    expect(source).toContain("<ConfirmModal");
    expect(source).toMatch(/event\.key === "Escape"[\s\S]*requestClose\(\)/);
  });
});
