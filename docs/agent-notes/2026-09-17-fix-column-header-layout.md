# Fix Kanban Column Header Layout & Badge Overflow

- **Date**: 2026-09-17
- **Objective**: Fix Kanban column header layout issues where column titles were squished to 0px width, `LIMIT N` text wrapped vertically into an awkward pill, and card counts rendered duplicate numbers (`0/1  1`).

## Files Modified

- `src/components/kanban/column.tsx`:
  - Enclosed right-side header controls (WIP limit badge, difficulty points badge, card count badge, settings button, collapse button) inside a dedicated `shrink-0 flex items-center gap-1.5` container.
  - Made `wipLimit` tag `shrink-0 whitespace-nowrap` with compact padding to prevent the text from breaking into two lines.
  - Streamlined `totalPoints` badge to a compact format (`⚡ {totalPoints}`) without excessive padding.
  - Replaced redundant duplicate card counts (`{doneCount}/{totalCards}` alongside `{totalCards}`) with a single unified card count badge (`{doneCount > 0 ? `${doneCount}/${totalCards}` : totalCards}`).
  - Fixed column title (`column.name`) visibility with `min-w-0 flex-1 truncate` so it always has ample room and truncates cleanly with ellipsis rather than disappearing.

## Important Behavior Changes

- Column titles are now clearly legible and never collapsed to 0px width regardless of badges present.
- WIP Limit tag (`LIMIT 4`) remains horizontally aligned and formatted cleanly.
- Card count badge presents a single clear indicator without duplicate counts side-by-side.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test`: 51 test suites, 196 tests passed.
- `npm run lint`: Passed with 0 errors and 0 warnings.
- `npm run build`: Production build succeeded.
- `npx prisma validate`: Schema is valid.
