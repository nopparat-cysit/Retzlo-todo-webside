import { describe, expect, it } from "vitest";

import { parseCreateNotePayload, parseUpdateNotePayload } from "./validation";

const DEFAULT_NOTE_STICKER = "/stickers/retro/retro-sticker-12-paper-note.png";

describe("note validation", () => {
  it("trims note titles when creating a note", () => {
    expect(parseCreateNotePayload({ title: "  Night notes  ", content: "  keep this  " })).toEqual({
      title: "Night notes",
      content: "keep this",
      emoji: DEFAULT_NOTE_STICKER,
      color: "DEFAULT",
      isHidden: false,
      dueDate: undefined,
      dueDateAllDay: false
    });
  });

  it("rejects empty note titles", () => {
    expect(() => parseCreateNotePayload({ title: "   ", content: "" })).toThrow();
  });

  it("allows partial note updates", () => {
    expect(parseUpdateNotePayload({ content: "Updated", dueDate: null, dueDateAllDay: true })).toEqual({
      content: "Updated",
      dueDate: null,
      dueDateAllDay: true
    });
  });

  it("accepts completion state updates", () => {
    expect(parseUpdateNotePayload({ isCompleted: true })).toEqual({
      isCompleted: true
    });
    expect(parseUpdateNotePayload({ isCompleted: false })).toEqual({
      isCompleted: false
    });
  });

  it("rejects non-boolean completion state updates", () => {
    expect(() => parseUpdateNotePayload({ isCompleted: "yes" })).toThrow();
  });

  it("treats null compact note content as empty text", () => {
    expect(parseCreateNotePayload({ title: "test", content: null })).toEqual({
      title: "test",
      content: "",
      emoji: DEFAULT_NOTE_STICKER,
      color: "DEFAULT",
      isHidden: false,
      dueDate: undefined,
      dueDateAllDay: false
    });
  });

  it("accepts note due date metadata", () => {
    expect(
      parseCreateNotePayload({
        title: "Calendar note",
        content: "Remember this",
        color: "CYAN",
        dueDate: "2026-05-26T10:00:00.000Z",
        dueDateAllDay: false
      })
    ).toEqual({
      title: "Calendar note",
      content: "Remember this",
      emoji: DEFAULT_NOTE_STICKER,
      color: "CYAN",
      isHidden: false,
      dueDate: "2026-05-26T10:00:00.000Z",
      dueDateAllDay: false
    });
  });

  it("accepts retro sticker paths as note emoji values", () => {
    const sticker = "/stickers/retro/retro-sticker-12-paper-note.png";

    expect(parseCreateNotePayload({ title: "Sticker note", content: "", emoji: sticker }).emoji).toBe(sticker);
    expect(parseUpdateNotePayload({ emoji: sticker })).toEqual({ emoji: sticker });
  });

  it("rejects colors outside the theme palette", () => {
    expect(() => parseCreateNotePayload({ title: "Note", color: "NEON", content: "" })).toThrow();
    expect(() => parseUpdateNotePayload({ color: "NEON" })).toThrow();
  });
});
