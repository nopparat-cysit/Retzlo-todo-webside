# Work Note: Fix Multi-Account Real-Time Card Sync

- **Date**: 2026-10-09
- **Objective**: Fix real-time board & card synchronization between multiple accounts/screens on the Kanban board.

## Root Causes Identified
1. **Pusher Subscription Thrashing in `useLiveSync`**: In `useLiveSync`, `channelKey` passed as an array literal (e.g. `[`board:${board.id}`, `project:${board.projectId}`]`) resulted in a new array reference on every single component render. This caused `useEffect` to unsubscribe and unbind from Pusher continuously on every re-render, dropping incoming WebSocket sync messages.
2. **AI Chat Widget Blocking `canSync`**: In `board.tsx`, `canSync` checked `document.querySelector("[role='dialog']")`. When the AI Chat Assistant panel was open (or rendered in DOM), this check returned `true`, completely halting live synchronization and polling updates on the board.
3. **Pusher Transport Restrictions**: `src/lib/pusher/client.ts` had restricted `enabledTransports: ["ws", "wss"]`, disabling Pusher's automatic SockJS/HTTP streaming fallback if WebSockets had firewall, proxy, or connection delays.
4. **Missing Board Channel & Unawaited Events on Server**: `src/app/api/cards/route.ts` (POST, PATCH, DELETE) only triggered the project channel without the board channel, and `triggerPusherEvent` was not awaited, causing premature serverless function exit before events were delivered.
5. **Slow Fallback Polling**: `board.tsx` had an 8000ms polling interval; reduced to 3000ms with timestamp cache-busting to ensure near-instant updates even if WebSocket connection drops.

## Files Modified
- `src/hooks/use-live-sync.ts`: Stabilized subscription keys using serialized `keysKey` to prevent resubscription churn; added connection state listener (`pusher.connection.bind("connected", triggerSync)`).
- `src/lib/pusher/client.ts`: Removed `enabledTransports: ["ws", "wss"]` restriction to enable resilient fallback transports.
- `src/components/ai/ai-chat-widget.tsx`: Added `data-ai-chat="true"` on the root container.
- `src/components/kanban/board.tsx`: Exempted AI chat from `canSync` blocking, reduced polling interval from 8s to 3s, and added `?_t=${Date.now()}` cache-busting to `refreshBoard`.
- `src/app/api/cards/route.ts`: Awaited `triggerPusherEvent` and included target board channel in POST, PATCH, and DELETE.
- `src/app/api/columns/route.ts`: Awaited `triggerPusherEvent`.
- `src/app/api/columns/[columnId]/route.ts`: Awaited `triggerPusherEvent`.
- `src/app/api/columns/reorder/route.ts`: Awaited `triggerPusherEvent`.
- `src/app/api/boards/[boardId]/route.ts`: Awaited `triggerPusherEvent`.

## Behavior Changes
- Moving, creating, updating, or deleting a card on Account A now updates Account B's screen in real time via Pusher WebSocket.
- If WebSocket is temporarily offline, the 3-second polling interval and window focus listeners ensure immediate synchronization without page refresh.
- Having the AI chat open no longer suppresses live card updates on the board.

## Verification
- `npm test`: 91/91 test files passed (477 passed, 3 skipped).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Checked in task-3024.
