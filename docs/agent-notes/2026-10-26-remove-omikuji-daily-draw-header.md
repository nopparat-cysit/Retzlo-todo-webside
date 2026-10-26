# Work Note: Remove Sensoji Omikuji Header & Daily Draw Badge from Omikuji Modal

**Date**: 2026-10-26  
**Objective**: Remove the redundant top header text ("Sensoji Omikuji · No. [n]") and the "Daily Draw" pill badge from `OmikujiModal` to declutter the slip view and eliminate duplicate headers.

## Files Modified

- `src/components/project/project-topbar-tools.tsx`:
  - Removed `<OmikujiTrigger />` from both compact and wide desktop topbar views, completely removing the standalone Omikuji section from the project toolbar.
- `src/components/omikuji/omikuji-modal.tsx`:
  - Removed the `Sensoji Omikuji · No. {fortune.number}` and `{settings.drawMode === "daily" && "Daily Draw"}` badge from the slip top controls row.
  - Realigned the top controls to keep the Language Switcher (`TH | EN`) neatly positioned at the top-right next to the modal close button.
  - Removed unused `Calendar` and `Languages` icon imports from `lucide-react`.
  - Upgraded the wax seal element in `OmikujiModal` to use the handcrafted 3D `OmikujiWaxSeal` vector art component from `zen-vector-art.tsx`.
- `src/components/omikuji/omikuji-trigger.tsx`:
  - Updated the tooltip text from English "Daily Draw · วันละ 1 ใบ" to Thai "เซียมซีรายวัน · วันละ 1 ใบ".

## Important Behavior Changes

- The Omikuji modal slip view no longer renders the redundant "Sensoji Omikuji · No. 19" breadcrumb or the "Daily Draw" badge above the traditional newspaper slip header.
- The newspaper slip itself already displays the authentic Japanese title (`浅草観音百番おみくじ`), kanji slip number (`第 十九 番`), and `#19`, making the header clean, uncluttered, and authentic.

## Database & Schema Changes

- None.

## Verification Commands & Results

```bash
npx vitest run src/components/project/zen-garden/ src/lib/omikuji/
# Result: 3 passed, 14/14 tests passed

npm run lint
# Result: Passed with 0 warnings, 0 errors

npx prisma validate
# Result: The schema at prisma/schema.prisma is valid

npm run build
# Result: Compiled successfully; 43/43 pages generated
```

## Known Follow-ups & Blockers

- None.
