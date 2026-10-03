# 2026-10-03 — Move Sidebar Sort Handle to the Front (ด้านหน้า)

## Objective
Move the drag-to-sort reorder handle (`GripVertical`) in the project sidebar from the far right to the front (left side, right before the navigation icon), resolving visual clutter and collision with the `+` (Create new board) button as requested in `media_1791041731557.png`.

## Files Created / Modified
- `src/components/project/project-nav-link.tsx` (modified): Accepted optional `dragHandle?: React.ReactNode` prop and rendered it at the front of `<Link>` before the item icon.
- `src/components/kanban/board-sidebar-dropdown.tsx` (modified): Accepted optional `dragHandle?: React.ReactNode` prop and rendered it inside the Boards header before `<FolderKanban />`.
- `src/components/project/project-sortable-nav.tsx` (modified): Passed `dragHandle` to `BoardSidebarDropdown` and `ProjectNavLink`, removing the old absolute button positioned at `right-2`.

## Important Behavior Changes
- The sort grip handle `⁝⁝` now appears at the front/left of each sidebar item (`[ ⁝⁝ 📁 Boards 3        + ]`).
- The `+` button on the right side of the Boards row now has full clearance without any overlapping or awkward interaction with the sort grip.
- When the sidebar is collapsed to icon-only mode, the drag handle is automatically hidden via `sidebar-expanded-only`.

## Verification Run & Results
- `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 errors / warnings.
- `npx prisma validate`: Schema valid.
- `npx vitest run`: 77 test files passed, 387 tests passed.
- `npm run build`: Production build verified.
