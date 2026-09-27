# 2026-09-27: Harden Board Filter Persistence

## Objective
Harden filter persistence for Kanban boards so saved filters (`My Tasks` / `assigneeFilter`, `Today`, `cardSort`) reliably persist across sessions and page reloads without race-condition overwrites.

## Files Created / Modified
- `src/components/kanban/board.tsx` [MODIFIED]:
  - Introduced `lastSavedFiltersRef` to avoid saving duplicate or stale filter payloads.
  - Delayed `isFilterRestoredRef.current = true` until after React commits the restored filter state to prevent mount-time overwrites of saved filters with initial defaults.

## Important Behavior Changes
- Kanban filters now remain firmly remembered per user and board across refreshes, navigation, and board switching without risk of resetting to default "ALL".

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run`: Passed (67 test files, 326 tests passed).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npm run build`: Passed (Next.js production build succeeded).
- `npx prisma validate`: Passed (schema valid).

## Known Follow-ups / Blockers
- None.
