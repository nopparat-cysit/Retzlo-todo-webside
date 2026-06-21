# 2026-06-21 - Project Notes toggle

## Objective

Add a project-level setting to show or hide only the Board page Notes rail and improve the settings UX around project feature controls.

## Files Modified

- `prisma/schema.prisma`
- `src/app/(dashboard)/project/[id]/board/page.tsx`
- `src/app/(dashboard)/project/[id]/settings/page.tsx`
- `src/app/api/projects/[id]/settings/route.ts`
- `src/components/project/project-shell.tsx`
- `src/components/project/settings-form.tsx`

## Behavior Changes

- Project owners can now show or hide only the Notes rail on the right side of the Board page.
- Settings now groups feature controls under a clearer "Workspace features" section.
- When the Board notes rail is hidden, the Board page uses the full board width.
- The project sidebar Notes link, Project Notes page, Hub notes, Calendar notes, and Notes APIs remain normal and are not controlled by this toggle.
- Existing notes are not deleted or disabled.

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
- After clarification, removed the broader Notes module restrictions and reran `npm run lint` and `npm run build`; both passed.

## Follow-ups

- Restart the dev server before visually checking the page because it was stopped to release the Prisma DLL lock.
