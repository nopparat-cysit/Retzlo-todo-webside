# Collapse Ritual Details and Remove Back Button

Date: 2026-11-11
Objective: Collapse all ritual metadata badges into the Details fold (keeping only Star, Edit, Delete visible) and remove the redundant "Back to rituals" button.

## Files Modified
- `src/components/diary/diary-list-panel.tsx`:
  - Removed the `← Back to rituals` button above the ritual title on mobile (users navigate via the mobile top tab switcher).
  - Streamlined the header top row so that only the title icon, ritual name, and action bar buttons (Details toggle, Star, Edit, Delete) are displayed.
  - Moved status badges (`DiaryStatusBadges`), reward coins pill, description, author name, and start date into the collapsible `{!isBannerCollapsed && (...)}` section.
- `src/components/diary/diary-list-panel.test.ts`:
  - Added unit test asserting omission of `Back to rituals` and inclusion of badges inside the collapsible details block.

## Important Behavior Changes
- In collapsed mode (default when Details toggle is closed), the ritual header is a slim, single-line banner without wrapping badge pills.
- Expanding Details reveals all ritual status badges, coin rewards, description, and metadata.
- The redundant `← Back to rituals` button is eliminated.

## Verification
- `npx eslint src/components/diary/diary-list-panel.tsx`: Passed (0 errors, 0 warnings).
- `npx vitest run src/components/diary/diary-list-panel.test.ts`: Passed (8/8 tests).
- `npm test`: Passed (115/115 test files, 683 passed, 3 skipped).
- `cmd.exe /c "npm run build"`: Passed (43/43 routes compiled successfully).

## Known Follow-ups / Blockers
- None.
