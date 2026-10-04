# Work Note: 2026-10-04 — Quick Add Status Button in Column Status Picker

## Objective
Add a `+` status button in the Column creation and editing modal (`ColumnStatusPicker`) as requested by the user ("เพิ่มปุ่ม + status"), enabling users to add new custom statuses directly with an inline color swatch picker without leaving the modal or losing entered column details.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/kanban/column-status-picker.tsx`:
    - Added a `+` button at the section header next to "CARD STATUS".
    - Added a `+ เพิ่มสถานะ` dashed tile at the end of the statuses grid.
    - Implemented an expandable inline Quick Add panel with an auto-focused label input, 8-color swatch picker, keyboard navigation (Enter to save, Escape to cancel), and Toast confirmation.
    - Automatically selects newly created statuses as the column's default card status upon saving.
  - `src/components/kanban/board-settings-attributes.test.ts`: Added unit tests verifying `+` button existence, `isAddingStatus` state, and `handleQuickAddStatus` logic.
  - `docs/theme-system.md`: Updated changelog.

## Important Behavior Changes
1. **Frictionless Status Creation:** Users creating a new column (e.g. "QA Testing" or "In Review") can now click `+` directly under CARD STATUS, type the status name, pick a color, and save.
2. **Auto-Selection:** Newly created statuses are immediately set as the active default status for that column.
3. **Reactive Global Sync:** Dispatches `retzlo:statuses-updated` immediately, syncing across all boards, Kanban cards, and views in real-time.
4. **Toast Feedback:** Displays an immediate success toast per `AGENTS.md` standards.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: Passed (7/7 tests).
- `npx vitest run src/components/kanban/`: Passed (10/10 test files, 56/56 tests).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
