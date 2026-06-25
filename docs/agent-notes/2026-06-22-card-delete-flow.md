# 2026-06-22 Card Delete Flow

## Objective

Inspect and harden card deletion so deleting cards behaves normally across the board and calendar.

## Files changed

- Modified `src/app/api/cards/route.ts`
- Modified `src/components/kanban/card.tsx`
- Modified `src/components/kanban/project-calendar.tsx`
- Modified `src/components/ui/confirm-modal.tsx`
- Created `docs/agent-notes/2026-06-22-card-delete-flow.md`

## Behavior changes

- `DELETE /api/cards` now validates `cardId` as a UUID and returns `422` for invalid ids instead of falling through to database handling.
- Board card delete now prevents duplicate delete submits while the request is running.
- Board card delete now shows success and error toasts.
- Calendar card delete now shows an inline sync error if the API delete fails.
- Confirm modal cannot be closed while a destructive confirmation action is loading.

## Shared design-system impact

- Updated shared `ConfirmModal` z-index from `z-[300]` to `z-[1000]`.
- Impact: project delete confirmations, project cover/reset confirmations, and card delete confirmations will render above project topbars and other modal surfaces.

## Database/schema changes

- None.

## Verification

- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` passed.
- After build, the existing dev server returned a Next dev cache `500`; restarted only the Todo dev server processes.
- Confirmed `http://localhost:3000` returns `200 OK` after restarting the dev server.

## Follow-ups

- Verify delete flow in the browser after logging in and opening a board with cards.
