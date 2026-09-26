# 2026-09-26 Persist Last Active Board Across Project Navigation

## Objective
Fix the issue where navigating to another board within a project, leaving the board view (e.g. to Calendar, Diary, Members, or Notes), and then returning to the Board view always reverted back to the first board instead of remembering the last active board.

## Root Cause
1. `src/app/(dashboard)/project/[id]/board/page.tsx` was looking solely at `searchParams?.boardId`. When a user clicked "Board" in the sidebar navigation or re-entered the project, the URL was `/project/${projectId}/board` without query parameters, causing the server component to fall back to `accessibleBoards[0]` (the very first board).
2. The active board selection in `BoardTabsBar` and `BoardViewContainer` was not being persisted to cookies or `localStorage`.
3. The sidebar navigation link in `ProjectShell` always pointed to a static `/project/${projectId}/board` instead of preserving the active board ID.

## Files Modified
- `src/app/(dashboard)/project/[id]/board/page.tsx`:
  - Added cookie lookup `project_${params.id}_last_board` from `cookies()` as fallback when `searchParams?.boardId` is not provided.
  - Added card target board lookup when `searchParams?.cardId` is present.
  - Added `key={`board-container-${board.id}`}` on `BoardViewContainer` for clean unmount/remount on board switches.
- `src/components/kanban/board-tabs-bar.tsx`:
  - Persists `activeBoardId` to both `document.cookie` (`project_${projectId}_last_board`) and `localStorage` on mount, active board change, and tab click.
- `src/components/kanban/board-view-container.tsx`:
  - Synchronizes `board.id` to `document.cookie` and `localStorage` whenever the container renders with an active board.
- `src/components/project/project-shell.tsx`:
  - Reads `project_${projectId}_last_board` cookie and attaches `?boardId=${lastBoardId}` to the "Board" sidebar link.
- `src/components/project/project-nav-link.tsx`:
  - Updated `isActive` check to use `href.split("?")[0]` so query strings don't disable the active link highlight.
  - Added client-side fallback via `localStorage` for instant client-side routing to the last active board.

## Verification
- `npx vitest run`: Passed (66 test files, 320 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Verified.
