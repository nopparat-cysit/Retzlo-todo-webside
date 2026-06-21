# 2026-06-20 Column Create Modal

## Objective

Change the board `+ Column` action from an inline name input to a modal that asks for the column name.

## Files Modified

- `src/components/kanban/board.tsx`

## Behavior Changes

- The board header now shows only a `Column` button with a plus icon.
- Clicking the button opens a centered modal for entering the new column name.
- The modal reuses the existing create-column API flow and closes after a successful create.
- Cancel/close clears the draft column name.
- Create errors are shown inside the modal.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` passed.

## Follow-Ups

- Consider adding a keyboard shortcut for opening the create-column modal if board management needs faster column creation.
