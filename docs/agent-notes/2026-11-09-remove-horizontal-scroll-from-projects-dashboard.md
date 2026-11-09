# 2026-11-09 Remove Horizontal Scrolling from Projects Dashboard

## Objective
Eliminate horizontal scrolling and awkward horizontal scrollbars from `/projects` workspace list view, specifically addressing the category filter chips strip and the workspace card boards quick-jump row on mobile viewports.

## Files Modified
- `src/components/project/projects-dashboard.tsx`:
  - Replaced the horizontal scrolling filter toolbar container (`overflow-x-auto pb-1 sm:pb-0 scrollbar-none`) with an adaptive 4-column full-width grid on mobile (`grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:items-center`), centering button content so all 4 filters (All, Starred, Work, Diary) fit cleanly across the screen without scrollbars.
  - Replaced `overflow-x-auto scrollbar-none flex-nowrap` on board quick-jump chips inside `ProjectCard` with `flex flex-wrap items-center gap-1 pt-2 border-t`, allowing chips to wrap naturally within the card boundaries.
  - Replaced `overflow-x-auto` in boards hub sub-navigation bar with `flex-wrap`.
- `src/components/project/projects-dashboard.test.ts`: Added unit tests verifying grid/flex-wrap layout for category filters, board chips wrapping, and zero `overflow-x-auto` instances in `projects-dashboard.tsx`.

## Important Behavior Changes
- Category filters (All, Starred, Work, Diary) now form a clean, full-width 4-column segmented control bar on mobile screens. No horizontal scrollbar appears.
- Board chips inside workspace cards wrap onto subsequent lines when a workspace has multiple boards, preventing horizontal card overflow.
- No horizontal scrolling is required anywhere on `/projects`.

## Database / Schema Changes
None.

## Verification Commands Run & Results
- `npx vitest run src/components/project/projects-dashboard.test.ts`: 9 passed (9 total).
- `npx vitest run src/components/project/project-mobile-bottom-nav.test.ts src/components/project/projects-dashboard.test.ts src/components/project/project-shell.test.ts src/components/kanban/board-responsive.test.ts`: 42 passed (42 total).
- `npx prisma validate`: Schema is valid.
- `npm run lint`: 0 warnings, 0 errors.
- `npm run build`: Compiled successfully (43/43 pages).

## Known Follow-ups, Blockers, or Deployment Notes
None.
