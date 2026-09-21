# Fix Horizontal Boundary Overflow ("เลยขอบ") & Overdue Top-Right Pinning

**Date:** 2026-09-21  
**Objective:** Eliminate horizontal page overflow, prevent topbar crowding on 1024px-1280px viewports, pin the Overdue indicator strictly to the top-right corner of the board header without taking up stat bar space, and wrap card tooltips in Radix Portal.

## Files Created / Modified

- `src/app/globals.css`:
  - Added `overflow-x: hidden;` to both `html` and `body` to prevent sub-pixel and padding-based horizontal scroll leaks across the entire viewport.
- `src/components/kanban/board.tsx`:
  - Positioned the Overdue task indicator strictly at the **absolute top-right corner** (`top-2.5 right-2.5 sm:top-3 sm:right-3`) of the board header card (`lofi-panel`), equipped with a pulsing red ping beacon and a Radix Portal Tooltip (`TooltipContent`) that never gets clipped by `overflow-hidden`.
  - Streamlined the 3 stat blocks (`Total`, `Progress`, `Done`) into a fluid `grid grid-cols-3 w-full 2xl:w-auto 2xl:flex` without fixed wide `min-w` constraints, ensuring they fit within small mobile and tablet screens without spilling out past the edge.
  - Added `min-w-0 max-w-full overflow-hidden` to the board's root element.
- `src/components/kanban/card.tsx`:
  - Replaced the custom absolute overdue tooltip on individual cards with Radix Portal `Tooltip` (`TooltipContent side="top" align="end"`), preventing tooltip boundaries from overflowing the card or being cut off by the column scroll container.
- `src/components/project/project-topbar-tools.tsx`:
  - Updated collapse breakpoint to `xl`: tools remain collapsed into the compact Studio Tools button on `< xl` (tablets and 1024px laptops with sidebar open), only expanding into 4 buttons on wide viewports (`xl:`).
- `src/components/project/project-shell.tsx`:
  - Constrained project title max-width across breakpoints (`max-w-[120px] ... lg:max-w-[200px] xl:max-w-[320px] 2xl:max-w-none`) so it truncates gracefully when the sidebar is visible instead of pushing topbar tools out of the header.
  - Set the "Workspace / Retzlo" breadcrumb to `hidden min-[640px]:flex lg:hidden 2xl:flex` and Command K badge to `hidden xl:flex` to conserve horizontal header real estate.
  - Added `min-w-0 max-w-full` to the main content container.
- `src/app/(dashboard)/project/[id]/board/page.tsx`:
  - Added `min-w-0 max-w-full overflow-hidden` to board page containers and `board-page-grid`.

## Verification Commands & Results

- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm test`: Passed (all 61 test files, 279 tests passing).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (all 35 routes successfully generated and optimized).
