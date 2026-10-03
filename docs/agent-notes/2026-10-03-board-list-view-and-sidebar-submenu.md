# 2026-10-03 — Board & List View Switcher, Sidebar Accordion Sub-Menu, and Multi-Board Settings UX

## Objective
Implement a Jira-style dual view switcher (`Board` vs `List`) on the project board page, transform the sidebar board dropdown into an inline accordion sub-menu with a `...` action menu (Star ⭐, Manage Members, Save as Template, Direct Settings link), and upgrade the project settings page to handle multi-board UX smoothly.

## Files Created / Modified
- `src/components/kanban/board-list-view.tsx` (created): Interactive table/list view grouped by column/status with completion checkboxes, priority badges, member avatars, difficulty/points, due date indicators, status dropdowns, and inline task creation.
- `src/components/kanban/board.tsx` (modified): Added view switcher tabs (`Board` and `List`) next to the board title, `viewMode` state persisted in localStorage, and conditional rendering between Kanban columns (`DndContext`) and `BoardListView`.
- `src/components/kanban/board-sidebar-dropdown.tsx` (modified): Upgraded from a floating Popover DropdownMenu to an inline collapsible Accordion Sub-Menu. Added `...` options per board for starring (⭐), managing members, saving board template, and directly navigating to `/settings?boardId=...`.
- `src/components/project/project-boards-manager.tsx` (modified): Added multi-board stats overview bar (Total Boards, Tasks, Public, Private), live search input, filter chips (All, Public, Private), layout switcher (Grid cards vs Table rows), and deep-link auto-highlighting when navigating with `?boardId=...`.
- `src/components/kanban/board-views-and-sidebar.test.ts` (created): Comprehensive unit tests verifying sidebar sub-menu contracts, view switching in `KanbanBoard`, `BoardListView` grouping and table columns, and multi-board settings UX.
- `src/lib/theme/ui-variants.test.ts` (modified): Updated legacy color assertions (`emerald`/`red`) to semantic theme tokens (`theme-success`/`theme-danger`).

## Important Behavior Changes
1. **Top View Switcher (`Board` | `List`)**:
   - Users can switch between Kanban Columns and a Jira-style table/list view with a single click at the top of `/project/[id]/board`.
   - The selected view mode is remembered per browser session in `localStorage` (`kanban_active_view_mode`).
2. **Sidebar Sub-Menu Accordion**:
   - The "Boards" menu item in the project sidebar is now an inline accordion expanding directly down instead of requiring a separate dropdown menu popup.
   - Each board has a `...` menu with:
     - Star / Unstar board (saved in localStorage).
     - Manage members (opens board settings modal on access tab).
     - Save as template (exports structure into custom templates).
     - Settings (navigates to `/settings?boardId=...`).
3. **Settings Multi-Board Management**:
   - Settings page now includes a search bar, filter tabs, summary statistics, grid vs table layout, and highlights the target board if opened from the sidebar.

## Verification Run & Results
- `npx vitest run`: 76 test files passed, 377 tests passed (100% pass).
- `npx tsc --noEmit`: 0 errors.
- `npm run lint`: No ESLint warnings or errors.
- `npx prisma validate`: Prisma schema is valid.
- `npm run build`: Production build succeeded (Exit code 0).
