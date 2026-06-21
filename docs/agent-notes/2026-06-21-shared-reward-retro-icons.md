# 2026-06-21 Shared Reward And Retro Icons

## Objective

Merge Reward Icons and Retro Stickers into one reusable icon option library and remove duplicate concepts from picker lists.

## Files Created

- `src/lib/stickers/shared-icon-options.ts`
- `src/lib/stickers/shared-icon-options.test.ts`

## Files Modified

- `src/lib/stickers/retro-stickers.ts`
- `src/lib/rewards/reward-icons.ts`
- `src/components/project/rewards-store.tsx`

## Behavior Changes

- Reward and retro sticker pickers now use the same shared option list.
- The shared list keeps the 25 retro stickers and adds only 15 unique reward icons, for 40 total options.
- Duplicate concepts such as gift, coffee, headphones, sparkles, music, checklist, keycap, calendar, coin, and star are represented once.
- Reward presets and wallet/empty-state icons now resolve by icon id instead of fragile array indexes.
- Card sticker validation now accepts the shared icon library paths.

## Database / Schema Changes

- None.

## Verification

- `npm test -- src/lib/stickers/shared-icon-options.test.ts` - failed before implementation because the shared module did not exist, then passed after implementation.
- `npm run lint` - passed.
- `npx prisma validate` - passed.
- `npm run build` - failed first because active Next dev processes locked Prisma's `query_engine-windows.dll.node`.
- `npm run build` - failed again after releasing the lock because stale generated `.next` cache was missing `_not-found/page.js.nft.json`.
- Removed generated `.next` cache and stopped only the workspace Next dev processes that were locking Prisma.
- `npm run build` - passed after cache cleanup and lock release.

## Follow-ups

- Consider renaming UI labels from "Retro Stickers" to "Stickers & Icons" if the product language should reflect the merged library.
