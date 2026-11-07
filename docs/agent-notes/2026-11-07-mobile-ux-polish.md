# Work Note: Mobile UX Polish, FAB Clearance, and Layout Corrections

- Date: 2026-11-07
- Objective: Resolve mobile UX issues including Star FAB overlapping the bottom navigation Menu button, duplicate hamburger button in top navbar, empty board header on mobile viewports, and button wrapping on company/workspace selection screens.

## Files Modified
- `src/components/hub/fab-hub.tsx`: Elevated Star FAB on mobile to `bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3.5 sm:bottom-6 sm:right-6` so it clears the bottom navigation bar and Menu button.
- `src/components/project/project-shell.tsx`: Removed redundant mobile hamburger menu toggle from the top navbar header because `ProjectMobileBottomNav` already provides the workspace menu drawer trigger.
- `src/components/kanban/board.tsx`: Initialized `isMobileFiltersOpen` to `true` and kept the bottom row visible on mobile so Search, Add Column, and quick filter chips are immediately available without empty header states.
- `src/components/project/projects-dashboard.tsx`: Corrected flex wrap and layout on dashboard headers and cards. Maintained title and primary action on a single row, converted board chips to scrollable single row, and prevented action hub buttons from wrapping awkwardly.
- `src/components/kanban/board-responsive.test.ts`: Added automated assertions for elevated FAB, redundant menu button removal, persistent mobile board controls, and dashboard button non-wrapping.

## Important Behavior Changes
- The Star floating action button no longer obstructs the Menu button on mobile.
- The top workspace header no longer displays a duplicate menu icon on mobile screens.
- Mobile board headers immediately show live card search, Add Column, and quick filter chips upon landing.
- Workspace cards and headers keep their buttons and board chips cleanly aligned without irregular multi-line breaks.

## Database / Schema Changes
- None.

## Verification
- `npx vitest run src/components/kanban/board-responsive.test.ts src/components/project/project-shell.test.ts`: Passed (18 tests passed across 2 test files).
- `npm run lint`: Passed with 0 errors and 0 warnings.
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Passed (production Next.js build completed successfully across all 43 routes).
