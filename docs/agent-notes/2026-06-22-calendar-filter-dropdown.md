# 2026-06-22 Calendar Filter Dropdown

## Objective

Move the project calendar filters out of the left sidebar and into a compact dropdown near the calendar date/view controls.

## Files changed

- Modified `src/components/kanban/project-calendar.tsx`
- Created `docs/agent-notes/2026-06-22-calendar-filter-dropdown.md`

## Behavior changes

- Removed the dedicated calendar filter sidebar column so the calendar uses the available page width more cleanly.
- Added a `Filter` button beside the calendar controls.
- Added a dark dropdown panel with source filters, card status filters, note scope, time scope, `Reset`, and `Apply`.
- Added a small active-filter count badge on the `Filter` button.

## Database/schema changes

- None.

## Verification

- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` timed out after about 184 seconds with no captured output. This is not counted as a passing build.
- Checked running Todo `node.exe` processes, stopped the local dev server processes, and reran verification.
- `npm run build` passed after stopping the local dev server processes.
- Restarted the dev server and confirmed `http://localhost:3000` returns `200 OK`.

## Follow-ups

- Visual browser verification was not completed because the in-app browser did not expose an active tab during this check.
