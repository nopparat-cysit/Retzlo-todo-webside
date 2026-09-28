# Work Session Note: Diary Monthly Recurrence

## Date & Objective
- **Date**: 2026-09-28
- **Objective**: Fix Diary/Routine recurrence drifting on monthly tasks (e.g. tasks repeating on the 28th of every month) by introducing `repeatUnit: "DAY" | "MONTH"` with day-of-month recurrence locking and month-end clamping instead of fixed 30-day intervals.

## Files Created, Modified, Deleted, or Moved
- **Modified**:
  - `prisma/schema.prisma` - Added `repeatUnit String @default("DAY")` to `DiaryItem`.
  - `src/lib/diary/recurrence.ts` - Added `repeatUnit` support in `isDiaryItemDueOnDate`, month-end day clamping (`getDaysInMonth`), and month difference calculation.
  - `src/lib/diary/checklist.ts` - Added `repeatUnit` to `DiaryChecklistItem`, `DiaryChecklistScheduleSource`, `normalizeDiaryChecklist`, `isDiaryChecklistItemDueOnDate`, and summary formatting.
  - `src/types/diary-item.ts` - Added `repeatUnit?: DiaryRepeatUnit` to `ProjectDiaryItem`.
  - `src/lib/diary/validation.ts` - Added `repeatUnit: z.enum(["DAY", "MONTH"]).optional().default("DAY")` to Zod schemas.
  - `src/app/api/projects/[id]/diary-items/route.ts` - Handled `repeatUnit` in create and query mapping.
  - `src/app/api/diary-items/[diaryItemId]/route.ts` - Handled `repeatUnit` in update and response mapping.
  - `src/app/api/hub/diary/route.ts` - Handled `repeatUnit` in create and response mapping.
  - `src/app/(dashboard)/projects/page.tsx` - Passed `repeatUnit` to `toGlobalCalendarDiary`.
  - `src/components/project/projects-dashboard.tsx` - Passed `repeatUnit` to `isDiaryItemDueOnDate`.
  - `src/components/diary/diary-checklist.tsx` - Added Day / Month unit toggle, preset for "ทุกเดือน (ตรงกับวันที่เดิม)", real-time day hint, and monthly badge display.
  - `src/components/diary/diary-list-panel.tsx` - Added `repeatUnit` to state, change tracking, `useMemo` dependency array, and card summary badges.
  - `src/lib/diary/checklist.test.ts` - Updated test expectations and added unit test for monthly checklist recurrence.
- **Created**:
  - `src/lib/diary/recurrence.test.ts` - Comprehensive unit tests for monthly recurrence (28th day across months, leap years, 31st month-end clamping, multi-month interval).
  - `docs/agent-notes/2026-09-28-diary-monthly-recurrence.md` - Work session change note.

## Important Behavior Changes
- Tasks repeating monthly (such as salary, bill payments, or routines on the 28th) now lock accurately to the day of the month of the `startDate` (e.g. 28th of every month) regardless of whether the month has 28, 29, 30, or 31 days.
- If a routine starts on the 31st (or 30th), shorter months (e.g. February with 28 or 29 days) safely clamp to the last day of the month without skipping or drifting.
- Checklist editor and Diary Item modal UI now offer an explicit unit toggle: "วัน (Days)" and "เดือน (Monthly)" along with preset buttons like "ทุกเดือน (ตรงกับวันที่เดิม)".
- Badges and cards display `Monthly (28th)` / `ทุกเดือน (วันที่ 28)` instead of misleading `Every 30d`.

## Database / Schema Changes
- Added `repeatUnit String @default("DAY")` column to `DiaryItem` table in PostgreSQL.
- Pushed to Neon PostgreSQL using `npx prisma db push`. Existing records safely default to `"DAY"`.

## Verification Commands Run & Results
- `npx prisma validate`: Passed (schema valid).
- `npx prisma db push`: Passed (database in sync with schema).
- `npx vitest run`: Passed (73 test files, 356 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Verified Next.js production compilation.

## Known Follow-ups, Blockers, or Deployment Notes
- No blockers. Existing diary routines retain `"DAY"` behavior with 100% backward compatibility.
