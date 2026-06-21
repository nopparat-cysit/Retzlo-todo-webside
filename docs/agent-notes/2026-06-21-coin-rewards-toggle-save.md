# 2026-06-21 Coin Rewards Toggle Save

## Objective

Fix the card modal Coin Rewards toggle so turning it off and saving actually disables card rewards.

## Files Modified

- `src/components/kanban/card-modal.tsx`
- `src/lib/kanban/private-coins.ts`
- `src/lib/kanban/private-coins.test.ts`

## Behavior Changes

- The Coin Rewards toggle now affects the saved payload.
- When Coin Rewards is disabled, project reward coins save as `0`.
- When Coin Rewards is disabled, the active user's private global coin reward is removed from the card `privateCoins` payload.
- Existing private coin entries for other users are preserved.

## Database / Schema Changes

- None.

## Verification

- `npm test -- src/lib/kanban/private-coins.test.ts` - failed first because `resolveCardRewardPayload` did not exist, then passed after implementation.
- `npm run lint` - passed.
- `npx prisma validate` - passed.
- `npm run build` - passed.

## Follow-ups

- None.
