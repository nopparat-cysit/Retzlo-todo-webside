# Work Note: 2026-10-04 — Replace Static Project Dot with Workspaces/Company Hub Button

## Objective
Replace the static colored dot square in the project shell topbar (`media_1791091019500.png`) with an actionable icon button linking to the All Workspaces / Company Hub page (`/projects`), as requested by the user ("เปลี่ยนปุ่มนนี้ไป icon หน้ารวมบริษัทแทน").

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/project/project-shell.tsx`:
    - Imported `Building2` from `lucide-react`.
    - Replaced the static `div` containing `dotColor` with a clickable `<Link href="/projects" title="หน้ารวมบริษัท (Workspaces)" ...>` containing `<Building2 className="h-4 w-4" />`.
  - `docs/theme-system.md`: Updated changelog.

## Important Behavior Changes
- The topbar beside the workspace title now features an intuitive Company / Workspaces icon button (`Building2`) that takes users directly back to the workspaces directory (`/projects`).
- Features a hover tooltip "หน้ารวมบริษัท (Workspaces)" and matches existing retro lofi topbar button tokens.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/project/`: Passed (2/2 test files, 13/13 tests).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded with exit code 0).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
