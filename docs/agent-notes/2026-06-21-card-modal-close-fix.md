# 2026-06-21 - Card modal close fix

## Objective

Fix the edit card modal so the close and cancel actions can actually close the modal.

## Files Modified

- `src/components/kanban/card-modal.tsx`

## Behavior Changes

- Stopped click and keyboard events from bubbling out of the portal-rendered card modal.
- Prevents the parent kanban card click handler from immediately reopening the edit modal after the close button is pressed.

## Database Changes

- None.

## Verification

- `npm run lint` passed.

## Follow-ups

- None.
