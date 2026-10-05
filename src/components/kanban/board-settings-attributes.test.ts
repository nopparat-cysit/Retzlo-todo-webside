import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { DEFAULT_STATUS_OPTIONS, getStatusMeta, getStoredStatuses, type CustomStatusOption } from "@/lib/kanban/status";
import { DEFAULT_STORY_POINTS, STORY_POINT_PRESETS, getStoredStoryPoints } from "@/lib/kanban/difficulty";
import { DEFAULT_PRIORITIES, resolveBoardPriorities } from "@/lib/kanban/priority";
import { columnSettingsSchema } from "@/lib/kanban/column-settings";

describe("Board Settings and Attributes Synchronization Integration", () => {
  describe("Source Code Integrity & Integration", () => {
    it("verifies BoardSettingsModal includes Attributes tab with status, priority, and story points", () => {
      const modalPath = resolve(__dirname, "board-settings-modal.tsx");
      const modalContent = readFileSync(modalPath, "utf-8");

      // Verify BoardAttributesTab is imported and used
      expect(modalContent).toContain("BoardAttributesTab");
      expect(modalContent).toContain('value="attributes"');
      expect(modalContent).toContain("คุณสมบัติการ์ด");

      // Verify resolveTabState handles various entry points
      expect(modalContent).toContain("resolveTabState");
      expect(modalContent).toContain('subTab: "priority"');
      expect(modalContent).toContain('subTab: "status"');
      expect(modalContent).toContain('subTab: "story-points"');
    });

    it("verifies BoardAttributesTab implements all 3 sub-tabs with actions and ConfirmModal protection", () => {
      const attrPath = resolve(__dirname, "board-attributes-tab.tsx");
      const attrContent = readFileSync(attrPath, "utf-8");

      // Verify sub-tabs
      expect(attrContent).toContain("สถานะการ์ด (Status)");
      expect(attrContent).toContain("ระดับความสำคัญ (Priority)");
      expect(attrContent).toContain("Story Points");

      // Verify ConfirmModal for destructive actions per AGENTS.md
      expect(attrContent).toContain("ConfirmModal");
      expect(attrContent).toContain("handleConfirmDeleteStatus");
      expect(attrContent).toContain("handleResetStatuses");
      expect(attrContent).toContain("handleConfirmDeletePoint");
      expect(attrContent).toContain("handleResetStoryPoints");

      // Verify status workflow templates & editing integration per AGENTS.md
      expect(attrContent).toContain("STATUS_WORKFLOW_TEMPLATES");
      expect(attrContent).toContain("handleConfirmApplyTemplate");
      expect(attrContent).toContain("handleSaveCustomTemplate");
      expect(attrContent).toContain("handleConfirmEditStatus");
      expect(attrContent).toContain("isApplyTemplateConfirmOpen");
      expect(attrContent).toContain("isEditStatusConfirmOpen");

      // Verify event synchronization
      expect(attrContent).toContain("retzlo:statuses-updated");
      expect(attrContent).toContain("retzlo:story-points-updated");
      expect(attrContent).toContain("useToast");
    });

    it("verifies BoardPrioritiesTab implements ConfirmModal protection and toast notifications for delete and reset", () => {
      const prioPath = resolve(__dirname, "board-priorities-tab.tsx");
      const prioContent = readFileSync(prioPath, "utf-8");

      expect(prioContent).toContain("ConfirmModal");
      expect(prioContent).toContain("useToast");
      expect(prioContent).toContain("priorityToDelete");
      expect(prioContent).toContain("handleConfirmDeletePriority");
      expect(prioContent).toContain("isResetConfirmOpen");
      expect(prioContent).toContain("handleConfirmResetToDefault");
    });

    it("verifies ColumnStatusPicker supports dynamic custom statuses and boardId event sync", () => {
      const pickerPath = resolve(__dirname, "column-status-picker.tsx");
      const pickerContent = readFileSync(pickerPath, "utf-8");

      expect(pickerContent).toContain("boardId?: string");
      expect(pickerContent).toContain("customStatuses?: CustomStatusOption[]");
      expect(pickerContent).toContain("retzlo:statuses-updated");
      expect(pickerContent).toContain("getStoredStatuses");
      expect(pickerContent).toContain("getStatusMeta");
      expect(pickerContent).toContain("isAddingStatus");
      expect(pickerContent).toContain("handleQuickAddStatus");
      expect(pickerContent).toContain("เพิ่มสถานะ");
    });

    it("verifies column.tsx and board.tsx pass boardId to ColumnStatusPicker", () => {
      const columnPath = resolve(__dirname, "column.tsx");
      const columnContent = readFileSync(columnPath, "utf-8");
      expect(columnContent).toContain("<ColumnStatusPicker value={settingsDefaultCardStatus} onChange={setSettingsDefaultCardStatus} boardId={boardId} />");

      const boardPath = resolve(__dirname, "board.tsx");
      const boardContent = readFileSync(boardPath, "utf-8");
      expect(boardContent).toContain("<ColumnStatusPicker value={columnDefaultCardStatus} onChange={setColumnDefaultCardStatus} boardId={board.id} />");
      expect(boardContent).toContain('title="Configure custom status, priorities, and story points for this board"');
    });

    it("verifies card-modal.tsx listens to global sync events", () => {
      const cardModalPath = resolve(__dirname, "card-modal.tsx");
      const cardModalContent = readFileSync(cardModalPath, "utf-8");

      expect(cardModalContent).toContain("retzlo:statuses-updated");
      expect(cardModalContent).toContain("retzlo:story-points-updated");
      expect(cardModalContent).toContain("retzlo:priorities-updated");
    });
  });

  describe("Column Settings Schema with Custom Statuses", () => {
    it("accepts both default and custom card statuses as defaultCardStatus for columns", () => {
      const defaultCol = columnSettingsSchema.parse({
        name: "To Do Lane",
        defaultCardStatus: "TODO"
      });
      expect(defaultCol.defaultCardStatus).toBe("TODO");

      const customCol = columnSettingsSchema.parse({
        name: "QA Testing Lane",
        defaultCardStatus: "IN_QA"
      });
      expect(customCol.defaultCardStatus).toBe("IN_QA");
    });
  });

  describe("Status Metadata with Custom Options", () => {
    it("resolves status metadata correctly for system and custom statuses", () => {
      const customList: CustomStatusOption[] = [
        { value: "IN_REVIEW", label: "In Review", color: "purple" },
        { value: "DEPLOYED", label: "Deployed", color: "emerald" }
      ];

      const reviewMeta = getStatusMeta("IN_REVIEW", customList);
      expect(reviewMeta.label).toBe("In Review");
      expect(reviewMeta.badgeClass).toContain("purple");

      const todoMeta = getStatusMeta("TODO", customList);
      expect(todoMeta.label).toBe("Todo");
    });
  });
});
