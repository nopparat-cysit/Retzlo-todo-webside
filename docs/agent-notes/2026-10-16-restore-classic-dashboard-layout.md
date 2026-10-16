# Agent Note: Restore Classic Unified Dashboard Layout

- **Date:** 2026-10-16
- **Objective:** Revert the experimental standalone full-width company directory hub and restore the classic, unified 3-column Retro Lofi dashboard layout ("แบบเดิม") per user preference.

## Files Created, Modified, Deleted, or Moved

- `src/components/project/projects-dashboard.tsx`:
  - Restored classic 3-column / 2-column layout (Left Rail: Brand, tools, Active Project selector, Arcade Store shortcut, Agenda & Deadlines; Center: Active Project Hero, Boards switcher / All Workspaces switcher, Grid/List boards view; Right Rail: Studio Pulse on 2xl).
  - Maintained all contracts for modal settings, board creation, board deletion confirmations, and optimistic UI updates.
- `src/app/(dashboard)/project/[id]/page.tsx`:
  - Restored classic direct redirect to `/project/${params.id}/board` (or `/diary` for diary workspaces).
- `src/app/(dashboard)/projects/page.tsx`:
  - Restored classic props passed to `ProjectsDashboard`.
- `docs/agent-notes/2026-10-16-restore-classic-dashboard-layout.md`: Created this note.

## Important Behavior Changes

- Restored the unified, all-in-one retro dashboard where users can see their active project's boards, switch to all workspaces, manage agendas, and browse deadlines without navigating through disjointed full-page screens.

## Database / Schema Changes

- None.

## Verification Commands Run & Results

- `npx tsc --noEmit`: Passed (0 errors).
- `npx vitest run`: Passed (100 test files passed, 533 tests passed, 3 skipped).
- `npm run lint`: Passed (No ESLint warnings or errors).
- `npm run build`: Passed (Next.js compiled successfully, all 42 routes generated).

## Follow-ups & Deployment Notes

- None. All tests and production build passing 100%.
