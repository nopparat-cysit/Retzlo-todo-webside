# 2026-06-23 Project shell database outage fallback

## Objective

Prevent project pages from rendering the Next.js error overlay when the database is temporarily unreachable from `ProjectShell`.

## Files modified

- `src/components/project/project-shell.tsx`
- `src/components/project/project-shell.test.ts`

## Behavior changes

- Extracted project shell data loading into a focused helper.
- Added database connectivity error detection for Prisma unreachable-server failures.
- Added a retro lofi fallback panel with retry and projects navigation when the project shell cannot reach the database.
- The fallback does not render child routes, so nested project pages do not keep cascading database requests during the outage.

## Database/schema changes

- None.

## Verification

- `npm test -- src/components/project/project-shell.test.ts` failed before implementation because the shell had no outage fallback.
- `npm test -- src/components/project/project-shell.test.ts src/components/notes/notes-panel.test.ts` passed.
- `npm run lint` passed.
- `npx prisma validate` passed.
- `.\node_modules\.bin\tsc.cmd --noEmit` is blocked by pre-existing kanban reorder test fixture type errors (`Card` fixtures missing `color`, `priority`, `isStarred`; `ColumnWithCards` fixture missing `color`, `icon`).
- `npm run build` blocked before Next.js build during `prisma generate` with `EPERM` while renaming `node_modules\\.prisma\\client\\query_engine-windows.dll.node.tmp*` to `query_engine-windows.dll.node`.

## Follow-ups

- If the fallback appears, the underlying Neon/PostgreSQL connection still needs to be restored or verified outside the app UI.
