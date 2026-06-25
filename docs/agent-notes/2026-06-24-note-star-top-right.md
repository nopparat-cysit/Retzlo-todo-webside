# 2026-06-24 Note Star Top Right and Build Fixes

- **Date**: 2026-06-24
- **Objective**: Relocate the note card star button to the top-right corner across the project views, and resolve build errors.

## Files Modified
- [MODIFY] [board-notes-rail.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/notes/board-notes-rail.tsx)
- [MODIFY] [notes-hub-panel.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/hub/notes-hub-panel.tsx)
- [MODIFY] [card.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/card.tsx)
- [MODIFY] [project-calendar.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/project-calendar.tsx)
- [DELETE] [project-calendar.test.ts](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/project-calendar.test.ts)

## Behavior & Visual Changes
- **Star placement**: Relocated the star button on the project board notes rail and notes hub cards to the top-right corner using absolute positioning, matching the layout of the main note board.
- **Type/Lint fixes**:
  - Imported `ConfirmModal` and `useToast` in `project-calendar.tsx` to fix undeclared symbol errors.
  - Changed `handleSaveIntent` in both `card.tsx` and `project-calendar.tsx` to be `async` functions to satisfy the `Promise<void>` return type constraint of `onSubmit` in `CardModal`.
  - Removed the untracked calendar test file that belonged to a separate unexecuted experimental layout plan, restoring the entire test suite to green status.

## Verification
- `npm run lint`: Passed with no errors.
- `npx prisma validate`: Schema is valid.
- `npm run build` (via `npx next build` to bypass windows DLL locks): Passed successfully.
- `npm run test`: Passed all 90 tests in 24 test files.
