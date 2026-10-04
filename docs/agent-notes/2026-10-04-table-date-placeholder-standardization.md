# Work Note: Table Datepicker Empty State Placeholder Standardization

- **Date:** 2026-10-04
- **Objective:** Standardize the empty date placeholder across all date columns in the Kanban Table (Spreadsheet) view to consistently display `DD/MM/YYYY`, matching user request and screenshot.

## Files Modified

- `src/components/kanban/board-list-view.tsx`
  - Changed Start Date `DatePicker` placeholder from `"-"` to `"DD/MM/YYYY"`, matching Due Date's placeholder standard.
  - Upgraded grouped view date columns to interactive `DatePicker`s with `"DD/MM/YYYY"` placeholder instead of static text.
  - Removed unused `formatTableDate` helper function.
- `src/components/kanban/board-views-and-sidebar.test.ts`
  - Added test assertion verifying all date columns consistently use `"DD/MM/YYYY"` placeholder and not `"-"`.

## Behavior Changes

- In the Kanban Table / Spreadsheet view, both Start Date and Due Date columns now consistently display `[ 📅 DD/MM/YYYY ]` when empty.
- Dates in Grouped view are now interactive DatePickers with identical styling and clear buttons.

## Verification Run & Results

- `npx vitest run src/components/kanban/`: Passed (8 test files, 38 tests passed).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (`No ESLint warnings or errors`).
- `npm run build`: Passed (Next.js production build succeeded).
- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid`).

## Deployment / Follow-ups

- Ready for commit and push.
