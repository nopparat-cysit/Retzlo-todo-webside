# 2026-06-23 Note Sticker And Calendar Layout

## Objective

Continue the pending UI adjustments for notes and calendar: replace note emoji selection with shared stickers, make note board cards shorter by using three columns, and place Calendar Studio Upcoming on the left.

## Files changed

- Modified `src/components/notes/notes-panel.tsx`
- Modified `src/components/notes/notes-panel.test.ts`
- Modified `src/lib/notes/validation.ts`
- Modified `src/lib/notes/validation.test.ts`
- Modified `src/components/kanban/project-calendar.tsx`
- Modified `src/components/kanban/project-calendar.test.ts`
- Added `docs/agent-notes/2026-06-23-note-sticker-calendar-layout.md`

## Behavior changes

- Note create/edit now uses shared retro/reward sticker selection instead of the old emoji picker.
- New notes default to the paper-note sticker.
- Existing notes with legacy emoji values still render as text fallback.
- Note cards now use three columns on wide screens to reduce long card stretching.
- Calendar Studio visually places the Upcoming rail on the left side of the calendar grid on wide screens.

## Database/schema changes

- None.

## Verification

- `npm test -- src/components/notes/notes-panel.test.ts` failed first for missing sticker picker and three-column layout, then passed.
- `npm test -- src/lib/notes/validation.test.ts` failed first because sticker paths were rejected by the old 8-character emoji limit, then passed.
- `npm test -- src/components/kanban/project-calendar.test.ts` failed first because Upcoming was not marked/ordered as left rail, then passed.
- `npx prisma validate` passed.
- First `npm run lint` timed out at 30 seconds and was not counted as passing.
- Second `npm run lint` passed with no ESLint warnings or errors.
- `npm run build` failed before Next.js build because Prisma could not rename `node_modules/.prisma/client/query_engine-windows.dll.node.tmp22740` to `query_engine-windows.dll.node` due to `EPERM: operation not permitted`.

## Follow-ups

- Release the Prisma client DLL lock, then rerun `npm run build`.
