# 2026-10-20: Smart Diary Calendar Future Date Filtering

## Objective
Address user request: `"หน้า calendar ถ้ายังไม่ถึงวันอย่าพึ่งแสดง เฉพาะ day diary แค่ถ้าเป็น แบบ สัปดา เดือนน ได้"`
Filter out recurring daily diary checklist items (`day diary` where `repeatUnit === 'DAY'` and `intervalDays < 7`) on upcoming future calendar dates (`dateKey > todayKey`) to eliminate repetitive clutter across future calendar cells, while allowing weekly (`intervalDays >= 7`) and monthly (`repeatUnit === 'MONTH'`) milestone schedules to appear in advance.

## Files Created, Modified, Deleted, or Moved
- **Modified**:
  - `src/lib/diary/recurrence.ts`:
    - Added and exported `normalizeDateKey(value: string | Date): string` to convert dates to `YYYY-MM-DD` without timezone distortion.
    - Added and exported `isWeeklyOrMonthlyDiary(item)`: returns true if `item.repeatUnit === 'MONTH'` or `item.intervalDays >= 7`.
    - Added and exported `isDailyDiary(item)`: inverse of `isWeeklyOrMonthlyDiary`.
    - Added and exported `shouldShowDiaryOnCalendarDate({ itemDate, todayDate, diary, checklistItem })`: checks if the date has arrived (`itemDate <= todayDate` always shows; future dates require weekly or monthly schedule).
  - `src/lib/diary/checklist.ts`:
    - Re-exported `isWeeklyOrMonthlyDiary`, `isDailyDiary`, and `shouldShowDiaryOnCalendarDate`.
  - `src/lib/diary/recurrence.test.ts`:
    - Added comprehensive unit tests verifying schedule detection and calendar date filtering across today, past dates, future daily suppression, future weekly allowance, and future monthly allowance.
  - `src/components/kanban/project-calendar.tsx`:
    - Imported `shouldShowDiaryOnCalendarDate` and integrated into `diaryChecklistEntries` calculation with `todayKey` dependency.
    - Suppresses daily diary checklist items from appearing in future calendar cells, Day Detail Modal, and Upcoming panel, while preserving weekly and monthly schedules.
  - `src/components/project/projects-dashboard.tsx`:
    - Replaced blanket future-date suppression (`if (dateStr > todayKey) continue;`) with `shouldShowDiaryOnCalendarDate({ itemDate: dateStr, todayDate: todayKey, diary })`.
    - Weekly and monthly diary schedules are now visible on future dashboard calendar dates, while day diaries are withheld until that day arrives.
  - `src/lib/calendar/view.test.ts`:
    - Added unit test verifying `showDiaryChecklist` toggle correctly filters diary checklist items.
  - `docs/system-guide.md`:
    - Documented Smart Diary Calendar Filtering in Section 2.5 (English and Thai) and the changelog.
  - `src/components/help/data/topics-th.ts` & `src/components/help/data/topics-en.ts`:
    - Updated interactive in-app Knowledge Base & Help topics with Smart Diary Filtering explanation.
- **Created**:
  - `docs/agent-notes/2026-10-20-calendar-diary-future-date-filter.md`: This work session note.

## Important Behavior Changes
1. **Suppression of Daily Habits on Future Dates ("ถ้ายังไม่ถึงวันอย่าพึ่งแสดง เฉพาะ day diary")**:
   - On the project calendar (`/project/[id]/calendar`) and workspace dashboard calendar, daily recurring diary checklist items (`intervalDays: 1` or `< 7`) no longer duplicate across every upcoming future date cell in month/week views.
   - When that day arrives (or for any past date), all daily diary items and their completion statuses remain fully visible and interactive.
2. **Advance Visibility for Weekly & Monthly Schedules ("แค่ถ้าเป็น แบบ สัปดา เดือนน ได้")**:
   - Diary items scheduled weekly (`intervalDays: 7`, `14`, etc.) or monthly (`repeatUnit === 'MONTH'`) appear on upcoming future calendar dates as expected, allowing users to plan ahead for recurring meetings, sprints, reviews, rent, and monthly commitments.
3. **Timezone-Safe Date Comparison**:
   - Implemented `normalizeDateKey` to prevent local midnight date shifts when converting dates across timezones.

## Database / Schema Changes
- None (pure logic and presentation layer filtering).

## Verification Commands Run & Results
- `npx vitest run src/lib/diary/recurrence.test.ts` — PASSED (13/13 tests, 8ms)
- `npx vitest run src/lib/calendar/view.test.ts` — PASSED (9/9 tests, 7ms)
- `npm test` — PASSED (101/101 test files, 552/555 passed, 3 skipped, 10.19s)
- `npx prisma validate` — PASSED (schema valid)
- `npm run lint` — to be verified
- `npm run build` — to be verified

## Known Follow-ups, Blockers, or Deployment Notes
- None.
