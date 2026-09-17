# 2026-09-17 Multi-User Live Sync and Real-Time Auto Update

## Objective

Implement multi-user and cross-tab automatic synchronization across Kanban boards, notes, calendars, diaries, notifications, and workspaces so changes reflect automatically without requiring manual page refresh (F5).

## Files changed

- Created `src/hooks/use-live-sync.ts`
- Created `src/hooks/use-live-sync.test.ts`
- Modified `src/components/kanban/board.tsx`
- Modified `src/components/notes/board-notes-rail.tsx`
- Modified `src/components/notes/notes-panel.tsx`
- Modified `src/components/kanban/project-calendar.tsx`
- Modified `src/components/diary/diary-list-panel.tsx`
- Modified `src/components/notifications/notifications-popover.tsx`
- Modified `src/components/project/projects-dashboard.tsx`
- Modified `src/app/(dashboard)/project/[id]/board/page.tsx`
- Modified `src/app/api/boards/[boardId]/route.ts`
- Modified `src/app/api/projects/[id]/cards/route.ts`
- Created `docs/agent-notes/2026-09-17-multi-user-live-sync.md`

## Behavior changes

- **Live Synchronization Engine (`useLiveSync`)**:
  - Implemented 3-layer sync:
    1. Instant cross-tab broadcast (< 50ms) using `BroadcastChannel("retzlo-live-sync")` with multi-channel matching (`board:id`, `project:id`, `notes:id`, `diary:id`, `notifications`, `projects`).
    2. Instant sync upon window `focus` or tab switching (`visibilitychange` -> `visible`).
    3. Low-overhead adaptive polling (4-8s) active only when document is visible (paused when hidden).
  - Built-in safe `canSync` interaction lock that prevents overwriting state when user is dragging cards or has dialogs/modals open (`document.querySelector("[role='dialog']")`).
- **Kanban Board (`board.tsx`)**:
  - Automatically fetches updated columns and cards on board/project events.
  - Broadcasts mutation events on column create/update/delete, card create/save/delete, drag-and-drop moves, and undo actions.
- **Notes Rail & Notes Studio (`board-notes-rail.tsx`, `notes-panel.tsx`)**:
  - Real-time updates for pinned and project notes.
  - Broadcasts on note creation, updating, star/unstar, complete/restore, and deletion.
- **Project Calendar (`project-calendar.tsx`)**:
  - Automatically updates cards, notes, and diary checklist items.
  - Broadcasts on card edit/delete and diary checklist toggle.
- **Project Diary (`diary-list-panel.tsx`)**:
  - Real-time synchronization for diary items and habit checklists.
  - Broadcasts on item create, edit, checklist toggle, and deletion.
- **Notifications Popover (`notifications-popover.tsx`)**:
  - Real-time sync for invitations and system notifications, triggering immediately on focus or broadcast.
- **Projects Dashboard (`projects-dashboard.tsx`)**:
  - Real-time refresh for project workspaces and calendar cards.
- **Server API Serialization**:
  - Enhanced `GET /api/boards/[boardId]` and `GET /api/projects/[id]/cards` to serialize card fields (`assigneeIds`, `difficulty`, `startDate`, etc.) using `serializeCard`, preventing setting loss on refresh.

## Database/schema changes

- None.

## Verification

- `npm test`: 53 test files passed, 218 unit tests passed.
- `npx vitest run src/hooks/use-live-sync.test.ts`: 15 passed out of 15 tests.
- `npm run lint`: Passed with 0 errors and 0 warnings.
- `npx prisma validate`: Schema valid.
- `npm run build`: Production build completed successfully for all 31 routes.

## Follow-ups

- None. Ready for deployment.
