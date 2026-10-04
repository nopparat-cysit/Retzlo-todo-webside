import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  DEFAULT_STATUS_OPTIONS,
  STATUS_COLOR_CONFIGS,
  getStatusMeta,
  type CustomStatusOption
} from "@/lib/kanban/status";
import {
  DEFAULT_STORY_POINTS,
  STORY_POINT_PRESETS,
  getDifficultyMetadata,
  type CustomStoryPoint
} from "@/lib/kanban/difficulty";
import {
  DEFAULT_PRIORITIES,
  PRIORITY_COLOR_OPTIONS,
  getPriorityColorConfig,
  resolveBoardPriorities
} from "@/lib/kanban/priority";

describe("Card Attributes Edit Feature", () => {
  describe("Source Code Integrity & Integration", () => {
    it("verifies card-modal.tsx includes + buttons for Status, Priority, and Story Points", () => {
      const cardModalPath = resolve(__dirname, "card-modal.tsx");
      const cardModalContent = readFileSync(cardModalPath, "utf-8");

      // Verify CardAttributesEditModal is imported and mounted
      expect(cardModalContent).toContain("CardAttributesEditModal");
      expect(cardModalContent).toContain("isEditAttributesOpen");
      expect(cardModalContent).toContain("editAttributesTab");

      // Verify + buttons for all 3 attributes
      expect(cardModalContent).toContain('title="Add or Edit Statuses"');
      expect(cardModalContent).toContain('title="Add or Edit Priorities"');
      expect(cardModalContent).toContain('title="Add or Edit Story Points"');

      // Verify tabs switching
      expect(cardModalContent).toContain('setEditAttributesTab("status")');
      expect(cardModalContent).toContain('setEditAttributesTab("priority")');
      expect(cardModalContent).toContain('setEditAttributesTab("story-points")');
    });

    it("verifies card-attributes-edit-modal.tsx implements all 3 tabs with reorder, add, and reset", () => {
      const editModalPath = resolve(__dirname, "card-attributes-edit-modal.tsx");
      const editModalContent = readFileSync(editModalPath, "utf-8");

      // Verify tabs
      expect(editModalContent).toContain('value="status"');
      expect(editModalContent).toContain('value="priority"');
      expect(editModalContent).toContain('value="story-points"');

      // Verify ConfirmModal usage for destructive actions per AGENTS.md
      expect(editModalContent).toContain("ConfirmModal");
      expect(editModalContent).toContain("handleConfirmDeleteStatus");
      expect(editModalContent).toContain("handleResetStatuses");
      expect(editModalContent).toContain("handleConfirmDeletePriority");
      expect(editModalContent).toContain("handleResetPriorities");
      expect(editModalContent).toContain("handleConfirmDeletePoint");
      expect(editModalContent).toContain("handleResetStoryPoints");

      // Verify toast feedback per AGENTS.md
      expect(editModalContent).toContain("useToast");
    });
  });

  describe("Status Attribute Logic", () => {
    it("provides default status options", () => {
      expect(DEFAULT_STATUS_OPTIONS.length).toBe(4);
      expect(DEFAULT_STATUS_OPTIONS.map((s) => s.value)).toEqual(["TODO", "DOING", "WAITING", "DONE"]);
    });

    it("resolves metadata for custom status", () => {
      const customStatuses: CustomStatusOption[] = [
        { value: "IN_REVIEW", label: "In Review", color: "purple" },
        { value: "BLOCKED", label: "Blocked", color: "rose" }
      ];

      const reviewMeta = getStatusMeta("IN_REVIEW", customStatuses);
      expect(reviewMeta.label).toBe("In Review");
      expect(reviewMeta.badgeClass).toContain("purple");

      const blockedMeta = getStatusMeta("BLOCKED", customStatuses);
      expect(blockedMeta.label).toBe("Blocked");
      expect(blockedMeta.badgeClass).toContain("rose");
    });

    it("falls back to standard status metadata when no custom option matches", () => {
      const meta = getStatusMeta("TODO");
      expect(meta.label).toBe("Todo");
      expect(meta.badgeClass).toBe(STATUS_COLOR_CONFIGS.indigo.badgeClass);
    });
  });

  describe("Priority Attribute Logic", () => {
    it("resolves default board priorities", () => {
      const priorities = resolveBoardPriorities();
      expect(priorities.length).toBeGreaterThanOrEqual(3);
      expect(priorities.map((p) => p.label.toUpperCase())).toContain("HIGH");
      expect(priorities.map((p) => p.label.toUpperCase())).toContain("MEDIUM");
      expect(priorities.map((p) => p.label.toUpperCase())).toContain("LOW");
    });

    it("provides valid color configurations for all priority color options", () => {
      for (const color of Object.keys(PRIORITY_COLOR_OPTIONS)) {
        const config = getPriorityColorConfig(color);
        expect(config).toBeDefined();
        expect(config.pillClass).toBeDefined();
        expect(config.dotClass).toBeDefined();
      }
    });
  });

  describe("Story Points Attribute Logic", () => {
    it("provides story point presets including retzlo, fibonacci, linear, and tshirt", () => {
      expect(STORY_POINT_PRESETS.retzlo).toBeDefined();
      expect(STORY_POINT_PRESETS.fibonacci).toBeDefined();
      expect(STORY_POINT_PRESETS.linear).toBeDefined();
      expect(STORY_POINT_PRESETS.tshirt).toBeDefined();

      expect(STORY_POINT_PRESETS.retzlo.points.map((p) => p.score)).toEqual([1, 3, 5, 8, 16, 21]);
      expect(STORY_POINT_PRESETS.fibonacci.points.map((p) => p.score)).toEqual([1, 2, 3, 5, 8, 13, 21]);
      expect(STORY_POINT_PRESETS.linear.points.map((p) => p.score)).toEqual([1, 2, 4, 8, 16, 24, 40]);
    });

    it("resolves custom story point metadata with custom label and color", () => {
      const customPoints: CustomStoryPoint[] = [
        {
          score: 13,
          label: "13",
          pointsLabel: "13 pts",
          title: "ยากมากพิเศษ (13 pts)",
          description: "งานขนาดใหญ่",
          color: "rose"
        }
      ];

      const meta = getDifficultyMetadata(13, customPoints);
      expect(meta).not.toBeNull();
      expect(meta?.title).toBe("ยากมากพิเศษ (13 pts)");
      expect(meta?.badgeClass).toContain("rose");
    });
  });
});
