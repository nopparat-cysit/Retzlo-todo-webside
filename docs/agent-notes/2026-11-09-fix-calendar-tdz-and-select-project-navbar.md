# 2026-11-09 Fix Calendar TDZ Runtime Crash and Add Universal Mobile Nav to Select Project

## Objective
Fix the fatal runtime crash on the Calendar page (`ReferenceError: Cannot access 'iT' before initialization`) caused by lexical Temporal Dead Zone (TDZ) in `project-calendar.tsx`, and resolve the missing/un-sticky navbar on the select project page (`/projects`) by elevating `ProjectMobileBottomNav` to 5 universal tabs and pinning the sticky command header.

## Files Created / Modified
- `src/components/kanban/project-calendar.tsx`: Relocated `selectedDayItems` declaration before `selectedDayHeader`, `dayStats`, and `fullDateTitle` to resolve Temporal Dead Zone runtime errors (`iT`). Relocated `useLiveSync` to declare after all `useState` hooks.
- `src/components/kanban/calendar-modals.test.ts`: Added unit tests verifying declaration order of `selectedDayItems` and `useLiveSync` to prevent TDZ regressions.
- `src/components/project/project-mobile-bottom-nav.tsx`: Added 5th tab `Spaces` (`/projects`) with `LayoutGrid` icon, made `projectId` optional with localStorage fallback and automatic persistence, and updated the grid and animated pill width to `w-1/5` (`grid-cols-5`).
- `src/components/project/project-mobile-bottom-nav.test.ts`: Added tests verifying 5-tab structure, Spaces navigation, and localStorage persistence.
- `src/components/project/projects-dashboard.tsx`: Mounted `ProjectMobileBottomNav` on `/projects`, added `pb-24 lg:pb-4` bottom padding for mobile clearance, and ensured solid backdrop opacity (`bg-white/95 dark:bg-ink-950/92`) on the sticky command header.

## Important Behavior Changes
- The Calendar page (`/project/[id]/calendar`) now loads properly without crashing.
- The select project page (`/projects`) now has the floating mobile bottom navigation bar with spring transfer animation.
- Users can switch between Workspaces (`Spaces`), Board, Calendar, Diary, and Notes seamlessly from anywhere in the application.
- The command header on `/projects` stays sticky with solid background opacity when scrolling through workspace cards.

## Database / Schema Changes
None.

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/calendar-modals.test.ts src/components/project/project-mobile-bottom-nav.test.ts src/components/kanban/board-responsive.test.ts src/components/project/projects-dashboard.test.ts`: 38 passed (38 total).
- `npx vitest run src/components/kanban/`: 128 passed (128 total across 17 test files).
- `npx prisma validate`: Schema is valid.
- `npm run lint`: 0 warnings, 0 errors.
- `npm run build`: Compiled successfully (43/43 pages).

## Known Follow-ups, Blockers, or Deployment Notes
None.
