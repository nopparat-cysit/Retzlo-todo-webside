# Work Note: Table Story Points Sorting & Checklist Column Fix

**Date:** 2026-10-10  
**Objective:** Enable interactive Story Points sorting in Spreadsheet Table View and correct the mislabeled "Files" column to "Checklist" without displaying "0 files".

## Context & User Request
The user reported:
1. In the Spreadsheet Table View, clicking the Story Points column did not sort the tasks by story points.
2. The column displaying card checklist subtask progress (`0/3`, `0/4`) was mistakenly titled "Files" with a Paperclip icon, and rendered `0 files` when empty instead of representing checklist progress.

## Changes Made
- Modified `src/components/kanban/board-list-view.tsx`:
  - Added `"storyPoints"` and `"checklist"` to `TableSortField`.
  - Added Story Points sorting logic to the table comparator (`useMemo`):
    - When sorting ascending: tasks with lowest points (1, 3, 5, etc.) appear first, and cards without points are placed at the bottom.
    - When sorting descending: tasks with highest points (21, 16, 8, etc.) appear first, and cards without points are placed at the bottom.
    - Preserves stable tie-break order using card position.
  - Added Checklist sorting logic to sort by total checklist subtask items.
  - Added `renderSortIcon(field)` helper: displays `ArrowUp` for asc, `ArrowDown` for desc, and `ChevronDown` for inactive state across all sortable headers.
  - Renamed the header column from "Files" (`Paperclip` icon) to "Checklist" (`CheckSquare` icon).
  - Made both "Story Points" and "Checklist" table headers interactive and sortable on click.
  - Replaced the erroneous `0 files` fallback in both flat table mode and grouped mode with a clean dash (`-`).
  - Removed unused `Paperclip` import.
- Modified `src/components/kanban/board-views-and-sidebar.test.ts`:
  - Updated test assertions to expect "Checklist" instead of "Files".
  - Added assertions for `handleSort("storyPoints")`, `handleSort("checklist")`, and verifying that `0 files` and `<Paperclip` are no longer present.

## Files Modified
- `src/components/kanban/board-list-view.tsx`
- `src/components/kanban/board-views-and-sidebar.test.ts`
- `docs/agent-notes/2026-10-10-table-story-points-sort-and-checklist-column.md`

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts`: Passed (9/9 tests).
- `npx vitest run`: Passed (91/91 test suites, 478 passed, 3 skipped).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Production build verified.

## Follow-ups / Blockers
- None.
