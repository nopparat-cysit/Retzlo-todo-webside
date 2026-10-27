# Work Note: Table View Row Selection Checkbox and Selective Export

- Date: 2026-10-27
- Objective: Replace the leftmost Done toggle checkbox in Table View with standard row selection checkboxes, allowing users to select tasks for targeted export and bulk actions without marking tasks as Done.

## Files Modified

- `src/components/kanban/board-list-view.tsx`:
  - Added `selectedCardIds` state (`Set<string>`) to track chosen tasks.
  - Replaced the front row checkbox toggle from completing the card to selecting/deselecting the row.
  - Added active highlight styles (`bg-indigo-50/70 dark:bg-indigo-950/30 ring-1 ring-inset ring-indigo-500/25`) to checked rows.
  - Replaced the static `#` column header with a master Select All / Deselect All checkbox supporting indeterminate state (`Minus` icon).
  - Added a responsive Selection Action Bar displaying the selected count, Deselect all, Select all, and a dedicated Export Selected button.
  - Integrated `selectedExportColumns` into `BoardExportButton` so both toolbar and banner export actions export only selected cards when items are checked.
- `src/components/kanban/board-views-and-sidebar.test.ts`:
  - Updated table view contract tests to verify the row selection checkbox for export and bulk selection.

## Important Behavior Changes

1. **No Accidental Status Mutations**: Clicking the leftmost checkbox in Table View no longer moves tasks to Done or changes their status; status changes remain cleanly handled in the Status dropdown column and Card Details modal.
2. **Selective Export**: Users can check individual tasks or Select All in Table View, and export only the chosen rows to PDF, PNG, Excel, or CSV.

## Verification Commands Run & Results

- `npx vitest run src/components/kanban/board-views-and-sidebar.test.ts`: Passed (10 tests passed).
- `npx vitest run`: Passed (105 test files passed, 584 passed, 0 failed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Passed (production build compiled successfully).
- `npx prisma validate`: Passed (schema is valid).
