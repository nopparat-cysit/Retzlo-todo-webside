# 2026-10-01 — Kanban cross-account drag latency

## Objective
Make card moves notify other connected accounts reliably without waiting for the board polling interval.

## Files changed
- `src/app/api/cards/reorder/route.ts`
- `docs/agent-notes/2026-10-01-kanban-realtime-drag-latency.md`

## Behavior
- The card reorder endpoint now waits for the Pusher event attempt after the database transaction commits. This avoids returning from the route while the realtime publish is still pending.
- Polling remains as the fallback when Pusher is unavailable.

## Database/schema
No changes.

## Verification
- `npm run lint` — passed with no warnings or errors.
- `npx prisma validate` — passed; schema is valid.
- `npm run build` — passed; Next.js compiled and generated all 35 static pages.

## Follow-ups
- Verify Pusher environment variables are set in the deployed environment and confirm cross-account delivery after deployment.
