# 2026-09-19 - Workspace Boards Hub

## Objective

Transform the projects dashboard from feeling like disconnected "separate projects" into a unified Workspace Boards Hub (Trello/ClickUp style), where users immediately focus on their active workspace (e.g. Capital One Real Estate) and can manage all boards, create new boards, and navigate workspace modules with a sleek workspace switcher.

## Files Modified

- `src/app/(dashboard)/projects/page.tsx`
- `src/components/project/projects-dashboard.tsx`

## Behavior Changes

- **Server Query:** Updated `prisma.project.findMany` in `src/app/(dashboard)/projects/page.tsx` to retrieve all boards for each workspace with column card counts, checking member roles for permission handling.
- **Active Workspace Management:** Upon visiting `/projects`, users are focused on their active workspace.
- **Workspace Switcher:** Added a prominent workspace switcher dropdown in the header allowing one-click switching between workspaces or creating a new workspace.
- **Workspace Navigation Sub-bar:** Integrated sub-navigation pills (`Boards Hub`, `Calendar`, `Notes`, `Members`, `Rewards`, `Settings`) directly into the active workspace header.
- **Active Workspace Hero Banner:** Added a hero banner with workspace cover/gradient, sticker, description, and task metrics (`Total Tasks`, `Done`, `Progress %`).
- **Boards in Workspace Grid:** Displayed all boards for the active workspace (`WorkspaceBoardCard`) showing progress bar, column summary chips, 3-dots menu (Edit/Delete with `ConfirmModal`), and direct "Open Board ➔" button (`/project/[id]/board?boardId=[boardId]`).
- **`+ Create New Board` Blueprint Card:** Added adjacent blueprint card to create new boards in the current workspace via `POST /api/projects/[id]/boards` with optimistic UI update and toast notifications.
- **All Workspaces View Toggle:** Provided a view mode toggle between `Boards Hub` and `All Workspaces` grid, preserving full backwards compatibility and test contracts.

## Database Changes

- None (utilized existing `Board` and `Column` models and relations).

## Verification

- `npx vitest run src/components/project/projects-dashboard.test.ts`: Passed (5/5 tests).
- `npm test`: Passed (59/59 test files, 266/266 tests).
- `npm run lint`: Passed (`✔ No ESLint warnings or errors`).
- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid 🚀`).
- `npm run build`: Passed (Compiled successfully, all 30 routes generated).

## Follow-ups

- Commit and push to `origin/main` for production deployment on Vercel.
