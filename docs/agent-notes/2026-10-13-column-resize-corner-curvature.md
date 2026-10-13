# Work Note: 2026-10-13 - Kanban Column Resize Guide Curvature

## Objective
Fix the Kanban column horizontal resize guide line to curve seamlessly along the column's top-right and bottom-right `rounded-2xl` (16px) corners, eliminating the uncurved straight vertical line protrusion into empty space. Also remove native Windows WebKit scrollbar triangle buttons (`▲`/`▼`) for `.scrollbar-soft`.

## Files Created / Modified
- `src/components/kanban/column.tsx` (modified):
  - Replaced the uncurved straight `div` with a 3-piece vector geometry system:
    1. Top-right SVG arc (`M 0 1 A 15 15 0 0 1 15 16`) positioned at `-top-px -right-px h-4 w-4` curving along the column's top corner.
    2. Vertical middle line positioned at `top-[15px] bottom-[15px] -right-px w-[2px]` running flush along the column's right edge.
    3. Bottom-right SVG arc (`M 15 0 A 15 15 0 0 1 0 15`) positioned at `-bottom-px -right-px h-4 w-4` curving along the column's bottom corner.
  - Linked visibility directly to `isHighlightActive = isHandleHovered || isResizing` with smooth opacity fade transitions (`transition-opacity duration-150`).
- `src/app/globals.css` (modified):
  - Added `.scrollbar-soft::-webkit-scrollbar-button { display: none; width: 0; height: 0; }` to eliminate native Windows scrollbar arrow buttons across dark and light modes.
- `src/components/kanban/column-resize.test.ts` (modified):
  - Added unit test asserting curved corner vector geometry, SVG paths (`M 0 1 A 15 15 0 0 1 15 16` and `M 15 0 A 15 15 0 0 1 0 15`), middle connector line, and `isHighlightActive` state.

## Behavior Changes
- When hovering or dragging the Kanban column resize handle, the highlight guide line curves along the column's rounded corners at the top and bottom instead of poking out straight into empty space.
- Kanban column card lists on Windows browsers no longer render native scrollbar arrow buttons (`▲`/`▼`), resulting in a cleaner UI.

## Database / Schema Changes
- None.

## Verification Run & Results
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (all 40 routes generated cleanly).
- `npx vitest run`: Passed (99 test files, 525 passed, 0 failed).

## Known Follow-ups / Blockers
- None.
