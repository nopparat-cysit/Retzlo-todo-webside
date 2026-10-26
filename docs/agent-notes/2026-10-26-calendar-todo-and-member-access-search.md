# Work Note: Calendar Quick-Add Todo Item Type and Board Member Access Filter

- Date: 2026-10-26
- Objective: Implement Calendar quick-add Todo type (single-occurrence diary checklist) as the primary option, and add explicit member access checkboxes with a dynamic search filter when members exceed 10.

## Files Modified

- `src/lib/diary/recurrence.ts`: Extended `DiaryRepeatUnit` to include `"ONCE"`. Handled single-occurrence evaluation in `isDiaryItemDueOnDate`, `isWeeklyOrMonthlyDiary`, and `shouldShowDiaryOnCalendarDate`.
- `src/lib/diary/checklist.ts`: Preserved `repeatUnit === "ONCE"` in `normalizeDiaryChecklist`.
- `src/lib/diary/validation.ts`: Updated `repeatUnitSchema` to include `"ONCE"`.
- `src/lib/diary/recurrence.test.ts`: Added unit tests verifying single-occurrence non-repeating behavior.
- `src/components/kanban/project-calendar.tsx`:
  - Added `"todo"` as the default primary option in quick-add SegmentedControl (`[Todo] [Task / Card] [Quick Note]`).
  - Added API submission for `"todo"` producing a non-repeating single-day diary checklist item.
  - Separated single-occurrence todos from multi-item recurring diary groups so they render interactively on the calendar cells.
  - Added quick todo deletion and individual detail modal handling.
- `src/components/kanban/create-board-modal.tsx`: Added member checkboxes and search filter when `members.length > 10`.
- `src/components/kanban/create-board-page-view.tsx`: Added member checkboxes and search filter when `members.length > 10`.
- `src/components/project/project-boards-manager.tsx`: Added member checkboxes and search filter in the Manage Member Access modal when `projectMembers.length > 10`.

## Important Behavior Changes

1. **Calendar Quick Add**: Users can now add a single-occurrence "Todo" directly from any calendar cell without recurring across other days. Checking it off strikes through the title and updates the completion state immediately.
2. **Board Member Access**: All private member access selection lists now provide clear checkbox indicators and an instant search filter whenever workspace membership exceeds 10 members.

## Database / Schema Changes

- None. PostgreSQL schema stores `repeatUnit` as a string column with default `"DAY"`, seamlessly supporting `"ONCE"`.

## Verification Commands Run & Results

- `npx vitest run`: Passed (104 test files passed, 580 tests passed, 0 failures).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Passed (production build compiled successfully).

## Known Follow-ups

- Next tasks requested by user:
  1. System-wide analysis and improvement plan for colored vertical stripes (`w-1 self-stretch`).
  2. Redesign of Admin Vault navigation with a dedicated sidebar and direct page-number jump input for table pagination.
  3. Visual polish of Rewards Shop.
