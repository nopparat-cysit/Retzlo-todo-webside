# 2026-09-10 Project Calendar Redesign & UI Polish

## Objective
Redesign the Project Calendar page (`/project/[id]/calendar`) to be full-width, clean, responsive, and visually consistent with the retro lofi indigo design direction. Resolve the 3-column squeeze by converting the Filters panel into a collapsible top bar and the Upcoming items into a slide-over/collapsible drawer. Replace clunky multi-line cell buttons with sleek single-line event pills with status dots and clean truncation.

## Changed Files
- `src/components/kanban/project-calendar.tsx`
- `docs/agent-notes/2026-09-10-project-calendar-redesign.md`

## Behavior & Improvements
- **Collapsible Drawers (No More 3-Column Squeeze)**:
  - Eliminated the static 3-column squeeze (`filters` | `calendar` | `upcoming`). The calendar now takes full viewport width by default.
  - Added a collapsible Filters drawer toggleable from the top toolbar, with an active filter count badge.
  - Added a collapsible Upcoming panel drawer toggleable from the top toolbar, complete with item count badge and a dedicated close button.
- **Sleek Event Pills**:
  - Replaced multi-line block buttons with streamlined single-line event pills:
    - `CalendarCardPill`: Displays color dot, due/start time, priority badge, and card title with clean truncation and title tooltip.
    - `CalendarDiarySummaryPill`: Shows diary icon, completed/total count badge, and clean status styling (with red urgent accent if any item is overdue or near-due).
    - `CalendarNotePill`: Compact note indicator with note icon and title.
- **Improved Day Cells**:
  - Rebuilt the calendar grid using `gap-px bg-white/10` borders for clean, crisp division without chunky borders.
  - Replaced full-cell background wash on "Today" with an amber circular date badge (`w-7 h-7 rounded-full bg-amber-400 text-ink-950 font-bold`).
  - Replaced the dotted underline `"all"` text with a modern, compact `+N more` badge.
  - Styled out-of-month days with subtle opacity and dimmed numbers to maintain visual focus on current month.
- **Navigation & Controls**:
  - Consolidated navigation into a unified retro toolbar: `[<] [Today] [>]`, Month Year label, date range indicator badge, segmented Month/Week controls, and quick action buttons.
  - Replaced native date pickers with cohesive theme buttons.
- **Functional Integrity Preserved**:
  - Maintained all existing modal IDs and contracts (`CardModal`, `DayModal`, `NoteModal`, `ConfirmModal`).
  - Preserved test compatibility in `calendar-modals.test.ts` and `view.test.ts`.

## Database / Schema Changes
- None.

## Verification
- `npx vitest run src/components/kanban/calendar-modals.test.ts src/lib/calendar/view.test.ts`: Passed (9/9 tests).
- `npx vitest run`: Passed (42/42 test files, 140/140 tests).
- `npx prisma validate`: Passed.
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Passed (Next.js 14.2.35 production build completed with code 0).

## Follow-ups & Notes
- All changes adhere strictly to the retro lofi indigo theme and existing modal/toast conventions.
