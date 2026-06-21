# 2026-06-21 - Card modal scroll and coin toggle

## Objective

Fix the card details modal scrolling and add a coin button to show or hide Coin Rewards.

## Files Modified

- `src/components/kanban/card-modal.tsx`

## Behavior Changes

- Changed the card modal from a single scrollable form to a fixed-height modal shell with:
  - Fixed header.
  - Scrollable body.
  - Fixed footer.
- Added a coin icon button in the modal header to toggle the Coin Rewards section.
- Coin Rewards opens automatically when a card already has project or private coin values.

## Database Changes

- None.

## Verification

- `npm run lint` passed.

## Follow-ups

- None.
