# 2026-06-18 FAB Display Picker

## Objective

Improve the bottom-right FAB so users can choose which diary list or note should stay visible, and create a new item from that chooser when no suitable item exists.

## Files Modified

- `src/components/hub/fab-hub.tsx`
- `src/components/ui/panel.tsx`

## Behavior Changes

- Added a `Choose display` / `Change display` action to the FAB menu.
- The display picker loads visible diary lists from `/api/hub/diary` and visible notes from `/api/hub/notes`.
- Users can select one diary list or note to persist in the bottom-right FAB using the existing `retrod:redStar` localStorage key.
- Users can clear the selected display item.
- Users can create a new diary or note from the picker; new items created from that flow are pinned automatically.
- Selected project diary items navigate to their project diary page; personal diary items navigate to the diary hub.
- Restored the shared `PageShell` export from `src/components/ui/panel.tsx` so auth pages compile again.

## Database Changes

- None.

## Verification

- `npx prisma validate` passed.
- `npm run lint` passed with no ESLint warnings or errors.
- `.\node_modules\.bin\next.cmd build` passed outside the sandbox.

## Follow-Ups

- Consider supporting multiple pinned FAB display items if the UX needs more than one persistent shortcut later.
