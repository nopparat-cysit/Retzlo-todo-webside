# Work Note: Custom Board Priorities & Multi-Assignee Support

**Date:** 2026-10-04  
**Objective:** Support customizable priority levels per board (up to 10 levels with 12 selectable retro lofi colors, customizable names, and reordering) and multi-assignee assignment in the list/spreadsheet view.

---

## 1. Files Created, Modified, or Moved

### Created
- `src/lib/kanban/priority.ts`: Core helper library defining `MAX_BOARD_PRIORITIES = 10`, 12 curated retro lofi color presets (`PRIORITY_COLOR_OPTIONS`), `DEFAULT_PRIORITIES` (High, Medium, Low), `resolveBoardPriorities`, `getPriorityMeta`, and `sortCardsByPriority`.
- `src/lib/kanban/priority.test.ts`: Vitest unit tests verifying resolution, fallback, 10-level cap, color resolution, and sorting by level.
- `src/components/kanban/board-priorities-tab.tsx`: Board Priorities manager tab component featuring inline rename inputs, 12-swatch color picker dropdown, up/down level reordering, item deletion, counter badge, and reset-to-defaults button.
- `docs/agent-notes/2026-10-04-custom-priorities-and-multi-assignee.md`: This work note.

### Modified
- `prisma/schema.prisma`: Added `customPriorities Json?` field to `Board` model.
- `src/types/kanban.ts`: Defined `CustomPriority` interface (`id`, `label`, `color`, `level`), relaxed `CardPriority` to `"LOW" | "MEDIUM" | "HIGH" | string`, and added `customPriorities?: CustomPriority[] | null` to `BoardSummary` and `BoardData`.
- `src/lib/kanban/serialize-card.ts`: Relaxed card priority parsing to preserve custom string priorities while falling back to `"MEDIUM"`.
- `src/lib/kanban/card-sort.ts`: Updated `sortCards` to accept optional `boardPriorities` and sort by custom priority levels.
- `src/app/api/boards/[boardId]/route.ts`: Added `customPriorities` validation (array of 1-10 items with id, label, color, level) to `updateBoardSchema`, persisted in database update transaction, and returned in response.
- `src/app/api/cards/route.ts`: Relaxed `priority` validation in `createCardSchema` and `updateCardSchema` from strict 3-item enum to `z.string().trim().min(1).max(50)`.
- `src/app/api/projects/[id]/boards/route.ts`: Included `customPriorities` in board list queries and board creation responses.
- `src/components/kanban/board-settings-modal.tsx`: Added `Priorities` tab to navigation, state management with dirty tracking, PATCH synchronization, and dispatched `board-priorities-updated` CustomEvent on save.
- `src/components/kanban/card.tsx`: Updated priority pill badge rendering in both comfortable and compact densities using resolved `getPriorityMeta`.
- `src/components/kanban/column.tsx`: Passed `priorities` down to `KanbanCard` and `CardModal`, updated `onCreateCard` payload type to `CardPriority`.
- `src/components/kanban/card-modal.tsx`: Rendered dynamic active board priorities in both mobile and desktop priority selectors with color swatches and active ring styling.
- `src/components/kanban/board.tsx`: Added `boardPriorities` state, listened for `board-priorities-updated` event, passed `boardPriorities` to `sortCards`, `KanbanColumn`, `BoardListView`, and `CardModal`, and added a direct `Priorities` button in the header toolbar.
- `src/components/kanban/board-list-view.tsx`:
  - Priority dropdown in Table and Grouped views updated to render active board priorities with color indicators.
  - Priority sorting updated to sort by `meta.level` (level 1 = most urgent).
  - Multi-assignee support: added `handleToggleAssignee` and `handleClearAllAssignees`, rendered avatar stack (`+N` counter and title tooltip) when multiple assignees are selected, and checkable dropdown menu with preventDefault selection.
- `docs/system-guide.md`: Updated Section 2.3 with Custom Priorities and Multi-Assignee workflows.
- `src/components/help/help-center-client.tsx`: Updated in-app Knowledge Base & Help with dedicated `custom-board-priorities` topic and multi-assignee details in `spreadsheet-table-view`.

---

## 2. Important Behavior Changes

1. **Custom Priority System per Board:**
   - Boards now support anywhere from 1 to 10 custom priority levels.
   - Each level has a custom label, level index (1 = highest urgency), and one of 12 retro lofi colors.
   - Existing boards without custom priorities automatically fall back to the default High (Rose), Medium (Indigo), and Low (Sky) levels without data migration needed.
   - Kanban cards, detail modals, table views, and sorting honor the board's custom priority levels.

2. **Multi-Assignee Support in List View:**
   - In both Spreadsheet Table view and Column Grouped accordion view, clicking the assignee cell opens a multi-select dropdown.
   - Selecting a member toggles their assignment without abruptly closing the menu.
   - If multiple members are assigned, an avatar stack with member initials and a count badge (e.g. `2 assignees`) is rendered.
   - Users can click "Clear all assignees" to unassign all members in a single action.

3. **Direct Board Toolbar Access:**
   - Added a `Priorities` button on the board header toolbar with level count badge that directly opens `BoardSettingsModal` with the `Priorities` tab active.

---

## 3. Database / Schema Changes

- Neon PostgreSQL table `Board`: added `customPriorities JSONB NULL`.
- Ran `npx prisma db push` to synchronize changes with Neon serverless database.
- Generated Prisma Client with `npx prisma generate`.

---

## 4. Verification Commands Run & Results

- `npx prisma db push`: Applied schema changes to database (Success).
- `npx prisma validate`: Prisma schema is valid (Exit code 0).
- `npx vitest run src/lib/kanban/priority.test.ts src/components/kanban/board-views-and-sidebar.test.ts`: Passed all 11 unit tests (Exit code 0).
- `npx tsc --noEmit`: Strict TypeScript check passed with 0 errors (Exit code 0).
- `npm run lint`: Next.js ESLint passed with 0 warnings or errors (Exit code 0).
- `npm run build`: Production Next.js build completed and optimized all 36 pages (Exit code 0).

---

## 5. Known Follow-ups, Blockers, or Deployment Notes

- None. All features are fully functional, typed, covered by unit tests, and verified against the production build.
