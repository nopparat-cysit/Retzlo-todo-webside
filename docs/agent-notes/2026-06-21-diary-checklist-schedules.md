# 2026-06-21 Diary Checklist Schedules

## Objective

Add scheduled checklist items inside diary lists so each checklist item can repeat every N days with its own start date and optional time.

## Files Created

- `src/lib/diary/checklist.ts`
- `src/lib/diary/checklist.test.ts`
- `src/components/diary/diary-checklist.tsx`

## Files Modified

- `prisma/schema.prisma`
- `src/lib/diary/validation.ts`
- `src/types/diary-item.ts`
- `src/app/api/projects/[id]/diary-items/route.ts`
- `src/app/api/diary-items/[diaryItemId]/route.ts`
- `src/app/api/hub/diary/route.ts`
- `src/app/(dashboard)/project/[id]/diary/page.tsx`
- `src/app/(dashboard)/hub/diary/page.tsx`
- `src/components/diary/diary-list-panel.tsx`
- `src/components/hub/diary-hub-panel.tsx`
- `src/components/project/project-quick-hub.tsx`
- `src/components/hub/fab-hub.tsx`

## Behavior Changes

- Diary lists now support scheduled checklist items stored on the diary item.
- Each checklist item has a label, optional detail, repeat interval from 1 to 365 days, start date, optional time, and completed dates.
- Checklist completion is tracked per selected date so recurring checklist items can be completed again on future due dates.
- Project diary, personal diary hub, project quick-create, and bottom-right FAB diary creation can save checklist items.
- Not-yet-due checklist items are dimmed and cannot be completed until due.

## Database / Schema Changes

- Added `DiaryItem.checklist Json?`.

## Verification

- `npm test -- src/lib/diary/checklist.test.ts` - failed before implementation because the helper module did not exist, then passed after implementation.
- `npx prisma validate` - passed.
- `npx prisma generate` - passed.
- `npx prisma db push` - passed and synced the Neon database schema.
- `npm run lint` - passed.
- `npm run build` - failed once on Prisma JSON input typing for checklist arrays, then passed after casting checklist payloads through `Prisma.InputJsonValue`.

## Follow-ups

- Consider adding per-checklist-item filters after users have enough checklist data to need them.
