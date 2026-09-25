# 2026-09-25 Fix Board Overdue Icon Top-Right Placement

## Objective
Fix the Kanban Board overdue indicator appearing on the top-left (displacing "BOARD CHANNEL" and breaking the header layout) instead of pinned to the top-right corner.

## Root Cause
1. In `src/app/globals.css`, `.lofi-panel > *` set `position: relative; z-index: 1;`. Because this rule had equal specificity `(0, 1, 0)` and was ordered in global CSS, it overrode the `.absolute` utility on the overdue indicator container inside `.lofi-panel`.
2. When the overdue container became `position: relative;`, it was placed in the first cell of the CSS Grid (`grid gap-2.5`) on the top-left, displacing the "BOARD CHANNEL" row downward and leaving the intended top-right spot empty.

## Files Modified
- `src/app/globals.css`
  - Changed `.lofi-panel > *` to `.lofi-panel > *:not([class*="absolute"])` so that absolutely positioned children retain `position: absolute`.
- `src/components/kanban/board.tsx`
  - Added `!absolute !top-2.5 !right-2.5 sm:!top-3 sm:!right-3 z-30` to the overdue indicator container so it remains strictly pinned to the top-right corner.
  - Wrapped right-side padding in `overdueCards > 0 && "pr-10 sm:pr-12"` on the header content container.

## Important Behavior Changes
- The overdue pulsing icon is now positioned in the top-right corner of the Board Channel header card as originally intended.
- "BOARD CHANNEL" and board title are restored to the top-left of the card without extra blank vertical space or displacement.

## Database/Schema Changes
- None.

## Verification Commands Run & Results
- `npm run lint` — Passed with 0 errors/warnings.
- `npm test` — Passed (61 test files, 279 tests).
- `npx prisma validate` — Valid.
- `npm run build` — Build completed successfully (all 35 routes).

## Follow-ups / Deployment Notes
- None.
