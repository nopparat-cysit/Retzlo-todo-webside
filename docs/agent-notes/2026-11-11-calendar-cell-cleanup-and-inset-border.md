# Calendar Cell Cleanup and Inset Border Refinement

Date: 2026-11-11
Objective: Remove cramped in-cell quick-add button and fix clipped/sunken calendar selection border.

## Files Modified
- `src/components/kanban/project-calendar.tsx`:
  - Removed in-cell quick-add `+` button from calendar month cells to declutter the date number row.
  - Changed selected day ring from `ring-2 ring-indigo-500` to `ring-2 ring-inset ring-indigo-500` so the 2px outline is drawn inside the cell without being clipped by parent `overflow-hidden` at top and left edges.
  - Adjusted cell padding on mobile from `p-1` to `p-1.5` so date number circle has comfortable spacing from the inset border.
- `src/components/kanban/calendar-modals.test.ts`:
  - Added unit test asserting inset ring styling for selected day and omission of in-cell quick-add button.

## Important Behavior Changes
- Month calendar cells no longer show a crowded `+` button on tap or hover next to the date number. Users add tasks via the inline mobile section `+ Add` button, calendar header, or day overview modal.
- Active day selection outline renders with equal 2px thickness and clean rounded corners across all grid positions without sinking into or clipping under the weekday header or container frame.

## Verification
- `npx eslint src/components/kanban/project-calendar.tsx`: Passed (0 errors, 0 warnings).
- `npx vitest run src/components/kanban/calendar-modals.test.ts`: Passed (6/6 tests).
- `npm test`: Passed (115/115 test files, 682 passed, 3 skipped).
- `cmd.exe /c "npm run build"`: Passed (43/43 routes compiled successfully).

## Known Follow-ups / Blockers
- None.
