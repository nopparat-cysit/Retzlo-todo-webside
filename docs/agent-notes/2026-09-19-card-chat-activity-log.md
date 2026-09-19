# Work Session: Real-time Task Chat & Activity Timeline in Cards (with "My Tasks" Quick Filter)

- **Date:** 2026-09-19
- **Objective:** Implement real-time task discussions (chat bubbles) and automated activity logging inside Kanban card modals, with optimistic UI, cross-tab live synchronization, delete confirmation, and a one-click "My Tasks" filter on the Kanban toolbar.

## Files Created, Modified, Deleted, or Moved

- **Created:**
  - `src/app/api/cards/[cardId]/comments/route.ts` - `GET` and `POST` API routes for task comments with board privacy and project membership authorization checks.
  - `src/app/api/cards/[cardId]/comments/[commentId]/route.ts` - `DELETE` API route for comments with author or project owner authorization checks.
  - `src/components/kanban/card-chat-timeline.tsx` - Real-time task discussion and activity timeline with `useLiveSync`, optimistic UI, chat bubbles, system activity event pills, auto-scroll, filter pills (`All`, `Chat`, `Activity`), and `ConfirmModal` for deletion.
  - `src/lib/card-comments.test.ts` - Unit tests for comment payload validation, board privacy authorization, and comment deletion permissions.
- **Modified:**
  - `prisma/schema.prisma` - Added `CardComment` model and relations to `Card` and `User`.
  - `src/types/kanban.ts` - Added `CardCommentAuthor` and `CardCommentItem` interface definitions.
  - `src/app/api/cards/route.ts` - Automatically records system activity comments (`type: "SYSTEM"`) when status or priority changes in card updates.
  - `src/app/api/cards/reorder/route.ts` - Automatically records system activity comments when a card is moved to a new column.
  - `src/components/kanban/card-modal.tsx` - Mounted `CardChatTimeline` inside the left column below the checklist in edit mode, using current session user ID.
  - `src/components/kanban/board.tsx` - Added one-click "My Tasks" quick filter button to Kanban toolbar with active state styling.

## Important Behavior Changes

1. **Real-time Task Chat in Cards:**
   - In edit mode, cards now feature a "Discussion & Activity" timeline below the checklist.
   - Comments from the current user appear as dusk-lavender chat bubbles on the right; teammate comments appear on the left with avatar, name, and relative timestamp.
   - Sending a comment utilizes optimistic UI (instant feedback) and commits in background.
   - `useLiveSync` + `BroadcastChannel` ensures cross-tab and cross-device updates sync without page reloads.
2. **Automated System Activity Stream:**
   - Card column moves (drag and drop) and card status/priority updates generate system activity pills (e.g. `⚡ Nopparat moved card to Done • Today 15:30`).
   - Timeline includes filter pills (`All`, `Chat`, `Activity`) for focused reading.
3. **Delete Verification & Notifications:**
   - Users can delete their own comments (or project owners can delete any comment).
   - Deletion triggers a `ConfirmModal` before proceeding, followed by success/error toast notifications.
4. **"My Tasks" One-click Filter:**
   - Kanban toolbar includes a dedicated "My Tasks" button beside "Today", allowing team members to filter down to cards assigned directly to them.

## Database & Schema Changes

- Added `model CardComment` to `prisma/schema.prisma`:
  - `id`: CUID/UUID
  - `cardId`: Relation to `Card` (Cascade delete)
  - `authorId`: Relation to `User` (Cascade delete)
  - `content`: String
  - `type`: String (`"COMMENT"` | `"SYSTEM"`, default `"COMMENT"`)
  - `metadata`: JSON nullable (for structured event metadata e.g. `{ action: "COLUMN_MOVE" }`)
  - `createdAt`, `updatedAt`: DateTime
  - Indices on `[cardId, createdAt]` and `[authorId]`.
- Synchronized with PostgreSQL database via `npx prisma db push`.

## Verification Commands Run and Results

- `npx prisma validate`: Schema is valid (exited 0).
- `npx prisma db push`: Neon PostgreSQL database in sync (exited 0).
- `npm test`: 58 test files passed (262 tests passed, exited 0).
- `npm run lint`: 0 errors, 0 warnings (exited 0).
- `npm run build`: All 30/30 routes compiled successfully (exited 0).

## Known Follow-ups, Blockers, or Deployment Notes

- None. Feature is self-contained and adheres to retro lofi indigo styling and AGENTS.md guidelines.
