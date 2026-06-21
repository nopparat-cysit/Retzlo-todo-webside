# 2026-06-20 FAB Display Preview

## Objective

Review and improve the bottom-right FAB diary/note display flow so the selected diary list or note is shown from the FAB until the user changes it.

## Files Modified

- `src/components/hub/fab-hub.tsx`

## Behavior Changes

- The FAB now opens the display picker immediately when no diary list or note is selected.
- When a diary list or note is selected, the FAB button becomes a starred display button and opens a preview panel instead of only showing a shortcut.
- The preview panel loads the latest selected diary or note data from `/api/hub/diary` or `/api/hub/notes`.
- If the selected item was deleted or is no longer visible, the panel tells the user to choose another display.
- The preview panel includes actions to open the full page, change the display, create a new diary, create a new note, or clear the display.
- Existing local persistence still uses the `retrod:redStar` localStorage key.

## Database Changes

- None.

## Verification

- `npx prisma validate` passed.
- `npm run lint` passed with no ESLint warnings or errors.
- First `npm run build` attempt failed during `prisma generate` with `EPERM` because running Next dev server processes were holding the Prisma query engine DLL.
- Stopped the repo-specific Next dev server processes, then reran `npm run build`; the second build passed.

## Follow-Ups

- Consider adding item-level inline editing inside the FAB preview if users need to edit without opening the full diary or notes page.
