# 2026-09-26: Board Switch Skeleton, Overdue Alignment & Dark Mode Dropdown Surfaces

## Objective
Address three high-priority visual and UX bugs reported by the user:
1. **Immediate Skeleton on Board Switch**: When clicking between board tabs in `BoardTabsBar`, the previous board's cards remained visible while waiting for Next.js server components to resolve. Provide immediate transition feedback by rendering `<BoardSkeleton />` instantly upon clicking a board tab.
2. **Dark Mode Dropdown Surfaces (`media_1790331289475.png`)**: In dark mode, clicking "All Assignees" produced a blinding white/cream background with light white text, making options invisible. Fix Tailwind class generation and add explicit CSS rules for Radix select/menu/popover dropdowns in dark mode (`#0e1025`).
3. **Overdue Button Misalignment (`media_1790332686102.png`)**: The overdue clock button was pinned with `!absolute !top-2.5 !right-2.5 sm:!top-3 sm:!right-3`, placing it noticeably higher than the `TOTAL`, `PROG`, and `DONE` stat pills. Align it directly in-line with the stat boxes in the Premium Control Bar with matching dimensions (`h-9 sm:h-10 w-9 sm:w-10 rounded-xl`).

## Files Modified
- `src/app/globals.css`:
  - Added explicit dark mode rules for Radix floating menus (`[data-theme="dark"] [data-radix-select-content]`, `[data-radix-menu-content]`, `[data-radix-popper-content-wrapper] > div`) with `#0e1025 !important` surface, `#e7e5e4` item text, and subtle hover highlights.
- `src/components/ui/select.tsx`:
  - Replaced unsupported `dark:bg-ink-900/98` with `dark:bg-[#0e1025]`.
- `src/components/ui/dropdown-menu.tsx`:
  - Replaced unsupported `dark:bg-ink-900/98` with `dark:bg-[#0e1025]`.
- `src/components/ui/popover.tsx`:
  - Replaced unsupported `dark:bg-ink-900/98` with `dark:bg-[#0e1025]`.
- `src/components/ui/tooltip.tsx`:
  - Replaced `bg-ink-900/98` with `bg-[#0e1025]`.
- `src/components/kanban/board-tabs-bar.tsx`:
  - Added `switchingBoardId` state and dispatched `board-switching` custom event upon clicking any non-active board tab.
  - Added pulse indicator on the clicked tab to communicate immediate loading intent.
- `src/components/kanban/board.tsx`:
  - Added `isSwitchingBoard` state listening to `board-switching` events; resets when `board.id` prop updates or on timeout.
  - Rendered `<BoardSkeleton />` immediately when `isSwitchingBoard` is true instead of stale columns/cards.
  - Added pulsing skeleton indicators to the 3 stat boxes during board switching.
  - Removed `!absolute` positioning from the overdue clock button and integrated it directly into the Premium Control Bar alongside `Total`, `Prog`, and `Done` (`h-9 sm:h-10 w-9 sm:w-10 rounded-xl`), ensuring perfect horizontal and vertical alignment.
- `src/components/notes/board-notes-rail.tsx`:
  - Added `useEffect` to synchronize `notes` state whenever `initialNotes` updates upon board switching.
- `src/components/theme/theme.test.ts`:
  - Added automated test assertions for Dark Mode floating menus and Radix select backgrounds.
- `src/components/kanban/board-switch-skeleton.test.ts`:
  - Added comprehensive test suite verifying the `board-switching` contract, skeleton rendering, control bar alignment, and dark mode dropdown surfaces.

## Behavior Changes
- Switching boards immediately shifts the columns view into a smooth skeleton shimmer, eliminating the delayed or frozen UI state.
- Dropdown menus (including `All Assignees`, column menus, and profile popovers) now render with deep midnight obsidian backgrounds (`#0e1025`) and crisp light text in Dark Mode, eliminating white-on-white text washing.
- The overdue badge button is now perfectly aligned with the `TOTAL`, `PROG`, and `DONE` stat boxes with identical height (`h-9 sm:h-10`), rounded corners (`rounded-xl`), and unified flex layout.

## Database / Schema Changes
None.

## Verification
- `npm test`: 64 passed (309 tests passed across all suites).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Succeeded (all pages generated cleanly).

## Follow-ups / Blockers
None.
