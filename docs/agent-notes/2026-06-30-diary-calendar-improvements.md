# Change Note: To-do Card Notes, Diary in Calendar, and Diary UI/UX Refactoring

**Date:** 2026-06-30
**Objective:** Add custom note field to Kanban cards, show diary checklists in calendar with direct completion toggle, and refactor diary UI to a cleaner 2-column layout with sort/filter controls.

## Files Created/Modified

### Database Schema
- [schema.prisma](file:///c:/Users/Nopparat/Documents/Todo/prisma/schema.prisma) [MODIFY] - Added nullable `note` string field to `Card` model.

### Type Definitions & Helpers
- [kanban.ts](file:///c:/Users/Nopparat/Documents/Todo/src/types/kanban.ts) [MODIFY] - Added `note` property to `Card` interface.
- [view.ts](file:///c:/Users/Nopparat/Documents/Todo/src/lib/calendar/view.ts) [MODIFY] - Added `showDiaryChecklist` filter state, `diary_checklist` to `UnifiedCalendarItem`, updated default filters, and added filter checking logic in `filterCalendarItems`.

### API & Data Fetching
- [route.ts](file:///c:/Users/Nopparat/Documents/Todo/src/app/api/cards/route.ts) [MODIFY] - Added `note` field to validation schemas (create/update), mapping payload, and Prisma client mapping.
- [page.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/app/(dashboard)/project/[id]/board/page.tsx) [MODIFY] - Included `note` in `toColumns` mapping type signature.
- [page.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/app/(dashboard)/project/[id]/calendar/page.tsx) [MODIFY] - Verified project membership, queried and mapped project diary items, and passed them to `<ProjectCalendar />`.

### UI Components
- [card.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/card.tsx) [MODIFY] - Rendered custom Note indicator badge using `FileText` icon.
- [card-modal.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/card-modal.tsx) [MODIFY] - Added Note textarea inside Left panel and wired it to state and form submission.
- [project-calendar.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/project-calendar.tsx) [MODIFY] - Managed diary items state, calculated dynamic diary checklist items per day, integrated them into grid cells, upcoming lists, and day dialogs, and implemented `handleToggleDiaryChecklist` to update database via API.
- [diary-list-panel.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/components/diary/diary-list-panel.tsx) [MODIFY] - Refactored grid layout from 3 to 2 columns. Removed the right queue column and integrated it into the Left rail list, grouped under sub-headers. Added Sort/Filter dropdown selects. Added a "View in Calendar" button linking back to the Calendar page.

## Verification Run
- `npx prisma db push`: Executed successfully. Generated updated Prisma Client.
- `npm run lint`: Running.
- `npm run build`: To be run.
