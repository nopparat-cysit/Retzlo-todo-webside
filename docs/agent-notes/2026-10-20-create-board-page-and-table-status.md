# 2026-10-20: Dedicated Create Board Page & Table Status Alignment

## Objective
Convert board creation from a cramped modal dialog to a dedicated full-page experience (`/project/[id]/board/new`) with a side-by-side layout (form on left, live mockup preview sticky on right), and resolve Table View status anomalies by aligning card statuses (`Todo`, `Doing`, `Waiting`, `Done`) with column workflow transitions.

## Files Created, Modified, Deleted, or Moved
- **Created**:
  - `src/app/(dashboard)/project/[id]/board/new/page.tsx` — Server component for dedicated board creation route with auth and project authorization.
  - `src/components/kanban/create-board-page-view.tsx` — Responsive 2-column full-page interface (left: form, right: live interactive mockup).
  - `src/components/kanban/create-board-page-view.test.ts` — Comprehensive unit tests verifying contract, layout, and behaviors.
  - `docs/agent-notes/2026-10-20-create-board-page-and-table-status.md` — This work session note.
- **Modified**:
  - `src/components/kanban/board-template-picker.tsx` — Added `layout?: "grid" | "vertical"` prop. In `vertical` mode, renders spacious, full-width unclipped cards showing complete template names, descriptions, steps badge, and radio checkmark indicator without truncation.
  - `src/components/kanban/create-board-page-view.tsx` — Switched template picker to `layout="vertical"` and expanded container width (up to `2xl:max-w-[1440px]`).
  - `src/components/kanban/create-board-page-view.test.ts` — Added unit test assertion for `layout="vertical"`.
  - `src/components/kanban/board-list-view.tsx` — Fixed status mappings, added dual-section popover for Card Status & Move Column, dynamic status filters.
  - `src/components/kanban/board.tsx` — Passed `boardId` to `BoardListView`.
  - `src/lib/kanban/status.ts` — Included `dot` color indicator in `getStatusMeta` return object.
  - `src/components/kanban/board-sidebar-dropdown.tsx` — Updated "Create new board" buttons to navigate to `/project/[id]/board/new`.
  - `src/components/project/projects-dashboard.tsx` — Updated "New Board" button and blueprint cards to navigate to `/project/[id]/board/new`.
  - `src/components/project/project-boards-manager.tsx` — Updated "New board" button to navigate to `/project/[id]/board/new`.
  - `docs/theme-system.md` — Documented coverage and retro lofi indigo token integration.
  - `docs/system-guide.md` — Documented dedicated full-page board creator and table status alignment.
  - `src/components/help/help-center-client.tsx` — Updated in-app knowledge base description.

## Important Behavior Changes
1. **Dedicated Board Creation Page**:
   - Clicking "New Board" / "Create new board" from the workspace navigation bar, sidebar, or projects hub navigates to `/project/[id]/board/new`.
   - Desktop view displays a spacious 2-column layout: Form settings on the left (`lg:col-span-5`) and a sticky Live Mockup Preview on the right (`lg:col-span-7`) updating immediately as the user types the board name or changes templates.
   - **Vertical Template Selection ("ทำเป็นแนวตั้ง และขยายส่วนนี้")**: Replaced the cramped 5-column horizontal grid (`lg:grid-cols-5`) in `CreateBoardPageView` with a comfortable vertical stack (`layout="vertical"`). Each template card is full-width, displaying the template artwork icon, full title without truncation (`Standard board`, `Scrum`, `Software development`, `Marketing`, `Personal`), readable description, steps count, and active radio indicator.
   - Preserves `CreateBoardModal` with `layout="grid"` for backwards compatibility with existing unit tests.
2. **Table View Status Dropdown & Filters**:
   - Status pill labels and colors now match the canonical statuses: `Todo` (indigo), `Doing` (teal), `Waiting` (amber), `Done` (emerald) + custom statuses.
   - Clicking the Status pill in Table mode opens a dual-section menu:
     1. **Card Status**: Direct status update (`Todo`, `Doing`, `Waiting`, `Done`) matching the Card Modal with checkmarks.
     2. **Move Column**: Moves card between workflow columns (`Backlog`, `In Progress`, `Done`) with checkmarks and status synchronization.
   - Added `Waiting` status to the top table filter chips.

## Database / Schema Changes
- None (uses existing Prisma schema and API endpoints).

## Verification Commands & Results
- `npx vitest run src/components/kanban/create-board-page-view.test.ts` (6 tests passed).
- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts` (9 tests passed).
- `npx vitest run src/components/kanban/create-board-modal.test.ts` (6 tests passed).
- `npx vitest run src/lib/kanban/status.test.ts` (3 tests passed).
- Full Vitest suite (`npm test`): 101 test files passed, 540 tests passed, 0 failed.
- Prisma schema validation (`npx prisma validate`): Valid.
- Next.js linting (`npm run lint`): Passed.
- Next.js production build (`npm run build`): Passed.

## Known Follow-ups, Blockers, or Deployment Notes
- None. All changes are backward compatible, typed strictly with TypeScript, and follow the retro lofi indigo design direction.
