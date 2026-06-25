# 2026-06-24 Calendar Day Modal and Day Cell Click

- **Date**: 2026-06-24
- **Objective**: Add an "all" button to day cells in the project calendar and support opening a list view modal with filtering/sorting when clicking on the day cells or the "all" link.

## Files Modified
- [MODIFY] [project-calendar.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/project-calendar.tsx)

## Behavior & Visual Changes
- **"all" Link**: Displayed an "all" link in the top-left corner of each calendar day cell that contains at least one task or note.
- **Day Cell Click**: Clicking on the background/container or date number of a calendar day cell now opens the "Day View" modal for that specific date.
- **Propagation Control**: Added `event.stopPropagation()` to the click handlers of card and note buttons (`CalendarCardButton` and `CalendarNoteButton`) inside the day cell, ensuring clicking on an item opens its edit modal directly without triggering the parent day cell's click.
- **Day View Modal**: 
  - Displays all items (cards and notes) on the selected date.
  - Implemented filters for item type (All, Tasks, Notes) and item status (All, Pending, Done).
  - Implemented sorting (Time, Title, Priority).
  - Clicking on any item inside the Day View modal opens its respective edit modal (`CardModal` or note details modal) layered on top.

## Verification
- `npm run lint`: Passed with zero warnings/errors.
- `npx prisma validate`: Schema is valid.
- `npx next build`: Compiled and optimized successfully.
- `npm run test`: Passed all 90 tests in 24 test files.
