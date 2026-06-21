# 2026-06-21 - Project settings polish

## Objective

Clean up the Project settings page layout and fix the settings content not scrolling inside the project shell.

## Files Modified

- `src/app/(dashboard)/project/[id]/settings/page.tsx`
- `src/components/project/settings-form.tsx`

## Behavior Changes

- Project settings now uses a full-height scroll container with `h-full min-h-0 overflow-y-auto`.
- Removed the old nested panel structure that made the page feel crowded.
- Rebuilt the settings form into a cleaner two-column layout:
  - Project details and cover upload on the left.
  - Privacy and danger zone controls on the right.
- Kept existing behavior for cover upload, project detail save confirmation, privacy toggle, and project delete confirmation.
- Replaced mojibake text with clear English labels.
- Personal sound preferences remain available as a separate settings section below the project form.

## Database Changes

- None.

## Design-System Impact

- No shared design-system components or Tailwind tokens were changed.
- The change is scoped to the project settings page and its settings form.

## Verification

- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` initially failed with a local Prisma query-engine DLL lock while the Next dev server was running.
- Stopped the local Next dev server processes for this workspace and reran `npm run build`; it passed.

## Follow-ups

- Run the dev server again before visually checking the page in the browser because it was stopped to release the Prisma DLL lock for build verification.
