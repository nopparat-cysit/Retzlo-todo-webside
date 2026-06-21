# 2026-06-21 - Project Notes toggle

## Objective

Add a project-level setting to turn the Notes module on or off and improve the settings UX around project feature controls.

## Files Modified

- `prisma/schema.prisma`
- `src/app/(dashboard)/project/[id]/board/page.tsx`
- `src/app/(dashboard)/project/[id]/calendar/page.tsx`
- `src/app/(dashboard)/project/[id]/notes/page.tsx`
- `src/app/(dashboard)/project/[id]/settings/page.tsx`
- `src/app/api/hub/notes/route.ts`
- `src/app/api/notes/[noteId]/route.ts`
- `src/app/api/projects/[id]/notes/route.ts`
- `src/app/api/projects/[id]/settings/route.ts`
- `src/components/project/project-shell.tsx`
- `src/components/project/settings-form.tsx`

## Behavior Changes

- Project owners can now turn the Notes module on or off from Project settings.
- Settings now groups feature controls under a clearer "Workspace features" section.
- When Notes is disabled:
  - Notes is hidden from the project sidebar navigation.
  - The Board page hides the Notes side rail and uses the full board width.
  - The Project Notes page redirects back to Project settings.
  - The project calendar no longer loads dated notes.
  - Project notes API list/create/update/delete returns a disabled-module error.
  - Hub notes excludes projects where Notes is disabled.
- Existing notes are not deleted; turning Notes back on restores access.

## Database Changes

- Added `Project.notesEnabled Boolean @default(true)`.
- Ran `npx prisma db push`; the database sync completed successfully.

## Design-System Impact

- No shared design-system components or Tailwind tokens were changed.
- Settings layout changes are scoped to `SettingsForm`.

## Verification

- `npx prisma validate` passed.
- `npm run lint` passed.
- `npx prisma db push` synced the database, but its automatic generate step hit a local Prisma query-engine DLL lock while the Next dev server was running.
- Stopped the local Next dev server processes for this workspace.
- `npx prisma generate` passed after the lock was released.
- `npm run build` passed.

## Follow-ups

- Restart the dev server before visually checking the page because it was stopped to release the Prisma DLL lock.
