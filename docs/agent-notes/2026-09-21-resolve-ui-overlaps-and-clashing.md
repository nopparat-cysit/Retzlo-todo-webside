# Resolve System-Wide UI Overlapping, Collisions, and Overdue Refinement

**Date:** 2026-09-21  
**Objective:** Resolve UI element overlapping ("UI ซ้อน"), z-index collisions, and crowded controls across topbar, board headers, floating buttons, notifications, and modals.

## Files Created / Modified

- `src/components/project/project-topbar-tools.tsx`:
  - Added responsive collapse: on `< md` screens, condensed the 4 individual tool buttons into a single "Studio Tools" popover button (`Sparkles`) with tabbed panels, eliminating topbar collision with navigation and project title.
  - Preserved expanded 4-button layout on `md:` and above.
- `src/components/kanban/board.tsx`:
  - Streamlined Control Bar from 4 boxes down to 3 clean boxes (`Total`, `Progress`, `Done`), avoiding 4-column overflow on small screens.
  - Implemented top-right pulsing Overdue icon with ping badge when `overdueCards > 0` and hover tooltip detailing overdue counts.
- `src/components/kanban/card.tsx`:
  - Repositioned the overdue tooltip on cards to pop upwards (`bottom-full mb-1.5`) rather than downwards, preventing it from obscuring priority badges and tags.
- `src/components/ui/toast.tsx`:
  - Elevated Toast notifications container to `bottom-24 right-4 sm:bottom-24 sm:right-6 bottom-safe` to avoid colliding with the Floating Action Hub (`FabHub`).
- `src/components/ui/command-palette.tsx`:
  - Elevated command palette z-index to `z-[1500]` and added responsive horizontal padding (`px-3`), preventing mobile sidebar from rendering on top of it.
- `src/components/diary/diary-list-panel.tsx`:
  - Adjusted grid template rows to `grid-rows-[auto_auto_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)]` so the mobile tab switcher occupies its own dedicated grid row.

## Behavior Changes

- Topbar controls no longer crush the project title on mobile/tablet viewports.
- Overdue tasks are elegantly highlighted via a top-right pulsing indicator without occupying bulky control bar slots.
- Toasts and Floating Action buttons operate in distinct vertical zones.

## Verification Commands & Results

- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm test`: Passed (all 61 test files, 279 tests passing).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (all 35 routes generated and optimized).
