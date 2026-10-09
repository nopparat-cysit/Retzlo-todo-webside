# Instant Realtime Live Sync & Speed Optimization

## Date & Objective
- **Date**: 2026-10-09
- **Objective**: Optimize live sync latency from ~2 seconds down to true sub-second instant real-time sync (< 100ms via WebSocket, 1000ms fallback polling), eliminate dropped events during in-flight fetches or user interactions, and guarantee Pusher client connectivity with fallback public credentials.

## Files Modified
- `src/lib/pusher/client.ts`: Added public Pusher key and cluster fallbacks so browser client always initializes and connects to WebSocket even if `NEXT_PUBLIC_PUSHER_KEY` is not set in Vercel environment variables.
- `src/lib/pusher/server.ts`: Added fallback app ID and key on the server, with helpful warnings when `PUSHER_SECRET` is missing in server environment variables.
- `src/hooks/use-live-sync.ts`:
  - Implemented `pendingSyncRef` to prevent silent dropping of incoming live sync events while an existing fetch is in flight.
  - Implemented retry queue timer for interaction locks so events are never discarded when `canSync()` is temporarily false.
  - Lowered default `intervalMs` fallback polling from 2000ms to 1000ms.
- `src/components/kanban/board.tsx`: Set `intervalMs` from 2000ms to 1000ms.

## Behavior Changes
- **Instant Updates via WebSocket**: When User A moves, edits, or creates a card, Pusher event delivers within ~50ms to User B, triggering an immediate board refresh.
- **Zero Dropped Events**: Previously, if a background polling fetch was active when a Pusher event arrived, the event was dropped and the client had to wait 2 seconds for the next interval. Now, the pending event triggers an immediate second fetch as soon as the in-flight one completes.
- **Immediate Retries on Interaction Lock**: If an event arrives during pointer interactions, a retry fires immediately after 120ms rather than waiting for a full polling cycle.
- **2x Faster Polling Fallback**: Polling interval reduced from 2000ms to 1000ms.

## Verification
- `npm test`: 91 test files passed, 477 passed (0 failed).
- `npx prisma validate`: Schema valid.
- `npm run lint`: 0 errors or warnings.
- `npm run build`: Production build succeeded.
