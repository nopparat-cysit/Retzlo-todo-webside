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
- src/components/kanban/card.tsx: Switched card date range display to compact `formatShortDate` (e.g. `Sep 11 → Sep 15`), applied `whitespace-nowrap min-w-0 max-w-[70%]` and `truncate` to prevent line-wrapping on Mac/Retina displays, and preserved full datetime with year in the hover `title` tooltip.
- src/components/diary/diary-checklist.tsx: Re-architected Due time section in routine items into a two-row structured layout with `whitespace-nowrap` on `ล้างเวลา (ตลอดวัน)` button, preventing it from awkwardly wrapping onto a third line below the time input.
- src/components/diary/diary-list-panel.tsx: 
  - Restored `DiaryFocusCard` layout so **Checklist Studio** is on the **LEFT** (`minmax(0, 1fr)`) and the **Information & Coins Shelf** is on the **RIGHT** (`320px`), returning to the natural primary reading order.
  - Retained `DiaryItemModal` (Create/Edit Modal) 2-column studio layout (`max-w-5xl`): Details, Start Date, Settings, and the Milestone Reward (Coins) Card on the left, and Checklist Studio on the right.
- src/components/hub/diary-hub-panel.tsx: Consistent 2-column studio modal layout for hub diary management.
- src/lib/diary/checklist.test.ts: Recurrence unit tests verifying items scheduled to start in +3 days are not due today.

## Important Behavior Changes
- Kanban Card date badge: Compact short date format with `whitespace-nowrap` and `truncate` ensures date range never breaks onto multiple lines on Mac/high-DPI screens, while retaining complete datetime on hover.
- Routine item Due time: Formatted cleanly with `Due time (เวลาที่กำหนด)` label and reset hint on top row, and time input with `[✕ ล้างเวลา (ตลอดวัน)]` button on the bottom row, never wrapping onto an extra line.
- `DiaryFocusCard` (Focus view): Checklist Studio is now back on the **LEFT** side, and the Metadata Shelf (Milestone Reward, Schedule & Rhythm, Visibility, and Quote) is on the **RIGHT** side.

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
