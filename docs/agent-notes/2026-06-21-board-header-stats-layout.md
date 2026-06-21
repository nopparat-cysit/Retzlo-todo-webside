# 2026-06-21 - Board header stats layout

## Objective

Move the board stat cards into the board title header and align the search/filter controls to the lower-left area without letting stat cards stretch to fill the header width.

## Files Modified

- `src/components/kanban/board.tsx`

## Behavior Changes

- Board stats now live inside the board header panel instead of in a separate row below it.
- Stat cards use fixed dimensions so they do not resize with the available header space.
- Search, Today, Focus, Undo, and Column controls align from the lower-left and wrap after the fixed stat cards.

## Database Changes

- None.

## Verification

- `npm run lint` passed.

## Follow-ups

- None.
