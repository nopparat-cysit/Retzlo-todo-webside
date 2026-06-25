import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/components/notes/notes-panel.tsx"), "utf8");

describe("NotesPanel reward-style layout", () => {
  it("uses the approved note studio regions", () => {
    expect(source).toContain('data-notes-layout="reward-style"');
    expect(source).toContain('data-notes-hero-layout="single-row"');
    expect(source).toContain('data-notes-collection-rail="note-shelves"');
    expect(source).toContain('data-notes-board="note-cards"');
    expect(source).toContain('data-notes-quick-capture="quick-capture"');
  });

  it("keeps stickers inside the note studio hero", () => {
    expect(source).toContain("/stickers/retro/retro-sticker-12-paper-note.png");
    expect(source).toContain("/stickers/retro/retro-sticker-11-pencil.png");
  });

  it("keeps the note studio hero compact", () => {
    expect(source).toContain("grid-rows-[max-content_minmax(0,1fr)]");
    expect(source).toContain("px-4 py-2.5");
    expect(source).not.toContain("min-h-[76px]");
    expect(source).not.toContain("min-h-[116px]");
    expect(source).toContain("h-12 w-14");
  });

  it("does not use decorative absolute glow blobs in the note studio hero", () => {
    expect(source).not.toContain("pointer-events-none absolute -right-8 -top-10");
    expect(source).not.toContain("bg-dusk-lavender/10 blur-3xl");
  });

  it("uses retro stickers instead of the old emoji picker", () => {
    expect(source).toContain("NoteStickerPicker");
    expect(source).toContain("renderNoteSticker");
    expect(source).not.toContain("function EmojiPicker");
    expect(source).not.toContain("const NOTE_EMOJIS");
  });

  it("lays note cards out in three columns on wide screens", () => {
    expect(source).toContain("xl:grid-cols-3");
    expect(source).not.toContain("lg:grid-cols-2");
  });

  it("lets the note board switch between grid and list views", () => {
    expect(source).toContain('data-notes-view-mode-toggle="grid-list"');
    expect(source).toContain('data-notes-board-view={viewMode}');
    expect(source).toContain('type NoteViewMode = "grid-2" | "grid-3" | "grid-4" | "list"');
    expect(source).toContain('viewMode === "grid-2" && "grid md:grid-cols-2"');
    expect(source).toContain('viewMode === "grid-4" && "grid sm:grid-cols-2 xl:grid-cols-4"');
  });
});
