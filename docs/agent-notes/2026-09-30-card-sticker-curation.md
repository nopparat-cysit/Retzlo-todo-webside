# 2026-09-30 — Curate Card Sticker Set

## Objective
Replace Retro Stickers 26–50 in the card selector with a new 25-icon set drawn in the style of stickers 1–25.

## Files
- Modified `src/lib/stickers/retro-stickers.ts` to define card-specific sticker options and accept their paths during card payload normalization.
- Modified `src/components/stickers/retro-sticker-picker.tsx` to accept a selector-specific option list.
- Modified `src/components/kanban/card-modal.tsx` to use the curated card set.
- Modified `src/lib/stickers/shared-icon-options.test.ts` with card selector and normalization coverage.
- Created `public/stickers/retro/retro-sticker-sheet-51-75.png`, the 5×5 source sheet.
- Created `public/stickers/retro/retro-sticker-51-*.png` through `retro-sticker-75-*.png`, 25 transparent sticker assets; sticker 55 is a safety helmet and sticker 74 a notification bell.
- Removed interim `retro-sticker-55-ladybug.png` and `retro-sticker-74-potted-plant.png` assets after replacing those concepts.
- Created and updated this work note.

## Behavior
- The card picker includes stickers 1–25, the new stickers 51–75, and 15 reward icons (65 options total).
- Stickers 26–50 are omitted from new card selections. Existing selections remain valid and display; other shared selectors retain their prior library.
- The 25 new icons have no faces or text and use faceless silhouettes where relevant. The original ladybug and potted-plant concepts were replaced by a safety helmet and notification bell to avoid facial features and overlap with existing card icons.

## Database / Schema
- No database or schema changes.

## Verification
- `npm run lint` — passed.
- `npm run build` — passed.
- `npx prisma validate` — passed.
- `npx vitest run src/lib/stickers/shared-icon-options.test.ts` — passed (4 tests).
- `npx tsc --noEmit` — passed after the production build completed.

## Follow-up
- Original sticker assets 26–50 remain in `public/stickers/retro` for existing cards and other uses.
