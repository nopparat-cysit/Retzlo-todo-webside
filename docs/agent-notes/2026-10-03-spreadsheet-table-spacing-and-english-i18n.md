# 2026-10-03 Spreadsheet Table Spacing and Full English Localization

## Date & Short Objective
- **Date:** 2026-10-03
- **Objective:** Fix cramped spacing on the right-hand side of the Spreadsheet Table View (widen Start Date, Due Date, Story Points, Files, Notes, and Actions columns, and expand container min-width to 1240px with bottom padding). Translate all table headers, filter tabs, dropdown menus, placeholders, row cells, and footer summaries from Thai into clean, professional English.

## Files Created, Modified, Deleted, or Moved
- **Created:**
  - `docs/agent-notes/2026-10-03-spreadsheet-table-spacing-and-english-i18n.md`: This work session note.
- **Modified:**
  - `src/components/kanban/board-list-view.tsx`:
    - Widened Start Date and Due Date from `w-28` (112px) to `w-36` (144px), providing ample room for `DD/MM/YYYY` values and the clear button without any clipping (`25/09/202...`).
    - Widened Story Points and Files from `w-24` (96px) to `w-28` (112px).
    - Widened Notes from `w-20` (80px) to `w-24` (96px).
    - Widened Actions column from `w-12` (48px) to `w-14` (56px).
    - Expanded table grid min-width from `min-w-[1020px]` to `min-w-[1240px]` with `pb-16` to ensure comfortable horizontal scrolling and prevent floating buttons from blocking rows.
    - Localized all UI text to English:
      - Topbar tab: `Table` (formerly `ตารางงาน (Table)`).
      - Search input: `Search tasks...` (formerly `ค้นหางานในตาราง...`).
      - Filters: `All`, `To Do`, `In Progress`, `Done`.
      - View toggle: `Table` and `Group`.
      - Headers: `Task Title`, `Priority`, `Assignee`, `Status`, `Start Date`, `Due Date`, `Story Points`, `Files`, `Notes`, `•••`.
      - Dropdown labels & items: `Priority` (`P0 • High (Urgent)`, `P1 • Medium`, `P2 • Low`), `Assignee` (`Unassign`), `Move Column / Status`, `Edit task`, `Unstar` / `Star`, `Delete task`.
      - Quick add row: `+ Add new task (type title and press Enter)...` and `Add Task` button.
      - Summary footer: `Total: X tasks`, `Done: Y`, `In progress: Z`, and action guide text.
  - `src/components/kanban/board-views-and-sidebar.test.ts`:
    - Updated assertions to match the English headers, view labels, and status pill labels.

## Important Behavior Changes
- Dates in the table (Start Date and Due Date) now fit completely without truncation or ellipsis.
- The right side of the spreadsheet table has generous padding and breathing room.
- Entire spreadsheet experience is localized into English.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts`: Passed (6/6 tests).
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (0 warnings or errors).
- `npx prisma validate`: Passed (Prisma schema is valid).
- `npm run build`: Running in background (`task-24525`).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
