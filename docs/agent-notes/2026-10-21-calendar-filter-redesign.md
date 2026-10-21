# Work Note: Calendar Filter UX/UI Redesign

- **Date**: 2026-10-21
- **Objective**: Redesign the Calendar Filter UX/UI into a non-disruptive Radix Popover with live keyword search, quick preset chips ("My Tasks", "Pending"), active filter badge chips with 1-click removal, and enhanced assignee/priority filtering.

## Files Created, Modified, Deleted, or Moved

- **Modified**:
  - `src/lib/calendar/view.ts`: Extended `CalendarFilterState`, `UnifiedCalendarItem`, `defaultCalendarFilters`, and `filterCalendarItems` with `searchQuery`, `priorities`, and `assigneeIds` support.
  - `src/lib/calendar/view.test.ts`: Added unit tests verifying keyword search, multi-assignee filtering, and priority filtering.
  - `src/components/kanban/project-calendar.tsx`:
    - Replaced the layout-shifting inline collapsible drawer with a floating Radix Popover (`Popover`, `PopoverTrigger`, `PopoverContent`).
    - Added integrated Search input with clear button directly on the calendar toolbar.
    - Added quick preset buttons for "My Tasks" and "Pending Only".
    - Added tactile toggle pills (`FilterPill`) for Sources, Statuses with colored dots, Priorities with colored dots, Assignees with member avatar chips, and Scopes.
    - Added active filter badge chips row below toolbar with 1-click dismissal (`✕`) and "Clear all" link.
    - Updated card mapping and initialization to properly normalize and supply `assigneeIds` and `priority`.
- **Created**:
  - `docs/agent-notes/2026-10-21-calendar-filter-redesign.md`: This work note.

## Important Behavior Changes

1. **Non-Disruptive Filtering**: Clicking "Filters" no longer causes layout shifts or pushes the calendar grid downward. The popover floats above the calendar and dismisses cleanly on click-outside.
2. **Instant Search**: Users can search titles and notes across cards, notes, and diary entries in real-time.
3. **Quick Presets**:
   - "My Tasks": Quickly filters cards assigned to the current logged-in user.
   - "Pending": Instantly hides completed tasks without opening filter settings.
4. **Active Filter Feedback**: Users can now see exactly which filters are active even when the popover is closed and can dismiss individual filters with one click.
5. **Team & Priority Filtering**: Calendar cards now respect member assignee selections and priority levels (Urgent, High, Medium, Low).

## Database/Schema Changes

- None (pure client-side & utility enhancement).

## Verification Commands Run & Results

- `vitest run src/lib/calendar/view.test.ts src/components/kanban/calendar-modals.test.ts`: PASSED (14 tests passed).
- `npx tsc --noEmit`: PASSED (0 errors).
- `npx prisma validate`: PASSED (schema is valid).
- `npm run lint`: PASSED (0 warnings or errors).
- `npm run build`: PASSED (production build succeeded, 42/42 static pages generated).

## Known Follow-ups, Blockers, or Deployment Notes

- None.
