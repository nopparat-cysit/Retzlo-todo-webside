# 2026-06-21 - Retro sticker assets

## Objective

Create a 25-piece Retro Stickers asset set in the app theme and make it selectable from the card modal.

## Files Created

- `public/stickers/retro/retro-sticker-sheet.png`
- `public/stickers/retro/retro-sticker-01-coin-reward.png`
- `public/stickers/retro/retro-sticker-02-diary-notebook.png`
- `public/stickers/retro/retro-sticker-03-checklist.png`
- `public/stickers/retro/retro-sticker-04-calendar.png`
- `public/stickers/retro/retro-sticker-05-alarm-clock.png`
- `public/stickers/retro/retro-sticker-06-soft-star.png`
- `public/stickers/retro/retro-sticker-07-moon.png`
- `public/stickers/retro/retro-sticker-08-ring-planet.png`
- `public/stickers/retro/retro-sticker-09-headphones.png`
- `public/stickers/retro/retro-sticker-10-coffee-cup.png`
- `public/stickers/retro/retro-sticker-11-pencil.png`
- `public/stickers/retro/retro-sticker-12-paper-note.png`
- `public/stickers/retro/retro-sticker-13-project-folder.png`
- `public/stickers/retro/retro-sticker-14-city-sunset.png`
- `public/stickers/retro/retro-sticker-15-cloud.png`
- `public/stickers/retro/retro-sticker-16-tape.png`
- `public/stickers/retro/retro-sticker-17-envelope.png`
- `public/stickers/retro/retro-sticker-18-gift.png`
- `public/stickers/retro/retro-sticker-19-heart.png`
- `public/stickers/retro/retro-sticker-20-sparkles.png`
- `public/stickers/retro/retro-sticker-21-music-note.png`
- `public/stickers/retro/retro-sticker-22-bookmark.png`
- `public/stickers/retro/retro-sticker-23-keyboard-key.png`
- `public/stickers/retro/retro-sticker-24-focus-timer.png`
- `public/stickers/retro/retro-sticker-25-mascot-blob.png`
- `public/stickers/retro/stickers.json`
- `src/lib/stickers/retro-stickers.ts`

## Files Modified

- `src/app/api/cards/route.ts`
- `src/app/globals.css`
- `src/components/kanban/card-modal.tsx`
- `src/components/kanban/card.tsx`

## Files Deleted

- `public/assets/relox-sticker-ui-assets-chromakey.png`
- `public/assets/relox-sticker-ui-assets.png`

## Behavior Changes

- Generated one 5x5 retro lofi sticker sheet and sliced it into 25 individual PNG assets.
- Regenerated the sticker sheet on a chroma-key background and removed the background so the sheet and all 25 sliced stickers are transparent PNGs.
- Card modal Retro Stickers picker now uses the generated sticker images.
- Retro Sticker images render with a cache-bust query so the UI does not keep showing stale optimized images after asset regeneration.
- Kanban cards render only valid generated Retro Sticker image paths, so older emoji-style sticker values no longer appear in the card UI.
- Kanban card sticker previews now render as floating transparent sticker images without card-like borders or backgrounds.
- Rebuilt the sliced sticker PNGs from the original chroma-key source using component-based slicing instead of fixed grid crops, preventing bottom-edge artifacts, neighboring-image bleed, and cut-off heads on the last row.
- Normalized every sticker to a centered 256x256 transparent canvas and rebuilt the sheet from the cleaned individual stickers.
- Card create/update API sanitizes sticker payloads against the generated Retro Sticker manifest before storing or returning them.
- The empty project sticker preview now uses the new Retro Sticker sheet instead of the previous standalone asset sheet.

## Database Changes

- None.

## Verification

- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` initially failed because Prisma could not rename `query_engine-windows.dll.node` while the local dev server was holding the file lock.
- Stopped the local project dev-server processes and reran `npm run build`; build passed.
- Verified the transparent sheet has alpha at the corner (`alpha=0`) and opaque sticker content in the image area.
- Visually checked a temporary preview sheet after component-based slicing, then deleted the preview debug file.
- Verified all 25 sticker PNGs are 256x256 with transparent corners and no debug preview file left in `public/stickers/retro`.
- Verified the bottom-row sticker files have top padding before UI rendering; clipping was addressed in the picker by removing `overflow-hidden` and rendering the image at a controlled inner size.

## Follow-ups

- None for this sticker cleanup.
