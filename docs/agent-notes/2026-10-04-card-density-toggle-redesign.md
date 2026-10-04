# Work Note: Kanban Card Density Toggle UX Redesign

- **Date:** 2026-10-04
- **Objective:** Redesign the Card Density (`Compact` vs `Normal`) toggle UX/UI so that it is intuitive, directly grouped alongside the Board view switcher on the top left, clearly labeled, and explains why it is useful (viewing 2x more tasks on busy boards without scrolling).

## Files Modified

- `src/components/kanban/board.tsx`
  - Relocated Card Density control from the isolated, disconnected right toolbar cluster to sit directly adjacent to the Board / Table view switcher (`[Board | Table]` -> `Cards: [Normal | Compact 2x]`).
  - Added an explicit `Cards:` prefix and clear labels (`Normal` with `<LayoutGrid />` and `Compact` with `<Rows3 />`).
  - Added a `2x` productivity badge on `Compact` to instantly communicate its value.
  - Added rich tooltips in Thai & English explaining what each mode does and why it is useful.
  - Removed the old, isolated mystery button from the right-hand bar.
  - Updated `onToggleDensity` to accept an optional target (`(target?: "comfortable" | "compact") => void`).
- `src/components/kanban/board-view-container.tsx`
  - Updated `handleToggleDensity` to support setting a direct target density.
- `src/components/kanban/board-views-and-sidebar.test.ts`
  - Added contract tests verifying the new companion placement, labels, `2x` badge, and explanatory tooltip text.

## Behavior Changes

- Users viewing the Kanban board now immediately see the `Cards: Normal | Compact (2x)` toggle right beside the `Board` button.
- Toggling to `Compact` gives instant visual feedback: cards shrink to a high-density minimalist format, allowing teams to view 2x more tasks at a glance during daily standups or backlog grooming.
- When switching to `Table` view, the card density toggle cleanly hides, preventing confusion.

## Verification Run & Results

- `npx vitest run src/components/kanban/`: Passed (8 test files, 38 tests passed).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (`No ESLint warnings or errors`).
- `npm run build`: Passed (Next.js production build succeeded).
- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid`).

## Deployment / Follow-ups

- Ready for commit and push.
