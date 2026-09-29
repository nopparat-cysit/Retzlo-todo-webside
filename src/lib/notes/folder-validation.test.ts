import { describe, expect, it } from "vitest";
import {
  parseCreateNoteFolderPayload,
  parseUpdateNoteFolderPayload,
  parseCreateNotePayload,
  parseUpdateNotePayload
} from "@/lib/notes/validation";

describe("Note Folders Validation", () => {
  it("validates valid folder creation payload", () => {
    const payload = {
      name: "Work Projects",
      color: "LAVENDER",
      icon: "💼"
    };
    const parsed = parseCreateNoteFolderPayload(payload);
    expect(parsed.name).toBe("Work Projects");
    expect(parsed.color).toBe("LAVENDER");
    expect(parsed.icon).toBe("💼");
  });

  it("applies defaults for color and icon when omitted in folder creation", () => {
    const parsed = parseCreateNoteFolderPayload({ name: "General" });
    expect(parsed.name).toBe("General");
    expect(parsed.color).toBe("DEFAULT");
    expect(parsed.icon).toBe("📁");
  });

  it("throws error when folder name is empty", () => {
    expect(() => parseCreateNoteFolderPayload({ name: "   " })).toThrow();
  });

  it("validates folder update payload", () => {
    const parsed = parseUpdateNoteFolderPayload({
      name: "Renamed Folder",
      color: "EMERALD"
    });
    expect(parsed.name).toBe("Renamed Folder");
    expect(parsed.color).toBe("EMERALD");
    expect(parsed.icon).toBeUndefined();
  });

  it("supports folderId in createNotePayload", () => {
    const parsed = parseCreateNotePayload({
      title: "My Note",
      content: "Hello",
      folderId: "folder-123"
    });
    expect(parsed.folderId).toBe("folder-123");
  });

  it("defaults folderId to null when omitted in createNotePayload", () => {
    const parsed = parseCreateNotePayload({
      title: "My Note",
      content: "Hello"
    });
    expect(parsed.folderId).toBeNull();
  });

  it("supports folderId in updateNotePayload", () => {
    const parsed = parseUpdateNotePayload({
      folderId: null
    });
    expect(parsed.folderId).toBeNull();
  });
});
