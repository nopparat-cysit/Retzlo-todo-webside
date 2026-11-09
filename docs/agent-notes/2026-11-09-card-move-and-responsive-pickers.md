# 2026-11-09 Card Move on Long Press, Responsive Date/Time Pickers, and Card Modal Actions

## Date and Objective
- Date: 2026-11-09
- Objective:
  1. Add long-press (and context menu / right-click) column selection modal to Kanban cards so mobile users can easily transfer cards across columns even when other columns are hidden in single-column view.
  2. Optimize DatePicker, TimePicker, DateTimePicker, and DateTimeField components for responsive mobile viewports with fluid widths, viewport boundary collision guards, and touch targets.
  3. Redesign the 4 action buttons (Archive, Delete, Cancel, Save) at the bottom of the card detail modal (`CardModal`) for responsive layout, using a 2x2 grid on mobile and split actions on desktop.

## Files Created, Modified, Deleted, or Moved
- Created:
  - `src/components/kanban/card-move-modal.tsx`: Touch-friendly column selection modal using `AppModal` with theme swatches, glyph icons, card counters, and active column indicator.
  - `src/components/kanban/card-move-and-responsive-ui.test.ts`: 11 test cases validating long-press threshold, modal root mounting, responsive pickers, popover collision padding, and card modal button layout.
- Modified:
  - `src/components/kanban/card.tsx`: Added pointer-based long-press detector (450ms delay, 8px movement tolerance, haptic vibration fallback, click suppression after trigger, context menu trigger, and `onMoveRequest` handler).
  - `src/components/kanban/column.tsx`: Forwarded `onMoveCard` handler to `KanbanCard`.
  - `src/components/kanban/board.tsx`: Added `movingCard` state, mounted `<CardMoveModal />` at the root board level, implemented `handleMoveCardToColumn` with optimistic state update, column tab auto-switching on mobile, celebratory confetti and sound for DONE columns, and live sync broadcast.
  - `src/components/ui/popover.tsx`: Defaulted `collisionPadding = 12` in `PopoverContent` to prevent floating overlays from overflowing narrow viewport edges.
  - `src/components/ui/date-picker.tsx`: Added responsive fluid container width (`max-w-[280px] min-w-[260px]`), `collisionPadding = 12`, viewport width constraint (`max-w-[calc(100vw-1.5rem)]`), and `touch-manipulation` on navigation and day cells.
  - `src/components/ui/time-picker.tsx`: Added responsive fluid container width (`max-w-[260px] min-w-[240px]`), `collisionPadding = 12`, viewport width constraint (`max-w-[calc(100vw-1.5rem)]`), touch scroller item height (`h-8 sm:h-7.5`), and `touch-manipulation` across interactive buttons.
  - `src/components/ui/date-time-picker.tsx`: Added `collisionPadding = 12`, `max-w-[calc(100vw-1.5rem)]`, and `py-1.5 sm:py-1` tabs with `touch-manipulation`.
  - `src/components/ui/date-time-field.tsx`: Added `flex-wrap gap-1.5` and `h-7.5 sm:h-8` touch-friendly buttons.
  - `src/components/kanban/card-modal.tsx`: Redesigned bottom action footer into a responsive layout (mobile: symmetrical 2x2 grid `grid grid-cols-2 gap-2 w-full` with `h-10 sm:h-9` buttons; desktop: left-aligned destructive/archive actions and right-aligned cancel/save buttons).

## Important Behavior Changes
- Kanban Card Long-Press: Users on mobile touch devices can press and hold a card for 450ms without moving > 8px to open a column picker modal. Moving a card to another column updates the board optimistically, switches the active mobile tab to the destination column, triggers completion confetti if moved to a DONE column, and syncs across peers. Right-click on desktop also opens this menu.
- Responsive Pickers: Date and time popovers no longer bleed outside mobile screens (tested on 320px-375px widths) due to default 12px collision padding, fluid min/max widths, and touch target heights (>= 32px).
- Card Detail Modal Actions: Bottom buttons on mobile devices are laid out in a clean 2x2 grid (Row 1: Archive Card, Delete Card; Row 2: Cancel, Save Changes) with consistent 40px touch targets, eliminating cramped or overflowing horizontal button rows.

## Database / Schema Changes
- None.

## Verification Commands Run and Results
- Unit and Component Tests:
  - `npx vitest run src/components/kanban/ src/components/ui/`
  - Result: 28 test files passed (186 tests passed, 0 failed).
- Linter:
  - `npm run lint`
  - Result: Passed with zero ESLint warnings or errors.
- Prisma Schema Validation:
  - `npx prisma validate`
  - Result: Schema is valid.
- Production Build:
  - `cmd.exe /c "npm run build"`
  - Result: Passed with exit code 0 (43/43 pages compiled and optimized).

## Known Follow-ups, Blockers, or Deployment Notes
- No blockers or runtime regressions.
