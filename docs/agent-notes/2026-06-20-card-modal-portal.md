# 2026-06-20 Card Modal Portal

## Objective

Fix the todo card detail modal appearing clipped or sunk inside the board column.

## Files Modified

- `src/components/kanban/card-modal.tsx`

## Behavior Changes

- Card detail/create modals now render through a React portal into `document.body`.
- The modal overlay uses a higher modal z-index and page-level scroll handling.
- This prevents board columns, card containers, transforms, or overflow styles from clipping the modal.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` passed.

## Follow-Ups

- Manually recheck the card modal from board and calendar views to confirm it appears centered above all board content.
