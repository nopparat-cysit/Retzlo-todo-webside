# Kanban Toolbar Declutter & UX/UI Polish

## Date & Objective
- **Date**: 2026-10-12
- **Objective**: Declutter and modernize the Kanban board header and toolbar UI based on user feedback. Eliminate visual crowding caused by 13+ adjacent button pills, consolidate secondary actions (Activity Log, Archived Cards, Board Attributes) into a sleek "More" dropdown, compact the density toggle, unify stats into a quiet segmented pill, and balance filter/action controls.

## Files Modified
- [`src/components/kanban/board.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/board.tsx):
  - Consolidated secondary utilities (`Activity`, `Archive`, `Attributes`) into a unified `•••` (`MoreHorizontal`) dropdown menu.
  - Replaced bulky 4-part density toggle (`Cards: [Normal] [Compact 2x]`) with a compact, responsive segmented control.
  - Unified the 3 separate stats boxes (`Total`, `Prog`, `Done`) into a single cohesive, segmented status bar.
  - Aligned search and filter inputs on the left, and anchored the primary `+ Column` button to the right (`ml-auto`) for visual balance.
  - Maintained full backward compatibility with regression test regexes for overdue alerts and export triggers.
- [`src/components/kanban/board-activity-drawer.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/board-activity-drawer.tsx):
  - Portaled slide-over drawer to `document.body` via `<ModalPortal>` with `z-[300]`, resolving stacking-context occlusion by the app topbar and floating action button.
  - Added background body scroll lock when drawer is active and added `cursor-pointer` to close button.
- [`src/components/kanban/archived-cards-modal.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/archived-cards-modal.tsx):
  - Moved width and background styling from the overlay wrapper to `contentClassName`, fixing the backdrop coverage bug where the right third of the screen was left un-dimmed.
  - Added solid opaque retro lofi dark background (`bg-white/98 dark:bg-[#0e1025]`), rounded borders (`rounded-2xl`), and elevation shadow (`shadow-2xl`), resolving transparency bleed-through where cards behind the modal were visible through the modal body.

## Important Behavior Changes
- **No Lost Functionality**: All features (Activity Drawer, Archive Modal, Board Attributes Modal, Export Modal, Density switching, Quick Filters) remain fully operational and easily accessible.
- **Drawer Z-Index & Header Accessibility**: The Activity Log drawer now displays cleanly above all navigation bars and overlays with unobstructed header title, live badge, filter chips, and close button.
- **Archived Cards Modal Presentation**: The modal now features 100% full-screen dimming and blur backdrop, solid retro lofi panel surface with zero card bleed-through, and centered dialog positioning.
- **Improved Visual Hierarchy**: Clear distinction between informational metrics (Total/Prog/Done/Overdue), primary navigation/density controls, primary action (`+ Column`), and secondary settings (`•••` menu).
- **Responsive Adaptability**: On tablet and smaller screens, the header gracefully prevents horizontal overflow and wraps without visual clashing.

## Database & Schema Changes
- None (pure UX/UI refactoring).

## Verification Commands & Results
- `npx tsc --noEmit`: 0 errors
- `npm run lint`: Passed (0 errors, 0 warnings)
- `npx prisma validate`: Schema is valid
- `npx vitest run`: 94 suites passed, 495 tests passed, 0 failures
- `npm run build`: Production build succeeded, all 40 routes generated cleanly

## Known Follow-ups & Blockers
- None.
