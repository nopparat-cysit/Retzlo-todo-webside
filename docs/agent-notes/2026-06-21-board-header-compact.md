# 2026-06-21 - Board header compact layout

## Objective

Reduce the board header height after moving stats into the title area.

## Files Modified

- `src/components/kanban/board.tsx`

## Behavior Changes

- Reduced board header padding and spacing.
- Made board title text slightly smaller.
- Changed stat cards from tall stacked cards to compact horizontal pills with fixed width and height.
- Kept filters and actions aligned in the same lower-left flow.

## Database Changes

- None.

## Verification

- `npm run lint` passed.

## Follow-ups

- None.
