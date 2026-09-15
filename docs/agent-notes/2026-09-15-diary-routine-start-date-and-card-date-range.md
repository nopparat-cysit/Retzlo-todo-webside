# 2026-09-15 Diary Routine Start Date, Layout Swap & Kanban Card Date Range

## Objective
Support per-item start date configuration for Diary routine checklist items (allowing routines to begin in +N days without being marked due today), swap Diary layout so Checklist is on the right and Shelf is on the left, optimize Milestone Reward Coins placement, and split Kanban Card dates into Start Date (วันที่เริ่ม) and End Date (วันที่สิ้นสุด) with full UI and safe data persistence.

## Files Modified
- src/types/kanban.ts: Added startDate?: string | null and startDateAllDay?: boolean to Card.
- src/lib/kanban/due-date.ts: Added composeStartDate, extractStartDate, extractStartDateAllDay, withStartDate, and ormatCardDateRange.
- src/lib/kanban/due-date.test.ts: Added unit tests for composeStartDate, extractStartDate, withStartDate, and ormatCardDateRange.
- src/app/api/cards/route.ts: Added startDate and startDateAllDay to card schemas, serialization, POST creation, and PATCH update handlers (stored safely inside privateCoins).
- src/app/(dashboard)/project/[id]/board/page.tsx: Mapped startDate and startDateAllDay in 	oColumns.
- src/components/kanban/card-modal.tsx: Added Start Date & Due Date DateTimeFields, wired into form draft recovery, change tracking, and payload submission.
- src/components/kanban/card.tsx: Added date range / start date badge formatting (ormatCardDateRange) and updated saveCard callback.
- src/components/diary/diary-checklist.tsx: Stopped clobbering per-item startDate with defaultStartDate, added per-item start date picker and quick offset buttons (+1d, +3d, +7d), and rendered start date badges in preview.
- src/components/diary/diary-list-panel.tsx: Swapped DiaryFocusCard layout so Shelf is on the left (320px) and Checklist is on the right (minmax(0, 1fr)), highlighted Milestone Reward Coins at the top of the shelf, added mini coin badge in header banner, and added coin progress callout in checklist header.
- src/lib/diary/checklist.test.ts: Added recurrence unit tests verifying items scheduled to start in +3 days are not due today.

## Important Behavior Changes
- Diary routine checklist items can now start in the future (e.g. +3 days). Items whose start date has not arrived are accurately marked as not due today.
- Diary focus view now places the Checklist Studio on the right side of the desktop screen and the Information Shelf on the left side.
- Coins (Milestone Reward) are positioned at the top of the left shelf, with a mini coin badge in the header and progress feedback in the checklist header.
- Kanban cards now support both Start Date (วันที่เริ่ม) and End Date (วันที่สิ้นสุด), formatted as a date range badge (15 มี.ค. → 20 มี.ค.) on the board.

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
