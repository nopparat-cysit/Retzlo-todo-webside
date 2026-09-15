# 2026-09-15 Diary Routine Start Date, Layout Swap & Kanban Card Date Range

## Objective
Support per-item start date configuration for Diary routine checklist items (allowing routines to begin in +N days without being marked due today), swap Diary layout so Checklist is on the right and Shelf is on the left, optimize Milestone Reward Coins placement, and split Kanban Card dates into Start Date (วันที่เริ่ม) and End Date (วันที่สิ้นสุด) with full UI and safe data persistence.

## Files Modified
- src/types/kanban.ts: Added startDate?: string | null and startDateAllDay?: boolean to Card.
- src/lib/kanban/due-date.ts: Added composeStartDate, extractStartDate, extractStartDateAllDay, withStartDate, and ormatCardDateRange.
- src/lib/kanban/due-date.test.ts: Added unit tests for composeStartDate, extractStartDate, withStartDate, and ormatCardDateRange.
- src/app/api/cards/route.ts: Added startDate and startDateAllDay to card schemas, serialization, POST creation, and PATCH update handlers (stored safely inside privateCoins).
- src/app/(dashboard)/project/[id]/board/page.tsx: Mapped startDate and startDateAllDay in 	oColumns.
- src/components/kanban/card-modal.tsx: Added Start Date & Due Date DateTimeFields, wired into form draft recovery, change tracking, and payload submission. Reordered ColorPicker to be positioned directly below the Start Date and Due Date section as requested.
- src/components/kanban/card.tsx: Added date range / start date badge formatting (ormatCardDateRange) and updated saveCard callback.
- src/components/diary/diary-checklist.tsx: Revamped the Timing & Recurrence card UI for routine items. Split Start date and Repeat every into balanced columns, placed quick presets ([วันนี้], [+1d], [+3d], [+7d]) neatly below the date input with accurate dynamic active state highlighting (removing hardcoded amber border), added repeat rhythm presets ([ทุกวัน], [7 วัน], [14 วัน], [30 วัน]), and added a clean due time row with a reset-to-anytime action.
- src/components/diary/diary-list-panel.tsx: 
  - Restored `DiaryFocusCard` layout so **Checklist Studio** is on the **LEFT** (`minmax(0, 1fr)`) and the **Information & Coins Shelf** is on the **RIGHT** (`320px`), returning to the natural primary reading order.
  - Retained `DiaryItemModal` (Create/Edit Modal) 2-column studio layout (`max-w-5xl`): Details, Start Date, Settings, and the Milestone Reward (Coins) Card on the left, and Checklist Studio on the right.
- src/components/hub/diary-hub-panel.tsx: Consistent 2-column studio modal layout for hub diary management.
- src/lib/diary/checklist.test.ts: Recurrence unit tests verifying items scheduled to start in +3 days are not due today.

## Important Behavior Changes
- `DiaryFocusCard` (Focus view): Checklist Studio is now back on the **LEFT** side, and the Metadata Shelf (Milestone Reward, Schedule & Rhythm, Visibility, and Quote) is on the **RIGHT** side.
- Routine items date UI: Clean, uncrowded card layout with accurate dynamic active state on quick preset buttons ([วันนี้], [+1d], [+3d], [+7d]) without false selections.
- Diary routine checklist items can now start in the future (e.g. +3 days). Items whose start date has not arrived are accurately marked as not due today.
- Diary Create & Edit / Setting modals (`DiaryItemModal` and `HubDiaryModal`) place Details, Start Date, Settings, and Milestone Reward Coins on the left, and Checklist Studio on the right.
- Kanban cards support Start Date (วันที่เริ่ม) and End Date (วันที่สิ้นสุด), formatted as a date range badge (15 มี.ค. → 20 มี.ค.) on the board.

## Database / Schema Changes
- None (zero database migration risk). startDate and startDateAllDay are stored in Postgres within the existing card.privateCoins JSON field, matching the proven architecture used for difficulty scores and assignees.

## Verification Commands Run & Results
- 
px vitest run: Passed (45 test files, 172 tests passed, 0 failures).
- 
pm run lint: Passed (No ESLint warnings or errors).
- 
px prisma validate: Passed (Prisma schema valid).
- 
pm run build: Passed (31/31 pages compiled and statically generated).

## Follow-ups & Blockers
- None. All functionality is verified and production ready.
