# Work Note: 2026-10-04 — Remove Boards Hub / All Workspaces Toggle from Projects Dashboard Header

## Objective
Remove the `[Boards Hub] [All Workspaces]` view mode toggle pill group from the Projects Dashboard header as requested by the user with the screenshot in `media_1791090983171.png` ("เอาส่วนนี้ออก").

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/project/projects-dashboard.tsx`: Removed the segmented button group (`Boards Hub` / `All Workspaces`) from the top-right header area, leaving a clean primary action button (`New Board` / `New Project`).
  - `docs/theme-system.md`: Updated changelog.

## Important Behavior Changes
- The top header of the Projects Dashboard (`/projects`) is simplified and less cluttered. The `Boards Hub` vs `All Workspaces` segmented toggle has been removed.
- Users can focus directly on their active workspace boards and actions, while workspace switching remains accessible through the workspace switcher dropdown in the title.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/project/`: Passed (2/2 test files, 13/13 tests).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded with exit code 0).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
