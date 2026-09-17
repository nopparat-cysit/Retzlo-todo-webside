# 2026-09-17 — Board Sync Lag Fix & Cache Busting

## Objective
Eliminate drag-and-drop lag caused by background sync interrupting active pointer events, and fix stale cached data causing live sync to appear slow or non-updating.

## Files Created
- `src/lib/kanban/column-equality.ts` — Deep equality check for `ColumnWithCards[]` to skip unnecessary React state updates during background board sync.
- `src/lib/kanban/column-equality.test.ts` — 6 unit tests for the equality logic.

## Files Modified

### API Routes — Force-dynamic + no-cache headers
All GET handlers updated with `export const dynamic = "force-dynamic"; export const revalidate = 0;` and `Cache-Control: no-store, no-cache, must-revalidate` headers on responses.
- `src/app/api/boards/[boardId]/route.ts`
- `src/app/api/projects/[id]/cards/route.ts`
- `src/app/api/projects/[id]/notes/route.ts`
- `src/app/api/projects/[id]/diary-items/route.ts`
- `src/app/api/notifications/route.ts`

### `src/components/kanban/board.tsx` — Major refactor
- Added `mutationLockUntilRef` (blocks sync for 1.5-2s after any write operation)
- Added `isPointerInteractingRef` (blocks sync while pointer is pressed down during drag)
- All write functions set mutation lock on success
- `refreshBoard` uses `cache: "no-store"` fetch and skips setState if data unchanged (areColumnsEqual)
- Polling interval: 4000ms to 2500ms
- Root div captures pointer events to track drag state

### Notes, Calendar, Diary, Notifications components
- All refresh fetches now use `cache: "no-store"` + `Cache-Control: no-cache`
- Polling intervals reduced: notes/diary/calendar 5000ms to 3000ms, notifications 15000ms to 8000ms
- Removed broken `areNotesEqual` reference in `board-notes-rail.tsx`

## Behavior Changes
- Drag operations no longer fight background sync (blocked during pointer-down and 1.5-2s after mutations)
- All sync fetches bypass Next.js edge cache
- Board state updates skip re-renders when data is unchanged
- Faster sync across all panels

## Database / Schema Changes
None.

## Verification
- `npm run lint` — PASS: No ESLint warnings or errors
- `npm run build` — PASS: Exit code 0, all 30 pages generated

## Known Follow-ups
- Polling could be made adaptive (back-off when tab is backgrounded) in a future session
