# 2026-06-23 Note Studio Layout

## Objective

Redesign the project notes page into the approved reward-style Note Studio layout while preserving existing note behavior.

## Files changed

- Modified `src/components/notes/notes-panel.tsx`
- Added `src/components/notes/notes-panel.test.ts`
- Added `docs/agent-notes/2026-06-23-note-studio-layout.md`

## Behavior changes

- Notes now render in a three-region studio layout:
  - Shelf/filter rail for Active, Starred, Dated, Undated, and Completed views.
  - Main note board with a featured note and scrollable note grid.
  - Quick capture panel for fast note creation.
- The page uses reward-style stickers in the hero and quick capture area.
- The Note Studio hero was compacted to remove unnecessary empty vertical space and keep stats/sticker in a tighter header row.
- Existing note create, edit, delete, star, hide, due date, emoji, color, and completed/restore actions are preserved.
- Completed notes remain separate from hidden notes and continue to appear only through the Completed filter.

## Database/schema changes

- None.

## Verification

- `npm test -- src/components/notes/notes-panel.test.ts` failed first because the approved layout markers and stickers were not present.
- `npm test -- src/components/notes/notes-panel.test.ts` passed after implementation.
- `npm test -- src/components/notes/notes-panel.test.ts` failed first for the compact hero regression guard, then passed after reducing the hero height.
- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` failed before Next.js build because Prisma could not rename `node_modules/.prisma/client/query_engine-windows.dll.node.tmp3848` to `query_engine-windows.dll.node` due to `EPERM: operation not permitted`.
- `npm run build` was rerun after compacting the hero and failed with the same Prisma DLL lock, this time from `query_engine-windows.dll.node.tmp4280`.
- `.\node_modules\.bin\tsc.cmd --noEmit` failed on existing test fixture issues outside this note change: `src/lib/kanban/reorder.test.ts` is missing newer `Card`/`ColumnWithCards` fields, and `src/lib/stickers/shared-icon-options.test.ts` compares against a removed `reward-gift` id.

## Follow-ups

- Release the Prisma client DLL lock, then rerun `npm run build`.
- Update the unrelated stale TypeScript test fixtures before using `tsc --noEmit` as a clean full-project gate.
