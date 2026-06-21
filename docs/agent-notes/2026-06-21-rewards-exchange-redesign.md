# 2026-06-21 - Rewards Exchange redesign

## Objective

Redesign the Rewards Store page into a cleaner Modern Soft Retro / lofi indigo exchange dashboard and add a dedicated 25-piece reward icon asset set.

## Files Created

- `public/stickers/rewards/reward-icon-sheet.png`
- `public/stickers/rewards/reward-icon-01-coin.png`
- `public/stickers/rewards/reward-icon-02-gift.png`
- `public/stickers/rewards/reward-icon-03-coffee.png`
- `public/stickers/rewards/reward-icon-04-game.png`
- `public/stickers/rewards/reward-icon-05-ticket.png`
- `public/stickers/rewards/reward-icon-06-snack.png`
- `public/stickers/rewards/reward-icon-07-book.png`
- `public/stickers/rewards/reward-icon-08-headphones.png`
- `public/stickers/rewards/reward-icon-09-plant.png`
- `public/stickers/rewards/reward-icon-10-trophy.png`
- `public/stickers/rewards/reward-icon-11-medal.png`
- `public/stickers/rewards/reward-icon-12-coupon.png`
- `public/stickers/rewards/reward-icon-13-keycap.png`
- `public/stickers/rewards/reward-icon-14-calendar-pass.png`
- `public/stickers/rewards/reward-icon-15-star-badge.png`
- `public/stickers/rewards/reward-icon-16-wallet.png`
- `public/stickers/rewards/reward-icon-17-shopping-bag.png`
- `public/stickers/rewards/reward-icon-18-sparkles.png`
- `public/stickers/rewards/reward-icon-19-tea.png`
- `public/stickers/rewards/reward-icon-20-cake.png`
- `public/stickers/rewards/reward-icon-21-music.png`
- `public/stickers/rewards/reward-icon-22-rest-pillow.png`
- `public/stickers/rewards/reward-icon-23-lucky-charm.png`
- `public/stickers/rewards/reward-icon-24-checklist.png`
- `public/stickers/rewards/reward-icon-25-treasure.png`
- `src/lib/rewards/reward-icons.ts`

## Files Modified

- `src/components/project/rewards-store.tsx`
- `src/app/(dashboard)/projects/rewards/page.tsx`
- `src/app/(dashboard)/project/[id]/rewards/page.tsx`

## Behavior Changes

- Rewards Store now uses a dashboard layout with a compact exchange header, wallet panel, catalog grid, pending approvals, and recent redemptions.
- Reward cards use the new reward sticker icons and deterministic keyword matching based on reward names.
- Create Reward now includes a 25-icon picker. New rewards save the selected icon in the existing `Reward.image` field, while older rewards still fall back to keyword matching.
- Quick presets now also select their matching reward icon automatically.
- The create reward flow remains a modal but now uses a two-column preset/form layout.
- Global rewards page uses a wider dashboard container instead of wrapping the store in another panel.
- Project rewards page no longer wraps the store in a nested lofi panel, reducing visual bulk.
- Existing reward APIs, redemption logic, approval/rejection behavior, and database schema are unchanged.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` initially hit a local Prisma query-engine DLL lock while the dev server was running. The local dev-server processes were stopped, then `npm run build` surfaced a TypeScript state inference error for reward icon selection. The state was widened to `string`, and `npm run build` was rerun successfully.

## Follow-ups

- Consider adding a saved icon field to rewards later if users need to choose a specific icon instead of keyword matching.
