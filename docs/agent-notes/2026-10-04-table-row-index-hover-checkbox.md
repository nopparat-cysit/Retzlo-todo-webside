# Work Note: Table Row Number Swaps to Completion Checkbox on Hover

- **Date:** 2026-10-04
- **Objective:** In Kanban table / spreadsheet view, display row index numbers (`1`, `2`, `3`...) by default in the `#` column, and swap to the completion checkbox button only when the user hovers over the row. If a task is already completed, show the green checked mark directly.

## Files Modified
- `src/components/kanban/board-list-view.tsx`:
  - Updated Flat Table view row numbering `#` cell to show row index `index + 1` by default and show checkbox on hover via Tailwind `group-hover/row:hidden` and `group-hover/row:grid`.
  - Updated Grouped Accordion view row numbering `#` cell to have the identical hover swap behavior (`idx + 1` replaces with checkbox on hover).
  - Preserved immediate checkmark display and click-to-uncomplete behavior when `isCardDone` is true.
  - Stopped click propagation on `#` cell so clicking the checkbox or cell does not open the task edit modal.
- `src/components/kanban/board-views-and-sidebar.test.ts`:
  - Added unit test contract verifying that row indices are hidden on hover, checkboxes appear on hover, and completed cards retain the checkmark.

## Behavior Changes
- **Before:** The table index column displayed an empty checkbox directly next to the row index number side-by-side (`[☐ 1]`), cluttering the narrow column.
- **After:** Displays clean, centered row number (`1`, `2`, `3`...) by default. Hovering over any row replaces its number with a sleek rounded checkbox. Completed tasks clearly display their green checkmark button `[✓]`.

## Verification Commands & Results
- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts`: Passed (8 tests).
- `npx vitest run src/components/kanban/`: Passed (39 tests).
- `npx tsc --noEmit`: Passed with 0 errors.
- `npm run lint`: Passed with 0 warnings or errors.
- `npx prisma validate`: Schema valid.
- `npm run build`: Passed (36/36 static pages generated successfully).
