# 2026-06-21 - Project card options menu

## Objective

Polish the project card three-dot options control so it stays visually inside the card cover and no longer appears clipped or awkward on the card edge.

## Files Modified

- `src/components/project/projects-dashboard.tsx`

## Behavior Changes

- Moved the project options trigger into the card cover area with a clearer active/hover state.
- Rendered the options menu as a fixed overlay positioned from the trigger button, avoiding clipping from the card container.
- Kept existing actions unchanged: edit project and delete project.

## Database Changes

- None.

## Verification

- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` failed before Next build because `prisma generate` could not rename the Windows Prisma query engine DLL while the local dev server process was holding it.
- Attempted to stop the local port `3000` dev server process, but Windows returned access denied.
- `npx next build` passed, confirming the Next production build, lint/type checks, page data collection, and static generation succeeded when skipping the locked Prisma generate step.
- `git -c safe.directory=C:/Users/Nopparat/Documents/Todo diff --check` passed with only LF-to-CRLF warnings from Git on Windows.

## Follow-ups

- If a full `npm run build` is required, close the running dev server from the owning terminal/app first, then rerun the command.
