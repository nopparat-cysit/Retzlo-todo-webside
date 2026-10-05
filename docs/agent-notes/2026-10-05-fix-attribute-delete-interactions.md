# Work Note: Fix Delete Interactions in Board Attributes (Story Points & Priority)

**Date**: 2026-10-05  
**Objective**: Resolve delete failure / unresponsiveness ("กดลบไม่ได้") across Board Attributes management (Story Points deletion and Priority level deletion), ensuring complete ConfirmModal protection and immediate toast feedback per AGENTS.md standards.

## Files Modified
- `src/lib/kanban/difficulty.ts`:
  - Sanitized story point scores as numbers in `getStoredStoryPoints` and `saveStoredStoryPoints` to prevent string/number type mismatches during item filtering.
  - Added fallback sync into `retzlo:story_points_default` when updating board-specific story points.
- `src/components/kanban/board-attributes-tab.tsx`:
  - Upgraded `pointToDelete` state to hold the full `CustomStoryPoint` object (`CustomStoryPoint | null`) instead of just a raw number.
  - Enhanced `handleConfirmDeletePoint` to match both numeric score (`Number(p.score) !== targetScore`) and label to prevent filtering failures.
  - Made `handleConfirmDeleteStatus` case-insensitive for reliable status removal.
  - Updated `ConfirmModal` for Story Points to display the human-friendly title/points label in the confirmation prompt and toast.
- `src/components/kanban/board-priorities-tab.tsx`:
  - Added `useToast` and `ConfirmModal` integration.
  - Added `priorityToDelete` and `isResetConfirmOpen` states.
  - Connected priority delete button to open `ConfirmModal` rather than executing silent/unconfirmed deletion.
  - Added interactive reset confirmation modal.
  - Added instant success/error toasts for Priority addition, deletion, and resetting.
- `src/components/project/project-settings-client.tsx`:
  - Improved `handlePrioritiesChange` with explicit response validation and error toast notifications on network or permission failure.
- `src/components/kanban/board-settings-attributes.test.ts`:
  - Added unit test checking `BoardPrioritiesTab` ConfirmModal and toast notification integration.

## Important Behavior Changes
- **Story Points deletion**:
  - Clicking the trash button on any story point (e.g. custom 50 pts or standard presets) now reliably opens `ConfirmModal` with the human-readable label.
  - Confirming the deletion removes the score regardless of whether it was deserialized as a string or number, saves to localStorage, syncs real-time events, and displays a success toast.
- **Priority deletion**:
  - Clicking the trash button on a priority level now presents a `ConfirmModal` to prevent accidental deletion, followed by a success toast upon removal and re-indexing.
  - Resetting priorities to defaults now triggers a `ConfirmModal` and toast notification.
  - If board update fails due to permissions or network, an error toast is displayed.

## Database & Schema Changes
- None (existing `Board.customPriorities` Json column and localStorage mechanisms utilized).

## Verification Commands & Results
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: PASS (8 tests passed)
- `npx vitest run src/lib/kanban/difficulty.test.ts src/components/project/project-settings-client.test.ts`: PASS (23 tests passed)
- `npm run lint`: PASS (0 warnings, 0 errors)
- `npx prisma validate`: PASS (Schema valid)
- `npm test`: PASS (89 test files passed, 458 passed, 3 skipped)
- `npm run build`: PASS (Optimized production build generated successfully)

## Follow-ups / Blockers
- None. All deletion interactions across Status, Priority, Story Points, and Columns are consistent, guarded by `ConfirmModal`, and provide instant toast notifications.
