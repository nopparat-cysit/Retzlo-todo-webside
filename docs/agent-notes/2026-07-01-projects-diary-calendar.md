# Projects Page Calendar Diary Integration

## Date: 2026-07-01
## Objective
Implement diary integration in the projects page calendar, rendering diary occurrences for today and past days, warning (red highlighting) for items near-due or overdue, opening the diary editor on click, and sorting checked/completed items to the bottom of the list.

## Files Created/Modified

### [MODIFY] [page.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/app/(dashboard)/projects/page.tsx)
- Added database query to fetch `diaryItems` (both user's personal diaries and project diaries they belong to).
- Passed serialized `calendarDiaries` props to `<ProjectsDashboard />`.

### [MODIFY] [projects-dashboard.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/project/projects-dashboard.tsx)
- Defined `GlobalCalendarDiary` interface.
- Expanded calendar listing `filteredCalendarItems` to generate today/past diary occurrences.
- Sorted completed items (cards and diaries) to the bottom of the list.
- Highlighted close-to-time (<1hr) or overdue diary checklist occurrences with red borders.
- Re-used `<DiaryItemModal />` to view/edit diary items, performing updates via global endpoints with Toast notifications.

### [MODIFY] [diary-hub-panel.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/hub/diary-hub-panel.tsx)
- Exported `DiaryItemModal` and `DiaryPayload` to allow clean code sharing.
- Wrapped close request handlers in `useCallback` to prevent lint warnings.

### [MODIFY] [card-modal.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/card-modal.tsx)
- Wrapped close request handler in `useCallback` to prevent lint warnings.

### [MODIFY] [diary-list-panel.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/diary/diary-list-panel.tsx)
- Wrapped close request handler in `useCallback` to prevent lint warnings.

## Verification
- `npm run lint` - Passed with 0 errors/warnings.
- `npm run build` - Compiled and typed checked successfully.
