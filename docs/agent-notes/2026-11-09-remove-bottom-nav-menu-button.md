# 2026-11-09 Remove Redundant Bottom Nav Menu Button

## Objective
Remove the redundant "Menu" drawer toggle button from the mobile bottom navigation bar (`ProjectMobileBottomNav`), leaving the 4 primary workspace tabs (Board, Calendar, Diary, Notes) cleanly distributed, as the top navbar already includes the workspace drawer toggle.

## Files Modified
- `src/components/project/project-mobile-bottom-nav.tsx`: Removed the `<label htmlFor="project-sidebar-toggle">` Menu button and unused `Menu` icon import.
- `src/components/kanban/board-responsive.test.ts`: Added unit test asserting `project-mobile-bottom-nav.tsx` does not contain the redundant menu button and preserves all 4 tabs.

## Behavior Changes
- The mobile bottom navigation bar now contains only Board, Calendar, Diary, and Notes.
- Eliminates duplicate menu toggle buttons between the topbar and the bottom bar.
- Avoids visual overlap with floating elements at the bottom-right.

## Verification
- Unit Tests: `npx vitest run src/components/kanban/board-responsive.test.ts` (12 passed).
- Prisma: `npx prisma validate` (passed).
- Lint: `npm run lint` (0 errors, 0 warnings).
- Build: `npm run build` (compiled successfully, 43 static/dynamic routes generated).
