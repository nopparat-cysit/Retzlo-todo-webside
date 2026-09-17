# Fix Focus Mode Layout Distortion and Board Page Grid Collapse

- **Date**: 2026-09-17
- **Objective**: Fix layout distortion ("ui เพี้ยน") occurring when Focus Mode is activated on the Kanban board. When Focus Mode was triggered, the board page inner grid retained its two-track allocation (`xl:grid-cols-[minmax(0,1fr)_340px]`), leaving a 340px blank black void where the notes rail was hidden, causing the board header to cut off mid-screen and column titles to truncate.

## Files Modified

- `src/app/globals.css`:
  - Scoped sidebar hiding specifically to `body.focus-mode aside.project-sidebar` and notes rail to `body.focus-mode .board-notes-rail`.
  - Added `body.focus-mode .board-page-grid { grid-template-columns: 1fr !important; }` to collapse the inner board grid to a single full-width track in focus mode.
- `src/app/(dashboard)/project/[id]/board/page.tsx`:
  - Added `.board-page-grid` class to the board container wrapper.
- `src/components/notes/board-notes-rail.tsx`:
  - Added `.board-notes-rail` class to the `<aside>` element.
- `src/components/kanban/column.tsx`:
  - Increased desktop column width to `sm:w-[336px]` (from `sm:w-80` / 320px).
  - Compacted header badges (`LIMIT`, `Zap` points, count badge) and icon buttons (`h-6 w-6`), saving 40+ pixels and ensuring column titles such as "In Progress" never truncate to "In Pr...".
- `src/components/project/project-shell.test.ts`:
  - Added test suite verifying focus mode CSS grid rules and class bindings on the board and notes rail.

## Important Behavior Changes

- In Focus Mode, the Kanban board now expands to **100% full screen width**, with the Board Channel header and stats bar spanning edge-to-edge and perfectly aligning with the workspace Topbar.
- The 340px blank empty void on the right is completely eliminated.
- Column headers have ample space for both titles and badge indicators without unsightly text truncation.
- Exiting Focus Mode smoothly restores both the workspace sidebar and the board notes rail.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test`: 52 test suites, 203 tests passed (100%).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema valid.
- `npm run build`: Production build verified for all 31 routes.

## Known Follow-ups, Blockers, or Deployment Notes

- None.
