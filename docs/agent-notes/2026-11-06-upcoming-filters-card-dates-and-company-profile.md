# Work Note: Upcoming Filters, Card Date Rules, and Company Profile Modal

## Date & Objective
- **Date:** 2026-11-06
- **Objective:**
  1. Remove "Done" status and completed tasks from Agenda & Deadlines and the Upcoming panel.
  2. Enforce card date dependencies: allow setting only end time (Due Date), require end time if start time is set, allow no dates, and exclude date-less cards from Agenda & Deadlines and Upcoming.
  3. Clamp project sidebar description to 2 lines and add a "Show more" button opening a Company Profile popup modal.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/project/projects-dashboard.tsx`: Excluded `DONE` cards from `Agenda & Deadlines` and removed `Done` from the status filters grid.
  - `src/components/kanban/project-calendar.tsx`: Excluded `DONE` cards and completed checklist items from the `Upcoming` panel and badge counters.
  - `src/components/kanban/card-modal.tsx`: Reordered date fields (Due Date first), disabled Start Date when Due Date is absent, reset Start Date when Due Date is cleared, and added client-side validation against start date without due date or start date after due date.
  - `src/app/api/cards/route.ts`: Added Zod schema refinements requiring `dueDate` if `startDate` is provided and validating `startDate <= dueDate`.
  - `src/components/project/project-shell.tsx`: Integrated `CompanyProfileModal` for line-clamped description and popup modal.
- **Created:**
  - `src/components/project/company-profile-modal.tsx`: Interactive client component clamping description to 2 lines with a popup modal displaying formatted company profile and copy actions.
  - `src/components/kanban/card-dates-validation.test.ts`: Unit tests asserting API schema refinements and client-side date dependency validation.
  - `src/components/project/company-profile-modal.test.ts`: Unit tests for company profile text parsing and modal contracts.
  - `docs/agent-notes/2026-11-06-upcoming-filters-card-dates-and-company-profile.md`: This work note.

## Important Behavior Changes
- Tasks marked as `DONE` no longer appear under `Agenda & Deadlines` on `/projects` or in the `Upcoming` panel on `/project/[id]/calendar`.
- Users can create cards with no dates (which do not appear in Agenda/Upcoming), or with only a Due Date. If setting a Start Date, a Due Date is required.
- The project description in the left sidebar is clamped to 2 lines, preventing layout overflow, with a "แสดงเพิ่มเติม / Profile" button that opens an `AppModal` with formatted company details.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/kanban/card-dates-validation.test.ts src/components/project/company-profile-modal.test.ts`: Passed (15/15 tests).
- `npx vitest run`: Passed (110 test files, 603 passed, 3 skipped).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded with exit code 0).

## Known Follow-ups, Blockers, or Deployment Notes
- Ready for commit and push to `origin/main`.
