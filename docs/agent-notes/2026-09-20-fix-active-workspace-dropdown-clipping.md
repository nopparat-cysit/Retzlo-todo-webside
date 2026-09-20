# 2026-09-20 Fix Active Workspace Dropdown Clipping

## Objective

Fix the Active Workspace dropdown in the project dashboard (`projects-dashboard.tsx`) which was sunken/clipped ("จม") under the dashboard header and sibling elements.

## Files changed

- Modified `src/components/project/projects-dashboard.tsx`
- Created `docs/agent-notes/2026-09-20-fix-active-workspace-dropdown-clipping.md`

## Behavior changes

- Removed `overflow-hidden` from the sticky command header (`.lofi-panel`) so that floating overlays anchored to header elements are not clipped by the header's container bounds.
- Replaced the handmade `fixed inset-0` backdrop and absolute positioned menu with Radix UI's `<Popover>` (`PopoverTrigger` and `PopoverContent`), ensuring the dropdown is portaled directly into `document.body` at `z-[750]`.
- This guarantees the dropdown is never clipped by ancestor overflow containers or trapped inside containing blocks created by `backdrop-blur-xl`.
- Added smooth chevron rotation indicator when the workspace switcher popover is open.

## Database/schema changes

- None.

## Verification

- `npm test`: Passed (61 test files, 277 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (35 routes compiled cleanly).

## Follow-ups

- None.
