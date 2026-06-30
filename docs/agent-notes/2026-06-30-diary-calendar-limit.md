# Change Note: Limit Diary Checklists in Calendar to Current/Past Dates

**Date:** 2026-06-30
**Objective:** Prevent diary checklists from appearing on future dates in the project calendar view. Diary lists will only show up on active days that have arrived or past days.

## Files Modified

- [project-calendar.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/project-calendar.tsx) [MODIFY] - Added date boundary checks in `diaryChecklistEntries` useMemo, skipping items where `day.key > todayKey`. Added `todayKey` to the dependency array.

## Verification Run
- `npm run lint`: Executed successfully.
- `npm run build`: Executed successfully.
