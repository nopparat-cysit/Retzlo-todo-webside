import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Outside click dismiss contract across pickers and modals", () => {
  it("verifies use-outside-click hook uses capture phase for reliable dismiss", () => {
    const src = readFileSync(join(process.cwd(), "src/hooks/use-outside-click.ts"), "utf8");
    expect(src).toContain("export function useOutsideClickDismiss");
    expect(src).toContain("window.addEventListener(\"pointerdown\", handlePointerDown, true)");
    expect(src).toContain("window.addEventListener(\"keydown\", handleKeyDown, true)");
    expect(src).toContain("window.removeEventListener(\"pointerdown\", handlePointerDown, true)");
    expect(src).toContain("window.removeEventListener(\"keydown\", handleKeyDown, true)");
  });

  it("verifies TimePicker wires useOutsideClickDismiss with triggerRef and contentRef", () => {
    const src = readFileSync(join(process.cwd(), "src/components/ui/time-picker.tsx"), "utf8");
    expect(src).toContain("useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef)");
    expect(src).toContain("ref={triggerRef}");
    expect(src).toContain("ref={contentRef}");
  });

  it("verifies DatePicker wires useOutsideClickDismiss with triggerRef and contentRef", () => {
    const src = readFileSync(join(process.cwd(), "src/components/ui/date-picker.tsx"), "utf8");
    expect(src).toContain("useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef)");
    expect(src).toContain("ref={triggerRef}");
    expect(src).toContain("ref={contentRef}");
  });

  it("verifies DateTimePicker wires useOutsideClickDismiss with triggerRef and contentRef", () => {
    const src = readFileSync(join(process.cwd(), "src/components/ui/date-time-picker.tsx"), "utf8");
    expect(src).toContain("useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef)");
    expect(src).toContain("ref={triggerRef}");
    expect(src).toContain("ref={contentRef}");
  });
});
