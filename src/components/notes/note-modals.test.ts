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

  it("does not auto-select newly created notes upon creation", () => {
    expect(notesPanelSource).not.toMatch(/setNotes\(\(current\) => \[note, \.\.\.current\]\);\s*setSelectedNote\(note\);/);
    expect(boardNotesRailSource).not.toMatch(/setNotes\(\(current\) => \[note, \.\.\.current\]\);\s*setSelectedNote\(note\);/);
  });

  it("closes note edit modals upon saving changes", () => {
    expect(notesPanelSource).toContain("setSelectedNote(null)");
    expect(boardNotesRailSource).toContain("setSelectedNote(null)");
  });

  it("uses DateTimeField matching CardModal for due date selection", () => {
    expect(notesPanelSource).toContain('import { DateTimeField } from "@/components/ui/date-time-field"');
    expect(notesPanelSource).toContain("<DateTimeField");
    expect(notesPanelSource).toContain('label="วันที่สิ้นสุด (Due / End Date)"');
  });

  it("uses Radix UI Select for folder and board selection without raw HTML select", () => {
    expect(notesPanelSource).toContain('from "@/components/ui/select"');
    expect(notesPanelSource).toContain("<Select");
    expect(notesPanelSource).toContain("<SelectTrigger");
    expect(notesPanelSource).not.toContain("<select");
  });

  it("defaults initial note scope to current board in board notes rail modal and provides full notes feature set", () => {
    expect(boardNotesRailSource).toContain('activeBoardId ? "board" : "private"');
    expect(boardNotesRailSource).toContain("<DateTimeField");
    expect(boardNotesRailSource).toContain('label="วันที่สิ้นสุด (Due / End Date)"');
    expect(boardNotesRailSource).toContain("NoteStickerPicker");
    expect(boardNotesRailSource).toContain("Folder (โฟลเดอร์)");
    expect(boardNotesRailSource).toContain('name="modal-scope"');
  });

  it("renders explicit labels for title and description sections in note modals", () => {
    // In notes panel modal
    expect(notesPanelSource).toContain("Title (หัวข้อโน้ต)");
    expect(notesPanelSource).toContain("Description (รายละเอียดโน้ต)");
    expect(notesPanelSource).toContain('htmlFor="panel-note-title"');
    expect(notesPanelSource).toContain('htmlFor="panel-note-content"');

    // In board notes rail create & edit modals
    expect(boardNotesRailSource).toContain("Title (หัวข้อโน้ต)");
    expect(boardNotesRailSource).toContain("Description (รายละเอียดโน้ต)");
    expect(boardNotesRailSource).toContain('htmlFor="rail-create-note-title"');
    expect(boardNotesRailSource).toContain('htmlFor="rail-create-note-content"');
    expect(boardNotesRailSource).toContain('htmlFor="rail-edit-note-title"');
    expect(boardNotesRailSource).toContain('htmlFor="rail-edit-note-content"');
  });
});

