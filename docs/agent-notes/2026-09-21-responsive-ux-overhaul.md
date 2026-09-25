# 2026-09-21 Responsive UX/UI Overhaul

## Objective
Execute comprehensive, principled responsive UX/UI overhaul across the entire platform according to UX/UI design guidelines: eliminating overflow, touch target issues (< 44px), layout collisions, and unoptimized mobile ordering.

## Files Modified
- `src/components/ui/app-modal.tsx`
  - Replaced center alignment on mobile with responsive bottom-sheet modal pattern (`flex items-end sm:items-center justify-center p-0 sm:p-4 md:py-6`).
  - Added `pb-safe` to `AppModalFooter` for safe-area home indicator padding.
- `src/components/kanban/card-modal.tsx`
  - Added `w-full max-h-[90dvh] sm:max-h-[92dvh] rounded-t-2xl sm:rounded-2xl` with a mobile visual drag handle.
  - Made story point buttons responsive: `grid-cols-4 sm:grid-cols-7` for spacious finger touch targets on small screens.
  - Responsive title sizing (`text-xl sm:text-2xl`), body padding (`p-3.5 sm:p-5`), and footer wrapping (`flex-wrap sm:flex-nowrap pb-safe`).
- `src/components/notes/notes-panel.tsx`
  - Replaced rigid 1-to-3 column jump with intermediate tablet layout: `grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_20rem]`.
  - Added compact horizontal scrolling filter pills and sort controls for mobile view (< md).
  - Hid desktop shelf rail on small screens (`hidden md:flex`) to bring note content directly to the top.
- `src/components/kanban/board.tsx`
  - Added `min-w-0` and truncation safety to stats bar metric blocks.
  - Responsive filter toolbar with full-width search (`w-full sm:w-44 min-w-[130px]`), compact gaps (`gap-1.5 sm:gap-2`), and responsive text labels.
- `src/components/project/projects-dashboard.tsx`
  - Reordered mobile layout (`order-1 lg:order-2` on content section, `order-2 lg:order-1` on agenda aside) so workspaces and boards appear first on mobile viewports.
  - Added `shrink-0` to all sub-nav links to prevent text compression and line breaks.
  - Responsive text labels on view mode toggle and new project/board action buttons.
- `src/components/kanban/project-calendar.tsx`
  - Responsive header text sizing (`text-base sm:text-xl`) and range badge truncation.
  - Prevented "+N more" indicator in calendar day cells from overflowing narrow mobile cells (`+{N}<span className="hidden min-[480px]:inline"> more</span>`).
  - Responsive weekday header padding and tracking.
- `src/components/kanban/column.tsx`
  - Enlarged touch targets for column header buttons (settings & collapse) from `h-6 w-6` (24px) to `h-7 w-7 sm:h-6 sm:w-6`.
  - Responsive padding and heights on quick add and add card action buttons.
- `src/components/diary/diary-list-panel.tsx`
  - Replaced aggressive text truncation in hero description with `line-clamp-2 sm:line-clamp-none`.
  - Responsive metric pill gaps and action button clusters.
- `src/app/(dashboard)/project/[id]/members/page.tsx`
  - Responsive padding (`px-4 py-3.5 sm:px-5 sm:py-4`, `p-3.5 sm:p-5`).
- `src/app/(dashboard)/project/[id]/settings/page.tsx`
  - Responsive padding (`px-4 py-3.5 sm:px-5 sm:py-4`, `p-3.5 sm:p-5`).
- `src/components/hub/fab-hub.tsx`
  - Scaled FAB button for mobile: `h-12 w-12 sm:h-14 sm:w-14`.
  - Constrained `PinnedDisplayPanel` to `max-h-[75dvh]` with scrollable body to prevent viewport overflow.

## Important Behavior Changes
- Mobile modals now open as bottom sheets (sliding up from the bottom with top rounded corners) rather than cramped floating centered boxes.
- Mobile users on the Projects Dashboard see their workspaces and boards immediately rather than having to scroll through the entire Agenda and Deadlines panel first.
- Notes Studio on mobile provides instant one-tap horizontal pill filters instead of a towering vertical shelves panel.
- Small screens no longer suffer horizontal overflow in board headers, story point pickers, calendar cells, or sub-nav tabs.

## Database/Schema Changes
- None.

## Verification Commands Run & Results
- `npm run lint` — Passed with 0 errors/warnings.
- `npm test` — 61 test files passed, 279 tests passed.
- `npx prisma validate` — Valid schema.
- `npm run build` — Successful production build (all 35 routes compiled & optimized).

## Follow-ups / Deployment Notes
- Ready for production deployment.
