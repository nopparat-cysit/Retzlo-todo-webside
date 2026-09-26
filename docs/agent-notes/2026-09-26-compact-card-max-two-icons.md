# 2026-09-26 Limit Compact Card Stickers to Maximum 2 Icons

## Objective
Limit the number of retro stickers/icons displayed on the card surface to a maximum of 2 when the board is in compact view ("ถ้าย่อให้แสดง icon สูงสุดแค่ 2 อัน"), preventing multiple stickers from compressing the title text.

## Files Modified
- `src/components/kanban/card.tsx`:
  - Added `compactStickers = visibleStickers.slice(0, 2)` for compact mode.
  - In compact view, renders at most 2 stickers (`compactStickers.map(...)`).
  - Added `max={2}` to `AssigneeStack` in compact view.

## Verification
- `npx vitest run`: Passed (66 test files, 320 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Verified.
