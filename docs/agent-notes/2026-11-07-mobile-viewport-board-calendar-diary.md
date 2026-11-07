# Work Note: Mobile Viewport, Sticky Topbar, Board, Calendar & Diary Polish

**Date:** 2026-11-07  
**Objective:** Resolve mobile empty 1-page gap, make workspace topbar sticky, eliminate horizontal scrolling filter strip on board, ensure calendar displays all 7 days without cut-offs, and streamline mobile diary view.

## Files Modified

- `src/components/project/project-shell.tsx`: Made topbar sticky with `sticky top-2 z-40 backdrop-blur-xl bg-ink-950/80`; updated `.project-shell-grid` to definite viewport height `h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-1.5rem)] min-h-0`; added `overflow-hidden` to `<section>` and `flex flex-col flex-1 min-h-0 overflow-hidden` to `{children}` wrapper to eliminate 0-height collapse and 1-page blank spaces.
- `src/components/kanban/board.tsx`: Defaulted `isMobileFiltersOpen` to `false`; transformed filter strip on mobile from horizontal scroll strip to a clean collapsible wrapping panel (no `overflow-x-auto`).
- `src/components/kanban/column.tsx`: Detected mobile screen widths dynamically to omit inline pixel widths and apply `w-[calc(100vw-2.5rem)] max-w-[360px] snap-center` for smooth single-column touch paging without 335px hardcoded overflow.
- `src/components/kanban/project-calendar.tsx`: Removed `min-w-[560px]` on mobile month view so the 7-day grid fits 100% within the viewport; rendered compact date numbers and color-coded dot markers on mobile (`< sm`) while preserving click-to-open day detail drawer.
- `src/components/diary/diary-list-panel.tsx`: Compacted hero panel padding (`p-2.5 sm:p-5`); hid lengthy description paragraph on mobile; shortened metrics pills (`Due`, `Done`, `Starred`); ensured shelf and checklist containers use `min-h-0 flex-1` to prevent height collapse.
- `src/components/kanban/board-responsive.test.ts`: Added assertions covering sticky topbar, definite viewport shell height, collapsible non-scrolling board filters, adaptive mobile column width, 100% viewport calendar grid, and compact diary hero.

## Important Behavior Changes

1. **Sticky Topbar:** The workspace header remains pinned at `top-2` with blur effect during scroll on mobile devices.
2. **Definite Viewport Height:** Inner page grids (Board, Calendar, Diary) now stretch across the exact available viewport height without collapsing to 0 or pushing content down by an empty page.
3. **No Horizontal Scroll on Filters:** Board filters are collapsed by default behind a clean "Filters" button with active count badge. When opened, filters wrap cleanly without horizontal scrollbars.
4. **Calendar Fits Mobile Viewport:** All 7 weekdays fit neatly onto mobile screens without horizontal scroll or cut-off weekend columns.
5. **Clean Diary View:** Compacted header leaves immediate space for the daily checklist and rituals list.

## Database & Schema Changes

- None.

## Verification Commands & Results

- `npx vitest run src/components/kanban/board-responsive.test.ts`: Passed (11/11 tests).
- `npx vitest run src/components/project/project-shell.test.ts`: Passed (8/8 tests).
- `npm test`: Passed (111 test files, 614 passed, 3 skipped).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (43 static & dynamic routes compiled successfully).

## Known Follow-ups & Deployment Notes

- Ready for git commit and push to remote repository.
