# 2026-11-09 Fix Column Card Scroll and Solid Opaque Mobile Navigation

## Date and Objective
- Date: 2026-11-09
- Objective:
  1. Fix card scrolling inside Kanban columns on mobile viewports ("เลือนดู card ใน column ไม่ได้").
  2. Remove translucent glassmorphism (`backdrop-blur-xl`, opacity fractions) from the mobile bottom navigation bar (`ProjectMobileBottomNav`) and column move modal (`CardMoveModal`), replacing it with crisp, opaque retro lofi styling.
  3. Remove "Spaces" tab from the mobile bottom navigation bar, leaving 4 core workspace tabs (Board, Calendar, Diary, Notes) in a 4-column layout (`grid-cols-4`, `w-1/4`).

## Files Created, Modified, Deleted, or Moved
- Modified:
  - `src/components/kanban/card.tsx`: Replaced `touch-none` with `touch-pan-y` on `<article>` element so native vertical touch panning is enabled when interacting with cards.
  - `src/components/kanban/column.tsx`: Added `scroll-touch touch-pan-y overscroll-contain` and bottom clearance `pb-8 sm:pb-3` to `data-card-zone`.
  - `src/components/kanban/board-view-container.tsx`: Added `flex flex-col h-full` to inner wrapper to guarantee full vertical bounds for the Kanban board on mobile.
  - `src/components/project/project-mobile-bottom-nav.tsx`: Removed `backdrop-blur-xl`, `bg-white/92`, and `dark:bg-ink-950/90`. Implemented solid opaque capsule (`bg-white dark:bg-[#0e1025]`), crisp borders (`border-stone-300 dark:border-white/15`), solid active highlight pill (`bg-indigo-50 border-indigo-200/90 dark:bg-dusk-lavender/20 dark:border-dusk-lavender/40`), and clear active dot indicator.
  - `src/components/kanban/card-move-modal.tsx`: Removed `backdrop-blur-xl` and `bg-white/98`. Implemented solid opaque container (`bg-white dark:bg-[#0e1025] border-stone-300 dark:border-white/15`), solid destination column buttons (`bg-stone-100/70 hover:bg-stone-100 dark:bg-white/5 dark:hover:bg-white/10`), crisp selected state, and distinct badges.
  - `src/components/project/project-mobile-bottom-nav.test.ts`: Updated test assertions to match solid opaque classes.
  - `src/components/kanban/card-move-and-responsive-ui.test.ts`: Added assertions for `touch-pan-y`, solid modal styling, and column touch scrolling.

## Important Behavior Changes
- Card Scrolling in Column: Touching anywhere on cards now allows native, smooth vertical scrolling (`touch-pan-y`). Finger movement > 8px immediately cancels the long-press timer, allowing seamless scrolling without triggering the column move modal.
- Solid Bottom Navigation & Move Modal: Eliminated blurry, washed-out glass backgrounds on mobile bottom nav and card move modal. Both surfaces now render as solid, opaque retro lofi panels with high contrast, crisp borders, and deep shadows.
- 4-Tab Bottom Navigation: Removed "Spaces" tab from the bottom navigation bar. The navigation now cleanly distributes the 4 primary workspace tabs (Board, Calendar, Diary, Notes) across a 4-column layout (`grid-cols-4`, `w-1/4`).

## Database / Schema Changes
- None.

## Verification Commands Run and Results
- Unit and Component Tests:
  - `npx vitest run src/components/kanban/ src/components/project/`
  - Result: 25 test files passed (187 tests passed, 0 failed).
- Linter:
  - `npm run lint`
  - Result: Clean (0 warnings, 0 errors).
- Prisma Validation:
  - `npx prisma validate`
  - Result: Valid.
- Production Build:
  - `cmd.exe /c "npm run build"`
  - Result: Passed with exit code 0 (43/43 routes compiled and optimized).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
