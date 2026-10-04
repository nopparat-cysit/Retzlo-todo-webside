# Work Note: Assignee Profile Avatar Display in Table & Management Views

- **Date:** 2026-10-04
- **Objective:** Fetch and display real user profile avatar photos in the Kanban Table (Spreadsheet) view assignee dropdowns and cells, as well as project board member management modals, falling back gracefully to deterministic colored initials.

## Files Modified

- `src/components/kanban/board-list-view.tsx`
  - Replaced hardcoded single and multi-assignee letter initials with `<AssigneeAvatar />` from `@/components/kanban/assignee-avatar`.
  - Replaced hardcoded initials in the Assignee dropdown menu items with `<AssigneeAvatar user={member} size={20} />` for both Flat table mode and Grouped accordion mode.
- `src/components/project/project-boards-manager.tsx`
  - Replaced hardcoded initials with `<Avatar />` in board access member previews, Create Board member picker, and Edit Access member picker.
- `src/components/kanban/board-views-and-sidebar.test.ts`
  - Added contract verification tests ensuring `BoardListView` and `ProjectBoardsManager` render `AssigneeAvatar` and `Avatar` instead of raw initial divs.

## Behavior Changes

- In the Kanban Table / Spreadsheet view:
  - Users with Cloudinary or custom avatars now show their real avatar image in the assignee dropdown menu and table cells.
  - Users without avatars continue to show clean uppercase initials with deterministic theme hashing colors.
- In the Project Boards Manager:
  - Private board access avatars and member selection lists in modals now render real avatar photos if available.

## Database / Schema Changes

- None. Database records (`pm.user.avatar`) and server queries already selected the avatar field.

## Verification Run & Results

- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts`: Passed (7 tests passed).
- `npx vitest run src/components/kanban/`: Passed (8 test files, 37 tests passed).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (`No ESLint warnings or errors`).
- `npm run build`: Passed (Next.js production build succeeded).
- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid`).

## Deployment / Follow-ups

- Ready for commit and push.
