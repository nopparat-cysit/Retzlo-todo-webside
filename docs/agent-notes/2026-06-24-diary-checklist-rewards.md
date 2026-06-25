# 2026-06-24 Diary checklist rewards

## Objective

Polish the Diary checklist UI and add configurable checklist completion rewards.

## Files modified

- `prisma/schema.prisma`
- `src/app/(dashboard)/hub/diary/page.tsx`
- `src/app/(dashboard)/project/[id]/diary/page.tsx`
- `src/app/api/diary-items/[diaryItemId]/route.ts`
- `src/app/api/hub/diary/route.ts`
- `src/app/api/projects/[id]/diary-items/route.ts`
- `src/components/diary/diary-checklist.tsx`
- `src/components/diary/diary-list-panel.tsx`
- `src/components/hub/diary-hub-panel.tsx`
- `src/lib/diary/checklist.ts`
- `src/lib/diary/checklist.test.ts`
- `src/lib/diary/payout.ts`
- `src/lib/diary/validation.ts`
- `src/types/diary-item.ts`
- `docs/agent-notes/2026-06-24-diary-checklist-rewards.md`

## Behavior changes

- Diary checklist rows were redesigned with softer routine rows, clearer completion controls, repeat/time badges, and reward status badges.
- Diary create/edit modals now include a coin reward toggle button.
- The reward panel lets users configure how many coins to award and choose project coins or global coins where applicable.
- Personal diary rewards use global coins.
- Project diary rewards can use project coins or global coins.
- Rewards are paid only when all checklist items due on the selected day are complete.
- Rewards are claim-limited to once per diary item per selected day.
- Checklist updates send the selected date so the server can determine the correct daily payout.

## Database/schema changes

- Added `DiaryItem.rewardCoins Int @default(0)`.
- Added `DiaryItem.rewardCoinType String @default("PROJECT")`.
- Added `DiaryItem.rewardClaimedDates Json?`.
- Ran `npx prisma db push --skip-generate`; Neon schema synced successfully.

## Verification

- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed.
- `npx prisma validate` passed.
- First `npx prisma generate` failed with the known Windows Prisma query engine DLL lock while the local dev server was running.
- Stopped the local Next dev server processes that were locking Prisma.
- Re-ran `npx prisma generate`; passed.
- `npx prisma db push --skip-generate` passed.
- `npm run lint` passed.
- `.\node_modules\.bin\tsc.cmd --noEmit` failed only on existing unrelated `src/lib/kanban/reorder.test.ts` fixture type gaps for card and column fields.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts src/components/diary/diary-list-panel.test.ts` passed.
- `npm run build` passed.
- Restarted `npm run dev` with `Start-Process`; `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` returned `200`.

## Follow-ups

- The unrelated kanban reorder test fixtures still need updated `color`, `priority`, `isStarred`, column `color`, and column `icon` fields before full `tsc --noEmit` can pass.
