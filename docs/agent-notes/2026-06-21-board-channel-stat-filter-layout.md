# 2026-06-21 - Board channel stat and filter layout

## Objective

Move board stats to the top-right of the Board Channel header and keep filters/actions on the lower-left.

## Files Modified

- `src/components/kanban/board.tsx`

## Behavior Changes

- Board title and description stay on the top-left.
- Compact stat pills align on the top-right on wide screens.
- Search, Today, Focus, Undo, and Column controls move to their own lower-left row.
- Mobile/tablet layouts still wrap naturally.

## Database Changes

- None.

## Verification

- `npm run lint` passed.

## Follow-ups

- None.
