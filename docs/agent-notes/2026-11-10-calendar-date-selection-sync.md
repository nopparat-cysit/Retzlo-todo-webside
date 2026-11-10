# Calendar Date Selection Synchronization and Modal State Preservation

Date: 2026-11-10
Objective: Synchronize active blue date selection across task clicks and preserve day selection on modal dismissal.

## Files Modified
- `src/components/kanban/project-calendar.tsx`:
  - Added `setSelectedDayKey(dateKey)` to `handleOpenQuickAdd` so date selection updates when triggering quick-add from any day cell or header.
  - Added `setSelectedDayKey(dateKey)` to Agenda view `DayItemRow` callbacks (`onCardClick`, `onNoteClick`, `onToggleDiary`).
  - Added `pointer-events-none` to mobile compact dot container so touch events bubble cleanly to the day cell section.
  - Added `setSelectedDayKey(key)` to month grid task buttons: `CalendarCardButton`, `CalendarNoteButton`, `CalendarDiaryChecklistButton`, and `CalendarDiarySummaryButton`.
  - Added optional `onClick?: () => void` prop and click handler to `CalendarDiaryChecklistButton`.
  - Added `setSelectedDayKey` synchronization to `onCardClick` and `onNoteClick` in mobile inline selected day task list and `DayModal`.
  - Synchronized `selectedDayKey` and `anchorDate` when clicking cards, notes, or checklist items in the Upcoming panel.
  - Changed `DayModal` Close button from `setSelectedDayKey(null)` to `setIsDayModalOpen(false)` to prevent clearing the active blue date selection ring upon closing.
  - Fixed JSX template key syntax in `DayModal` list items.
- `src/components/kanban/calendar-modals.test.ts`:
  - Added regression test asserting `selectedDayKey` synchronization on item clicks and preservation on modal close.

## Important Behavior Changes
- Clicking any task item, note, checklist, or summary pill in the calendar grid now immediately updates the blue selection ring (`ring-2 ring-indigo-500 bg-indigo-50/70`) to that task's date before opening the detail modal.
- Dismissing the `DayModal` via the Close button keeps the selected day highlighted instead of clearing the selection state to null.
- Clicking upcoming items navigates the calendar anchor and sets the active day selection.

## Database / Schema Changes
- None.

## Verification
- `npx eslint src/components/kanban/project-calendar.tsx`: Passed (0 errors, 0 warnings).
- `npx vitest run src/components/kanban/calendar-modals.test.ts`: Passed (5/5 tests).
- `npm test`: Passed (115/115 test files, 681 passed, 3 skipped).
- `npx prisma validate`: Valid.
- `cmd.exe /c "npm run build"`: Passed (43/43 routes compiled successfully).

## Known Follow-ups / Blockers
- None.
