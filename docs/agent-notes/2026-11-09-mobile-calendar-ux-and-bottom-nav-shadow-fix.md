# 2026-11-09 - Mobile Calendar UX and Bottom Nav Shadow Fix

## Objective
Fix mobile layout issues: remove dark bottom navigation menu shadow across all themes, eliminate horizontal scrolling from the calendar header controls, provide an inline selected day task list directly on the mobile month view, and introduce an agenda schedule view mode.

## Files Created, Modified, Deleted, or Moved
- `src/components/project/project-mobile-bottom-nav.tsx`: Replaced upward dark gradient box shadow with `shadow-none` and clean neutral border styling across light and dark themes.
- `src/lib/calendar/view.ts`: Added `"list"` schedule view mode to `CalendarViewMode` and updated `buildCalendarDays` to handle list mode anchor calculation.
- `src/components/kanban/project-calendar.tsx`:
  - Extracted interactive item rendering into reusable `DayItemRow` helper component.
  - Restructured calendar header controls into 3 responsive non-overflowing rows with wrapping.
  - Added "Schedule" list mode to `SegmentedControl` view switcher.
  - Rendered full-width chronological agenda schedule view when `viewMode === "list"`.
  - Adjusted day cell heights on mobile (`min-h-[44px] md:min-h-[135px]`) with prominent active selection ring.
  - Added inline Selected Day Task List underneath the month grid on mobile screens (`< md`) showing real task cards, status checkboxes, and click-to-edit modal integration without requiring popup modals.
  - Preserved desktop 7-column grid layout and day overview modal for `md:` viewports.
- `src/components/kanban/board.tsx`: Updated focus mode badge copy and tooltips to satisfy test requirements and responsive viewports.
- `src/components/kanban/board-responsive.test.ts`: Added test cases for bottom nav shadow removal, non-overflowing calendar header rows, schedule view mode support, and mobile inline selected day task list.

## Important Behavior Changes
- Bottom mobile navigation bar no longer casts an unnatural dark shadow over page contents in light theme or dark theme.
- Calendar toolbar controls no longer overflow horizontally; search input, view switcher, and filter triggers wrap responsively across rows.
- Mobile month view defaults selection to current day and displays full task details (title, status, priority, column, tags, and action buttons) directly beneath the compact calendar grid.
- Users can switch to "Schedule" view mode for a vertical chronological stream of all upcoming dates with tasks.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/board-responsive.test.ts src/lib/calendar/view.test.ts src/components/project/project-shell.test.ts`: Passed (38/38 tests passing).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Passed (Next.js 14 production build compiled successfully).

## Known Follow-ups, Blockers, or Deployment Notes
- Ready for deployment.
