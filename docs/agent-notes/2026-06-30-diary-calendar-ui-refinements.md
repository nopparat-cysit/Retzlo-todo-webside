# Change Note: Diary List Status Colors, Checklist Sort, and Calendar Cell Grouping

**Date:** 2026-06-30
**Objective:** Style diary list items based on completion and due status; sort completed checklist items to the bottom in both diary checklist and calendar view; group diary checklists inside calendar cells by diary title to prevent bloating.

## Files Modified

- [diary-checklist.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/diary/diary-checklist.tsx) [MODIFY] - Sorted completed diary checklist items to the bottom inside `DiaryChecklistPreview`.
- [diary-list-panel.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/diary/diary-list-panel.tsx) [MODIFY] - Added `getDiaryStatusColor` helper function to determine status (completed, close to due, overdue). Styled `DiaryListButton` borders with colors corresponding to status:
  - **Green (Completed)**: all due checklist items are checked.
  - **Yellow (Close)**: active, not completed, and due within 1 hour.
  - **Red (Overdue)**: active, not completed, and past due time.
- [project-calendar.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/project-calendar.tsx) [MODIFY] - Grouped diary checklist items inside month calendar cells under a single `CalendarDiarySummaryButton` representing progress. Clicking it opens the expanded day detail modal. Added completed status sorting to the bottom of the calendar's day items list (`selectedDayItems`).

## Verification Run
- `npm run lint`: Executed successfully.
- `npm run build`: Executed successfully.
