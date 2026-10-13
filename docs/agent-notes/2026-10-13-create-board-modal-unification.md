# 2026-10-13 - Create Board Modal Unification & Cross-Page UI Parity

## Objective
Unify the disparate "Create Board" implementations across the application into a single canonical, rich `CreateBoardModal` component. Resolve UI/UX divergences, feature gaps, and navigation bugs identified during the system-wide consistency audit.

## Files Created, Modified, Deleted
- **Created**:
  - `src/components/kanban/create-board-modal.tsx`: Canonical shared modal with Board Name, Template Picker (5+ templates), Privacy Selector (Public vs Private), and selective Member Access checkboxes.
  - `src/components/kanban/create-board-modal.test.ts`: Focused unit test suite verifying contracts, typing, templates, privacy toggle, and toast notifications.
- **Modified**:
  - `src/components/kanban/board-sidebar-dropdown.tsx`: Replaced duplicated inline 70-line modal and hardcoded `isPrivate: false` with `<CreateBoardModal autoNavigate />`.
  - `src/components/project/projects-dashboard.tsx`: Replaced private duplicated `CreateBoardModal` with canonical shared component; added missing `Diary` navigation link in the Workspace sub-navigation bar.
  - `src/components/project/project-boards-manager.tsx`: Replaced 130-line Modal 1 and duplicate creation states with canonical `<CreateBoardModal />`.
  - `src/components/hub/diary-hub-panel.tsx`: Added `repeatUnit` (DAY vs MONTH) and target `dueTime` fields to `DiaryItemModal` in the Hub panel to achieve full feature parity with project diary.
  - `src/components/ui/button.tsx`: Fixed `ghost` button variant from duplicating `secondary` (with border and paper background) to a true borderless transparent style.
  - `src/components/ui/back-button.tsx`: Changed fallback route for `/help` and `/contact` to `/projects` so authenticated users don't get kicked out to the marketing landing page.

## Important Behavior Changes
- **Feature Parity in Board Creation**:
  - Creating a board from Workspace Hub now supports choosing templates (Software Sprint, Marketing, Simple Todo, etc.) instead of forcing an empty 3-column board.
  - Creating a board from the Kanban Board dropdown now supports setting Privacy (Public vs Private) and selecting members, instead of forcing a public board.
  - Creating a board from Project Settings now uses the same standard modal rather than divergent "Sub-project" terminology.
- **Sub-navigation Completeness**: Workspace Hub now displays the `Diary` tab alongside Boards Hub, Calendar, Notes, Members, and Rewards.
- **Hub Diary Feature Parity**: Creating or editing diary items from the Hub panel now supports recurring cadence ("DAY" vs "MONTH") and target due time.

## Database / Schema Changes
- None. Backend API `/api/projects/[id]/boards` already supported `templateId`, `isPrivate`, and `memberUserIds`.

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/create-board-modal.test.ts`: Passed (6/6 tests).
- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts`: Passed (9/9 tests).
- `npx vitest run src/components/project/projects-dashboard.test.ts`: Passed (5/5 tests).
- `npx vitest run src/components/diary`: Passed (3/3 tests).
- `npx vitest run`: Passed full test suite (99 test files, 524 tests passed).
- `npm run lint`: Passed (✔ No ESLint warnings or errors).
- `npx prisma validate`: Passed (The schema at prisma\schema.prisma is valid 🚀).
- `npm run build`: Passed (Compiled successfully, all 40 routes generated).
