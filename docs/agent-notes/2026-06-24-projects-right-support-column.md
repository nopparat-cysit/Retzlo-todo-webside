# 2026-06-24 Projects right support column

## Objective

Polish the Projects page index, right-side context panel, project starring, and edit modal layout.

## Files modified

- `prisma/schema.prisma`
- `src/app/(dashboard)/project/[id]/settings/page.tsx`
- `src/app/(dashboard)/projects/page.tsx`
- `src/app/api/projects/route.ts`
- `src/app/api/projects/[id]/route.ts`
- `src/app/api/projects/[id]/settings/route.ts`
- `src/components/project/project-appearance-controls.tsx`
- `src/components/project/settings-form.tsx`
- `src/components/project/projects-dashboard.tsx`
- `src/lib/projects/appearance.ts`
- `src/lib/projects/appearance.test.ts`
- `src/lib/projects/sort.ts`
- `src/lib/projects/sort.test.ts`
- `docs/agent-notes/2026-06-24-projects-right-support-column.md`

## Behavior changes

- The Projects page now renders a right-side support column on wide screens.
- Added `Recent Rhythm` using the currently filtered global calendar cards.
- Added `Cozy Status` using project, board, note, card, and due-soon counts.
- Sticker accents are outside project cards so the cards remain focused on project actions.
- Removed the `Workspace Pulse` label and uses `Project Overview` instead.
- Removed the `Project command side` heading from the Projects right-side panel.
- Added project card starring in the Project Index; starred projects sort to the top while each group keeps its original order.
- Starred project IDs persist in `localStorage` under `retrod:starred-projects`.
- Reworked the Project Index edit modal to match the project settings layout more closely with a split details/media composition and fixed footer actions.
- Added project appearance controls for color and sticker selection in create, edit, and project settings.
- Project cards now render their saved theme color and selected sticker.
- Project create/update/settings APIs validate and persist project appearance values.
- Removed the right sidebar `Project Overview` and `Focus project` summary block so the rail starts with actionable rhythm/status content.
- Made the Projects page left sidebar, Project Index topbar, and right sidebar sticky with screen-height sizing on desktop.
- Replaced the empty Projects state preview tile with a single paper note sticker.
- Reworked the Projects page shell into a fixed viewport-height layout so the left sidebar, Project Index topbar, and right support rail stay aligned to the screen while the project list scrolls inside the content column.
- Moved the right support rail out of the project-list grid and into the top-level desktop grid, preventing it from dropping below or extending beyond the viewport on wide screens.
- Added internal scrolling to the left Calendar panel and main project list so document-level scrolling does not pull the sidebars away from the screen.
- Removed the selected project sticker overlay from individual Project cards while keeping stickers available in project create/edit/settings and non-card page accents.

## Database/schema changes

- Added `Project.themeColor String @default("DEFAULT")`.
- Added `Project.sticker String @default("/stickers/retro/retro-sticker-13-project-folder.png")`.

## Verification

- Re-ran `npm test -- src/lib/projects/sort.test.ts`; test passed.
- Added and ran `npm test -- src/lib/projects/appearance.test.ts`; test passed.
- Re-ran `npm test -- src/lib/projects/sort.test.ts src/lib/projects/appearance.test.ts`; tests passed.
- Re-ran `npm run lint`; passed with no ESLint warnings or errors.
- Re-ran `npx prisma validate`; passed.
- Ran `npx prisma db push`; Neon database schema synced successfully, but the command still hit the known Prisma Client generate `EPERM` DLL rename issue afterward.
- Re-ran `npx prisma generate`; blocked by `EPERM` while renaming `node_modules\\.prisma\\client\\query_engine-windows.dll.node.tmp*` to `query_engine-windows.dll.node`.
- `Invoke-WebRequest http://localhost:3000/projects -UseBasicParsing` hung while waiting for the local dev server response; treated as a local runtime/DB/server blocker, not a pass.
- Re-ran `npm run build`; still blocked before Next.js build during `prisma generate` with `EPERM` while renaming `node_modules\\.prisma\\client\\query_engine-windows.dll.node.tmp*` to `query_engine-windows.dll.node`.
- Re-ran `npx prisma db push --skip-generate`; database schema was already in sync.
- Confirmed `.env` has a `DATABASE_URL` pointed at the Neon host without recording credentials.
- Stopped the duplicate local Next dev server processes that were locking `node_modules\\.prisma\\client\\query_engine-windows.dll.node`.
- Re-ran `npx prisma generate`; passed after the local dev server lock was cleared.
- A Prisma Client query run inside the managed sandbox reported a connection error, but the same query run outside the sandbox succeeded and returned the project row with `themeColor` and `sticker`.
- Restarted `npm run dev`; `http://localhost:3000/projects` returned `200` and the database warning text was no longer present in the response.
- Re-ran `npm run lint`; passed with no ESLint warnings or errors after the viewport layout update.
- Re-ran `Invoke-WebRequest http://localhost:3000/projects -UseBasicParsing`; returned `200` after the viewport layout update.
- Re-ran `npx prisma validate`; passed after the viewport layout update.
- Re-ran `npm run lint` after removing the Project card sticker overlay; the first run timed out at the tool limit, then a second run with a longer timeout passed with no ESLint warnings or errors.

## Follow-ups

- Keep only one local `npm run dev` server running before Prisma Client generation to avoid Windows DLL file locks.
- `npm run build` was not re-run after the viewport-only layout update because the local dev server is currently running and has previously locked the Prisma query engine during build-time generation.
