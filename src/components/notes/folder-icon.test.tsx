import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  FOLDER_ICON_OPTIONS,
  FolderIconGlyph,
  isFolderIcon,
  normalizeFolderIcon,
  type FolderIconId
} from "./folder-icon";

describe("folder-icon", () => {
  it("provides all 16 retro vector folder icon options", () => {
    expect(FOLDER_ICON_OPTIONS).toHaveLength(16);
    const ids = FOLDER_ICON_OPTIONS.map((opt) => opt.id);
    expect(new Set(ids).size).toBe(16);
  });

  describe("normalizeFolderIcon", () => {
    it("maps all 16 canonical IDs directly", () => {
      const canonicalIds: FolderIconId[] = [
        "folder",
        "folder-open",
        "briefcase",
        "rocket",
        "lightbulb",
        "book",
        "target",
        "tag",
        "palette",
        "note",
        "coffee",
        "star",
        "sparkles",
        "heart",
        "calendar",
        "trophy"
      ];

      for (const id of canonicalIds) {
        expect(normalizeFolderIcon(id)).toBe(id);
      }
    });

    it("maps all legacy emojis to their corresponding canonical IDs", () => {
      const emojiMappings: Record<string, FolderIconId> = {
        "\u{1F4C1}": "folder",
        "\u{1F4C2}": "folder-open",
        "\u{1F4BC}": "briefcase",
        "\u{1F680}": "rocket",
        "\u{1F4A1}": "lightbulb",
        "\u{1F4DA}": "book",
        "\u{1F3AF}": "target",
        "\u{1F3F7}\uFE0F": "tag",
        "\u{1F3F7}": "tag",
        "\u{1F3A8}": "palette",
        "\u{1F4DD}": "note",
        "\u{2615}": "coffee",
        "\u{2B50}": "star",
        "\u{1F31F}": "star",
        "\u{2728}": "sparkles",
        "\u{2764}\uFE0F": "heart",
        "\u{2764}": "heart",
        "\u{1F496}": "heart",
        "\u{1F4C5}": "calendar",
        "\u{1F4C6}": "calendar",
        "\u{1F3C6}": "trophy"
      };

      for (const [emoji, expectedId] of Object.entries(emojiMappings)) {
        expect(normalizeFolderIcon(emoji)).toBe(expectedId);
      }
    });

    it("falls back to 'folder' for null, undefined, empty, or whitespace", () => {
      expect(normalizeFolderIcon(null)).toBe("folder");
      expect(normalizeFolderIcon(undefined)).toBe("folder");
      expect(normalizeFolderIcon("")).toBe("folder");
      expect(normalizeFolderIcon("   ")).toBe("folder");
      expect(normalizeFolderIcon("unrecognized-custom-name")).toBe("folder");
    });
  });

  describe("isFolderIcon", () => {
    it("returns true for valid IDs and known emojis", () => {
      expect(isFolderIcon("folder")).toBe(true);
      expect(isFolderIcon("rocket")).toBe(true);
      expect(isFolderIcon("\u{1F680}")).toBe(true);
      expect(isFolderIcon("\u{1F4C1}")).toBe(true);
    });

    it("returns false for undefined, null, empty or unknown strings", () => {
      expect(isFolderIcon(null)).toBe(false);
      expect(isFolderIcon(undefined)).toBe(false);
      expect(isFolderIcon("")).toBe(false);
      expect(isFolderIcon("random-string")).toBe(false);
    });
  });

  describe("FolderIconGlyph", () => {
    it("renders SVG with viewBox for all 16 canonical IDs", () => {
      for (const opt of FOLDER_ICON_OPTIONS) {
        const markup = renderToStaticMarkup(
          <FolderIconGlyph icon={opt.id} className="h-5 w-5" />
        );
        expect(markup).toContain("<svg");
        expect(markup).toContain('viewBox="0 0 24 24"');
        expect(markup).toContain('class="h-5 w-5"');
        expect(markup).toContain('aria-hidden="true"');
      }
    });

    it("renders SVG for legacy emojis", () => {
      const markup = renderToStaticMarkup(
        <FolderIconGlyph icon={"\u{1F680}"} className="h-4 w-4" />
      );
      expect(markup).toContain("<svg");
      expect(markup).toContain('viewBox="0 0 24 24"');
      expect(markup).toContain('class="h-4 w-4"');
    });

    it("renders default folder SVG when icon is null or undefined", () => {
      const markupNull = renderToStaticMarkup(<FolderIconGlyph icon={null} />);
      expect(markupNull).toContain("<svg");
      expect(markupNull).toContain('viewBox="0 0 24 24"');

      const markupUndef = renderToStaticMarkup(<FolderIconGlyph />);
      expect(markupUndef).toContain("<svg");
      expect(markupUndef).toContain('viewBox="0 0 24 24"');
    });

    it("renders span fallback for unrecognized strings", () => {
      const markup = renderToStaticMarkup(
        <FolderIconGlyph icon="custom-icon-name" className="text-sm" />
      );
      expect(markup).not.toContain("<svg");
      expect(markup).toContain('<span class="text-sm">custom-icon-name</span>');
    });
  });
});
