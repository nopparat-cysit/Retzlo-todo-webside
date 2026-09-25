# Overdue Alert Button Redesign & Alignment Fix

## Date and Objective
- Date: 2026-09-25
- Objective: Fix the overdue alert button layout in the board channel header where a notification dot and a clock icon were squished horizontally side-by-side inside the square button with washed-out light-mode contrast.

## Files Created, Modified, Deleted, or Moved
- `src/components/kanban/board.tsx`:
  - Centered the `Clock` icon cleanly within the button container.
  - Converted the inline flex dot into an absolute top-right badge displaying the overdue card count (`{overdueCards}`) with a gentle pulse/ping animation and ring outline.
  - Enhanced styling for both light mode (`border-red-300/90 bg-red-50/90 text-red-600 hover:border-red-400 hover:bg-red-100/90 hover:text-red-700`) and dark mode (`dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-400`).
  - Added clear active state styling when the filter is active (`ring-2 ring-red-400/50 border-red-500 bg-red-100 text-red-700 dark:bg-red-500/30`).
  - Polished the tooltip to explain the overdue count, light/dark styling, and filter toggle guidance.

## Important Behavior Changes
- The button is no longer misaligned with an awkward side-by-side dot and clock icon.
- Users can clearly see the exact count of overdue tasks right on the button badge.
- Clicking the button activates the overdue filter and visually indicates the active filter state.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npm test`: Passed (63 files, 304 tests passed).
- `npm run lint`: Passed (✔ No ESLint warnings or errors).
- `npx prisma validate`: Passed (The schema at prisma\schema.prisma is valid).
- `npm run build`: Passed (Compiled successfully, all 35 routes).

## Follow-ups / Blocker Notes
- None.
