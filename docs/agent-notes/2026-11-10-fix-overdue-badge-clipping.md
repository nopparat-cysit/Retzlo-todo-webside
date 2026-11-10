# Work Note: Fix Overdue Count Badge Clipping in Collapsible Board Tools

- **Date:** 2026-11-10
- **Objective:** Fix the horizontal clipping of the red overdue task count badge (`overdueCards`) on the Kanban board header when the tools panel is expanded.

## Files Created, Modified, or Moved

- `src/components/kanban/board.tsx` (modified):
  - Moved top padding from the outer grid collapse wrapper (`pt-2.5`) into the inner container (`pt-3 pr-2.5 pb-0.5`).
  - Provides 12px of headroom inside `overflow-hidden`, preventing the elevated overdue count badge (`-top-1.5 -right-1.5 z-10`, -6px) from being truncated or sliced horizontally by `overflow-hidden`.
- `src/components/kanban/board-switch-skeleton.test.ts` (modified):
  - Added regression test asserting that the inner collapsible tools panel maintains proper headroom (`overflow-hidden min-h-0 pt-3 pr-2.5`) so elevated badges remain fully visible.
- `docs/theme-system.md` (modified):
  - Appended dated entry documenting the layout headroom and badge overflow preservation.

## Important Behavior Changes

- The red circle badge indicating the overdue task count (e.g. `1`, `2`) on the Overdue filter clock button now renders completely rounded with its full white number and separation ring, with zero top clipping.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npx vitest run src/components/kanban/`: Passed (142/142 tests across 18 test files).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `cmd.exe /c "npm run build"`: Passed (Next.js production build succeeded, 43/43 routes).

## Known Follow-ups, Blockers, or Deployment Notes

- None. Ready for production deployment.
