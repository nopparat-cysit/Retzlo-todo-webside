# Fix False Unsaved Changes Alert on Modal Open/Close

- **Date**: 2026-09-17
- **Objective**: Fix issue where opening a modal (such as creating a card in a column or creating a column) and closing it immediately without modifying anything triggered an unexpected "Discard changes? You have unsaved changes." alert dialog.

## Files Modified

- `src/components/kanban/card-modal.tsx`:
  - Replaced hardcoded `selectedStatus !== "TODO"` check in `hasChanges` with comparison against `initialStatus` (`card?.status ?? "TODO"`). Previously, creating a card in any column whose `defaultCardStatus` was not "TODO" (e.g. "In Progress" / DOING, or "Done") caused `hasChanges` to evaluate to `true` immediately on open.
  - Aligned `isDraftEqualInitial` to also compare status against `initialStatus` instead of hardcoded `"TODO"`.
  - Added trimming for title, description, and note comparisons so accidental whitespace does not trigger dirty flags.
- `src/components/kanban/board.tsx`:
  - Introduced `openCreateColumnModal` helper to ensure all column form states (`columnName`, `columnColor`, `columnIcon`, `columnDefaultCardStatus`, `columnWipLimit`, `syncError`) are cleanly reset to defaults upon opening.
  - Used `.trim()` on `columnWipLimit` and `columnName` in `hasUnsavedChanges`.
- `src/components/kanban/column.tsx`:
  - Ensured settings form state is cleanly reset to column values upon clicking the Settings gear icon.
  - Used `.trim()` on `settingsName` and `settingsWipLimit` in `hasUnsavedChanges`.
- `src/components/kanban/card-interaction.test.ts`:
  - Added unit tests verifying that `CardModal` compares status against `initialStatus`, `boardSource` uses `openCreateColumnModal`, and column settings resets state on open.

## Important Behavior Changes

- When opening "Add card" in any column (including In Progress, Doing, Waiting, Done), pristine cards start with `hasChanges = false`. Closing or clicking outside closes the modal immediately without any alert dialog.
- The confirmation dialog only appears when the user actually modified text, status, color, priority, date, or other fields.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test`: 51 test suites, 195 tests passed.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production build verified.
