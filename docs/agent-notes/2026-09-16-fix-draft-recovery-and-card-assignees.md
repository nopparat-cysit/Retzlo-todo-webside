# 2026-09-16: Fix False Draft Recovery Popups and Card Assignees Resolution

## Objective
Fix the false trigger of the Draft Recovery modal when opening unedited cards, and ensure card assignees/caretakers (คนดูแล / ผู้รับผิดชอบ) are fully preserved and functional across both Kanban Board and Calendar views.

## Files Created, Modified, Deleted, or Moved
- **Created**: `docs/agent-notes/2026-09-16-fix-draft-recovery-and-card-assignees.md`
- **Modified**: `src/hooks/use-form-draft.ts`
  - Added `isDirty?: boolean` and `isDraftEqualInitial?: (data: T) => boolean` to `UseFormDraftOptions<T>`.
  - Suppressed auto-saving clean/pristine data to `localStorage`.
  - Added automatic discard of stored drafts on mount when draft data is identical to initial/pristine card data.
  - Re-checked draft when `draftKey` changes across cards.
- **Modified**: `src/components/kanban/card-modal.tsx`
  - Added `isDraftEqualInitial` comparison helper checking card attributes.
  - Passed `isDirty: hasChanges` and `isDraftEqualInitial` to `useFormDraft`.
  - Relocated `hasChanges` computation above `useFormDraft`.
- **Modified**: `src/app/(dashboard)/project/[id]/calendar/page.tsx`
  - Fetched `prisma.projectMember.findMany` in calendar page data loader.
  - Extracted `assigneeIds` and resolved `assignees` in `toCalendarCard` from `card.privateCoins`.
  - Passed `members={members}` to `ProjectCalendar`.
- **Modified**: `src/components/kanban/project-calendar.tsx`
  - Accepted `members?: CardAssignee[]` prop on `ProjectCalendar`.
  - Passed `members={members}` to `<CardModal ... />` so edit modal in calendar has project members.
  - Updated `executeSaveCard` and `normalizeCalendarCard` to preserve and resolve `assignees`.
  - Rendered `AssigneeStack` on `UpcomingCard` and Day view modal card entries.
- **Modified**: `src/components/kanban/card.tsx`
  - Fixed fallback resolution in `AssigneeStack` so empty array `[]` does not block `resolveAssignees`.
  - Resolved `assignees` in `saveCard` callback before invoking `onSaved`.
- **Modified**: `src/components/kanban/board.tsx`
  - Updated `normalizeCard` and `normalizeColumn` to accept `members` and resolve `assignees`.
  - Passed `members` to `normalizeCard` in `saveCard` and `createCard`.
- **Modified**: `src/components/kanban/assignee-picker.tsx`
  - Updated label to explicitly say "ผู้รับผิดชอบ / คนดูแล (Assignees)".
  - Updated button and empty helper text for clarity.
- **Modified**: `src/lib/forms/draft-storage.test.ts`
  - Added unit test cases verifying that identical/pristine drafts are detected and discarded.

## Important Behavior Changes
1. **No False Draft Recovery**: Opening and closing an existing card without making any edits will no longer save a draft to `localStorage` or trigger the "พบข้อมูลร่างที่ยังไม่ได้บันทึก" modal on subsequent openings.
2. **Caretakers/Assignees Available in Calendar View**: Users can now view and assign team members to cards directly within the Calendar view modal, and caretaker avatars are visible in both upcoming and day-detail panels.
3. **Robust Board Assignee Updates**: Creating or saving cards on the Kanban board properly maintains and resolves assignee details without losing avatar display.

## Database / Schema Changes
- None (zero schema migrations required).

## Verification Commands Run & Results
- `npx vitest run src/lib/forms/draft-storage.test.ts src/lib/kanban/assignees.test.ts`: Passed (20 tests passed).
- `npx vitest run`: Passed (51 test files, 191 tests passed).
- `npx prisma validate`: Valid.
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npm run build`: Passed (31/31 static pages generated successfully).

## Known Follow-ups, Blockers, or Deployment Notes
- None. All changes are backward compatible and pass strict TypeScript checks.
