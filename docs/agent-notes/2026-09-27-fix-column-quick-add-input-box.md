# 2026-09-27: Fix Column Quick-Add Card Input Box UI

## Objective
Refactor the Kanban column quick-add card UI ("Quick add") to eliminate the awkward double-border nested box glitch, provide seamless inline text editing, and upgrade the "Add" button and hint layout to be clear, high-contrast, and intuitive.

## Files Created / Modified
- `src/app/globals.css` [MODIFIED]:
  - Added `:not(.quick-add-textarea)` exclusion to global light-mode `<textarea>` borders and focus rings.
  - Added explicit zero-border/zero-shadow transparent styling rules for `textarea.quick-add-textarea` across both light and dark themes.
- `src/components/kanban/column.tsx` [MODIFIED]:
  - Replaced the nested-border textarea layout with a seamless card-container layout (`rounded-xl border border-indigo-400/80 bg-white shadow-md`).
  - Added `.quick-add-textarea` with zero borders, transparent background, and comfortable multiline padding/line-height (`rows={2}`).
  - Replaced faint ghost "Add" button with high-contrast, bold action button (`bg-indigo-600 text-white font-semibold` when text is present, clean muted state when empty).
  - Streamlined helper text to clean `↵ Enter` and upgraded close/cancel button to `h-7 w-7` rounded icon button with tooltip.

## Important Behavior Changes
- Clicking "Quick add" now feels like drafting an actual card on the column without awkward concentric boxes or purple rings inside purple borders.
- The "Add" button is clearly visible and readable in both light and dark themes.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run`: Passed (67 test files, 326 tests passed).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npm run build`: Passed (Next.js production build succeeded).
- `npx prisma validate`: Passed (schema valid).

## Known Follow-ups / Blockers
- None.
