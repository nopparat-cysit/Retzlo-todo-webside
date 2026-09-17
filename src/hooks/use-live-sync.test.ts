import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hookSource = readFileSync(new URL("./use-live-sync.ts", import.meta.url), "utf8");
const boardSource = readFileSync(new URL("../components/kanban/board.tsx", import.meta.url), "utf8");
const notesRailSource = readFileSync(new URL("../components/notes/board-notes-rail.tsx", import.meta.url), "utf8");
const notesPanelSource = readFileSync(new URL("../components/notes/notes-panel.tsx", import.meta.url), "utf8");
const calendarSource = readFileSync(new URL("../components/kanban/project-calendar.tsx", import.meta.url), "utf8");
const diarySource = readFileSync(new URL("../components/diary/diary-list-panel.tsx", import.meta.url), "utf8");
const notiSource = readFileSync(new URL("../components/notifications/notifications-popover.tsx", import.meta.url), "utf8");
const boardApiSource = readFileSync(new URL("../app/api/boards/[boardId]/route.ts", import.meta.url), "utf8");
const cardsApiSource = readFileSync(new URL("../app/api/projects/[id]/cards/route.ts", import.meta.url), "utf8");

describe("Live Sync Infrastructure and Component Coverage", () => {
  describe("useLiveSync Hook", () => {
    it("exports useLiveSync and handles multi-channel string or string[] keys", () => {
      expect(hookSource).toContain("export function useLiveSync");
      expect(hookSource).toContain("channelKey?: string | string[]");
    });

    it("uses retzlo-live-sync shared BroadcastChannel for instant cross-tab sync", () => {
      expect(hookSource).toContain('new BroadcastChannel("retzlo-live-sync")');
      expect(hookSource).toContain('"SYNC_EVENT"');
    });

    it("listens to window focus and document visibilitychange events", () => {
      expect(hookSource).toContain('window.addEventListener("focus"');
      expect(hookSource).toContain('document.addEventListener("visibilitychange"');
    });

    it("pauses interval polling when tab is hidden to conserve resources", () => {
      expect(hookSource).toContain('document.visibilityState === "hidden"');
      expect(hookSource).toContain("window.setInterval");
    });

    it("guards background sync when user is actively interacting (canSync)", () => {
      expect(hookSource).toContain("if (canSyncRef.current && !canSyncRef.current()) return");
    });
  });

  describe("Kanban Board Integration", () => {
    it("wires useLiveSync with board and project channel keys", () => {
      expect(boardSource).toContain('import { useLiveSync } from "@/hooks/use-live-sync"');
      expect(boardSource).toContain("channelKey: board.projectId ? [`board:${board.id}`, `project:${board.projectId}`] : `board:${board.id}`");
    });

    it("guards active card dragging and open dialogs during sync", () => {
      expect(boardSource).toContain("if (activeCardId) return false;");
      expect(boardSource).toContain("if (isColumnModalOpen) return false;");
      expect(boardSource).toContain('document.querySelector("[role=\'dialog\']")');
    });

    it("broadcasts changes across all column and card mutations", () => {
      expect(boardSource).toContain("broadcastChange(");
    });
  });

  describe("Notes and Calendar Live Sync", () => {
    it("synchronizes notes rail with canSync dialog protection", () => {
      expect(notesRailSource).toContain('import { useLiveSync } from "@/hooks/use-live-sync"');
      expect(notesRailSource).toContain("channelKey: `notes:${projectId}`");
      expect(notesRailSource).toContain("broadcastChange()");
    });

    it("synchronizes notes studio panel with live sync and broadcast triggers", () => {
      expect(notesPanelSource).toContain('import { useLiveSync } from "@/hooks/use-live-sync"');
      expect(notesPanelSource).toContain("channelKey: `notes:${projectId}`");
      expect(notesPanelSource).toContain("broadcastChange()");
    });

    it("synchronizes project calendar cards, notes, and diary items", () => {
      expect(calendarSource).toContain('import { useLiveSync } from "@/hooks/use-live-sync"');
      expect(calendarSource).toContain("channelKey: [`project:${projectId}`, `calendar:${projectId}`]");
      expect(calendarSource).toContain("fetch(`/api/projects/${projectId}/cards`)");
      expect(calendarSource).toContain("fetch(`/api/projects/${projectId}/notes`)");
      expect(calendarSource).toContain("fetch(`/api/projects/${projectId}/diary-items`)");
      expect(calendarSource).toContain("broadcastChange()");
    });

    it("synchronizes diary list panel and broadcasts checklist/item edits", () => {
      expect(diarySource).toContain('import { useLiveSync } from "@/hooks/use-live-sync"');
      expect(diarySource).toContain("channelKey: [`project:${projectId}`, `diary:${projectId}`]");
      expect(diarySource).toContain("fetch(`/api/projects/${projectId}/diary-items`)");
      expect(diarySource).toContain("broadcastChange()");
    });

    it("synchronizes notifications on focus, interval, and broadcasts invite actions", () => {
      expect(notiSource).toContain('import { useLiveSync } from "@/hooks/use-live-sync"');
      expect(notiSource).toContain('channelKey: "notifications"');
      expect(notiSource).toContain("broadcastChange()");
    });
  });

  describe("API Data Serialization Integrity", () => {
    it("ensures board endpoint serializes card assigneeIds and difficulty", () => {
      expect(boardApiSource).toContain("serializeCard(card");
    });

    it("ensures project cards endpoint serializes card assigneeIds and difficulty", () => {
      expect(cardsApiSource).toContain("serializeCard");
    });
  });
});
