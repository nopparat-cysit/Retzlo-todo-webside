# 2026-09-26: Move Active Navigation Dot to Back of Link

## Objective
Relocate the active indicator dot on the project sidebar navigation links (`Board`, `Calendar`, etc.) from the front (`left-2`, in front of the icon) to the back (`right-3`, after the label), improving layout balance and removing visual crowding around the icon.

## Files Modified
- `src/components/project/project-nav-link.tsx`:
  - Moved `.project-nav-active-marker` from before the icon to after the label.
  - Positioned at `absolute right-3 top-1/2 -translate-y-1/2` with `md:group-hover/sort:opacity-0` so it smoothly yields when the owner hovers to show the sort/reorder drag handle.
- `src/app/globals.css`:
  - Added `right: auto;` to `#project-sidebar-toggle:checked ~ .project-shell-grid .project-sidebar .project-nav-active-marker` to ensure correct bottom-pill centering when the sidebar is collapsed.

## Verification
- `npx vitest run`: Ran all unit test suites.
- `npm run lint`: ESLint check.
- `npm run build`: Production Next.js build verification.
