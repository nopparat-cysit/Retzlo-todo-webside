# 2026-10-05 Instant Inline Template Preview

## Objective
Replace full-screen modal popups for Status, Priority, and Story Points workflow templates with instant inline previewing directly in the board attributes settings. When a user clicks on any template chip, the list and preview section below immediately update in real time without requiring opening and closing modal dialogs.

## Files Modified
- `src/components/kanban/board-priorities-tab.tsx`:
  - Added `previewTemplate` state for real-time priority template previewing.
  - Added active chip highlights when a template is selected.
  - Implemented Live Preview Action Banner with Replace/Append mode toggle, apply button, and cancel button.
  - Replaced modal popup with inline previewing while preserving ConfirmModal on apply per `AGENTS.md`.
- `src/components/kanban/board-attributes-tab.tsx`:
  - Added `previewStatusTemplate` and `previewPointTemplate` state variables.
  - Sub-tab 1 (Status): Added instant inline template previewing, active chip styles, interactive preview action banner, and `displayedStatuses` mapping.
  - Sub-tab 3 (Story Points): Added instant inline template previewing, active chip styles, interactive preview action banner, `displayedStoryPoints` mapping, and bottom live preview bar real-time sync.
  - Removed full-screen modal dialogs for previewing status and story point templates while retaining ConfirmModal protection on application.

## Important Behavior Changes
- Clicking any template chip instantly highlights it and updates the item list below in real-time ("ด้านล่างเปลี่ยนให้ดูเลย").
- In Story Points tab, both the list and the bottom palette preview badges immediately update to show the selected scale (Fibonacci, Linear, T-Shirt, Pomodoro, Risk Matrix, Retzlo, etc.).
- Clicking "คืนค่าเดิม" (or clicking the active chip again) immediately reverts the view back to the current board items.
- Applying a template triggers a `ConfirmModal` confirming user intent, followed by a toast notification upon success.

## Database / Schema Changes
- None.

## Verification
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: Passed (10 tests).
- `npx vitest run`: Passed (89 test files, 460 tests).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Passed (Next.js production build succeeded).

## Known Follow-ups
- None.
