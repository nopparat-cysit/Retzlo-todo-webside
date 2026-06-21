# 2026-06-20 Project Topbar Layering

## Objective

Fix the project topbar appearing above or visually competing with the todo card detail modal.

## Files Modified

- `src/components/project/project-shell.tsx`
- `src/components/project/project-topbar-tools.tsx`
- `src/components/kanban/card-modal.tsx`

## Behavior Changes

- Lowered the project topbar layer from a high overlay layer to a normal navigation layer.
- Removed the extra local z-index from the topbar tools wrapper because their popovers already portal above the page.
- Kept the topbar overflow visible so tool popovers and focus/ambience menus are not clipped.
- Raised the card modal overlay above topbar, tooltips, dropdowns, and FAB UI.

## Design System Impact

- Project pages now treat the topbar as persistent navigation, not as a modal-level overlay.
- Card detail/create overlays should visually dim and cover the topbar instead of appearing underneath it.
- Existing topbar popovers still use shared popover z-index layers and should remain visible when opened normally.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` passed.

## Follow-Ups

- Manually recheck topbar tool popovers after opening ambience/focus/phase/garden to ensure they still align below the topbar.
