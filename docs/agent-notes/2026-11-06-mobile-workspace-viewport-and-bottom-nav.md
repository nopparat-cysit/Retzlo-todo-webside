# Work Note: Mobile Workspace Viewport Height and Bottom Navigation

- Date: 2026-11-06
- Objective: Resolve mobile issue where only the topbar and toolbar were visible in workspace, columns were squeezed or pushed off screen, and mobile users lacked persistent workspace module navigation.

## Files Created, Modified, or Deleted

- Created: `src/components/project/project-mobile-bottom-nav.tsx`
- Modified: `src/components/project/project-shell.tsx`
- Modified: `src/components/kanban/board.tsx`
- Modified: `src/components/kanban/column.tsx`
- Modified: `src/components/kanban/board-responsive.test.ts`
- Created: `docs/agent-notes/2026-11-06-mobile-workspace-viewport-and-bottom-nav.md`

## Important Behavior Changes

1. **Collapsible Mobile Board Filters (`board.tsx`):**
   - Added `isMobileFiltersOpen` state and mobile toggle button with active filter counter.
   - On mobile screens (`sm:hidden`), secondary filters and search are collapsed by default unless active or toggled open.
   - Reduces mobile board header height from ~240px to ~48px, reclaiming over 200px of vertical space for Kanban cards.

2. **Guaranteed Column Minimum Height (`column.tsx`):**
   - Added `min-h-[360px] sm:min-h-0` on `KanbanColumn`.
   - Prevents flex shrink from collapsing columns and task drop zones into zero-height slivers on constrained mobile screens.

3. **Eliminated Rigid Mobile Overflow Lock (`project-shell.tsx`):**
   - Updated `main` from `overflow-hidden` to `overflow-x-hidden lg:overflow-hidden`.
   - Allows natural vertical breathing room on mobile viewports so content is never trapped or clipped.

4. **Dedicated Mobile Workspace Bottom Navigation (`project-mobile-bottom-nav.tsx`):**
   - Added persistent bottom navigation bar on mobile devices (`lg:hidden`).
   - Quick 1-tap switching between Board, Calendar, Diary, Notes, and Menu (opens sidebar drawer).
   - Added `pb-14 lg:pb-0` to workspace content container to prevent overlap.

## Database / Schema Changes

- None.

## Verification Commands Run & Results

- `npx vitest run`: Passed (111 test files, 612 passed, 3 skipped).
- `npm run lint`: Passed (0 ESLint errors or warnings).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (All 43 routes compiled successfully).

## Known Follow-ups, Blockers, or Deployment Notes

- Ready for commit and push to `origin/main` for automated Vercel deployment.
