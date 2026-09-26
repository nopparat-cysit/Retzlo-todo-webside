# 2026-09-26: Fix Card Dragging Across Entire Card Surface

## Objective
Fix issue where dragging a Kanban card by clicking anywhere on the card title resulted in browser text selection ("คลุมดำ/ไฮไลท์ตัวอักษร") rather than dragging the entire card.

## Files Modified
- `src/components/kanban/card.tsx`:
  - Removed `onPointerDownCapture={(e) => { e.stopPropagation(); }}` from the card title in both compact and comfortable views. This event handler was intercepting pointerdown events before they could bubble to `@dnd-kit`'s listeners on the card container.
  - Removed `select-text cursor-text` and applied `select-none` to the card title, ensuring that dragging over text initiates the card drag gesture rather than browser text selection.
- `src/components/stickers/retro-sticker-picker.tsx`:
  - Added `draggable={false}` and `pointer-events-none select-none` to `RetroStickerImage` to eliminate browser native image ghost-drag behavior when clicking or dragging near retro stickers.
- `src/components/kanban/card-interaction.test.ts`:
  - Added unit test asserting that `card.tsx` contains `select-none` and does not contain `onPointerDownCapture`, `select-text`, or `cursor-text`.

## Verification
- `npx vitest run`: Passed (66 test files, 321 tests passing).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Verified Next.js production build passes cleanly.
