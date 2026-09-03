# 2026-07-29 Remove Landing Ghost Sticker

## Objective
Remove the ghost/mascot sticker from the marketing landing hero.

## Changed Files
- `src/app/(marketing)/page.tsx`
- `src/app/globals.css`
- `docs/agent-notes/2026-07-29-remove-landing-ghost-sticker.md`

## Behavior
- Removed the hero mascot image block that used `/stickers/retro/retro-sticker-25-mascot-blob.png`.
- Removed the now-unused `.retzlo-hero-mascot-bob` animation class and keyframes.
- Other landing hero visuals, beams, coin ring, and controls remain unchanged.

## Verification
- `rg -n "retro-sticker-25-mascot-blob|retzlo-hero-mascot-bob" "src\\app\\(marketing)\\page.tsx" src\\app\\globals.css`: no matches.
- `npm run lint`: passed.
- `npx prisma validate`: passed.
- `npm run build`: blocked by active dev server locking Prisma query engine DLL (`EPERM rename query_engine-windows.dll.node`).

## Notes
- Dev server was left running for browser preview.