# 2026-06-23 Diary Midnight Repeat Reset

## Objective

Make diary checklist repeat/reset behavior use the local day boundary, so completed checklist items reset at midnight for the selected repeat interval.

## Files changed

- Modified `src/lib/diary/checklist.ts`
- Modified `src/lib/diary/checklist.test.ts`
- Modified `src/lib/diary/recurrence.ts`
- Added `docs/agent-notes/2026-06-23-diary-midnight-repeat-reset.md`

## Behavior changes

- Date objects used by diary checklist completion checks now convert to a local `YYYY-MM-DD` key instead of UTC.
- Diary recurrence checks now treat Date objects as the local calendar day before calculating interval days.
- A checklist item completed yesterday no longer remains completed after local midnight.
- A checklist item due on the new local day is considered due immediately after local midnight.

## Database/schema changes

- None.

## Verification

- `npm test -- src/lib/diary/checklist.test.ts` failed first for the new local-midnight reset and due-date regression cases.
- `npm test -- src/lib/diary/checklist.test.ts` passed after implementation.
- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` failed before Next.js build because Prisma could not rename `node_modules/.prisma/client/query_engine-windows.dll.node.tmp2748` to `query_engine-windows.dll.node` due to `EPERM: operation not permitted`.

## Follow-ups

- Release the Prisma client DLL lock, then rerun `npm run build`.
