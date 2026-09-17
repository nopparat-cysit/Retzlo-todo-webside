# Move Focus Mode Toggle to Topbar as Clean Icon Button

- **Date**: 2026-09-17
- **Objective**: Relocate the Focus Mode toggle from the crowded Kanban board toolbar to the workspace topbar (`ProjectShell`) as a dedicated, retro-styled icon button (`h-9 w-9`), decluttering the board channel toolbar and enabling workspace-wide focus mode.

## Files Created, Modified, Deleted, or Moved

- `src/components/project/focus-mode-toggle.tsx` [NEW]:
  - Dedicated focus mode toggle button with retro lofi indigo styling (`h-9 w-9`, `Eye`/`EyeOff` icon, lavender highlight when active).
  - Tooltip with `"Focus mode (F)"` / `"Exit focus mode (F)"`.
  - Global `F` keyboard shortcut listener (ignored inside text inputs / textareas).
  - Syncs with `document.body.classList.toggle("focus-mode")` and dispatches/listens to custom `"focus-mode-toggle"` events.
  - Clean unmount cleanup removing `"focus-mode"` class from `document.body`.
- `src/components/project/project-shell.tsx` [MODIFIED]:
  - Imported and rendered `<FocusModeToggle />` in the top right tool cluster alongside `ProjectTopbarTools`, `NotificationsPopover`, and user profile.
- `src/components/kanban/board.tsx` [MODIFIED]:
  - Removed the bulky text button (`[Eye] Focus` / `Focus mode`) from the Board Channel toolbar to free up space.
  - Subscribed to window `"focus-mode-toggle"` event and synced initial state from `document.body.classList` so the `FOCUS ACTIVE` badge and local board behavior remain in sync.
  - Kept the `N` shortcut for Quick Add.
- `src/components/project/project-shell.test.ts` [MODIFIED]:
  - Added unit test asserting `FocusModeToggle` is mounted in the topbar and that the bulky text button is removed from `board.tsx`.

## Important Behavior Changes

- The Kanban board toolbar is cleaner and less crowded, leaving more breathing room for filters and search.
- Users can toggle Focus Mode from anywhere in the project workspace via the clean eye icon button in the topbar or by pressing the `F` key.
- The `FOCUS ACTIVE` badge continues to display on the board header when Focus Mode is engaged.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test`: 52 test suites, 201 tests passed (100%).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Production build verified for all 31 routes.

## Known Follow-ups, Blockers, or Deployment Notes

- None.
