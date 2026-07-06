import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const notesPanelSource = readFileSync(new URL("./notes-panel.tsx", import.meta.url), "utf8");
const boardNotesRailSource = readFileSync(new URL("./board-notes-rail.tsx", import.meta.url), "utf8");

describe("note modal layering", () => {
  it("uses AppModal for the project notes modal", () => {
    expect(notesPanelSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(notesPanelSource).not.toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect(notesPanelSource).toContain("<AppModal");
  });

  it("uses AppModal for board note create and edit modals", () => {
    expect(boardNotesRailSource).toContain('import { AppModal } from "@/components/ui/app-modal"');
    expect(boardNotesRailSource).not.toContain('import { ModalPortal } from "@/components/ui/modal-portal"');
    expect((boardNotesRailSource.match(/<AppModal/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
