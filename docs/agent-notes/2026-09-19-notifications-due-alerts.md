# Work Session: Notifications Center & Due Date Alerts

- **Date:** 2026-09-19
- **Objective:** Connect Card Chat comments, card assignments, and approaching/overdue task deadlines to the Notifications Center, with interactive click-to-card navigation on the Kanban board.

## Files Created, Modified, Deleted, or Moved

- **Created:**
  - `src/lib/notifications.test.ts` - Unit tests for due date alert formatting, comment notification snippet truncation, board deep linking, and recipient filtering.
- **Modified:**
  - `prisma/schema.prisma` - Added `cardId` and `link` fields (plus index on `cardId`) to `model Notification`.
  - `src/app/api/cards/[cardId]/comments/route.ts` - Automatically creates notifications for all card assignees (excluding the commenter) when a new message is posted.
  - `src/app/api/notifications/route.ts` - Added automated real-time checking for overdue tasks and tasks due within 24 hours assigned to the user, generating `DUE_DATE_ALERT` notifications.
  - `src/components/notifications/notifications-popover.tsx` - Updated to render specific icons (`CARD_COMMENT`, `DUE_DATE_ALERT`), display direct action buttons ("👉 ไปที่การ์ดงาน"), and navigate using `next/navigation`.
  - `src/components/kanban/board.tsx` - Added `?cardId=xxx` URL query parameter support with automatic card lookup and `CardModal` modal pop-up on page load.

## Important Behavior Changes

1. **Card Chat Notifications:**
   - Whenever a team member posts a message in Card Chat, all other assignees of that card receive an instant notification in their topbar bell with the message snippet and a link directly to the card.
2. **Automated Due Date Alerts:**
   - Active tasks assigned to the user with a due date within 24 hours or overdue generate dedicated warning notifications with a direct link to open the task.
3. **Interactive Navigation:**
   - Clicking on a task notification marks it as read, closes the popover, and navigates straight to `/project/[id]/board?cardId=[cardId]`.
   - The Kanban board reads the `cardId` from query parameters and pops up the card details modal automatically.

## Database & Schema Changes

- Added `cardId String?` and `link String?` to `model Notification` with index `@@index([cardId])`.
- Pushed to Neon PostgreSQL via `npx prisma db push`.

## Verification Commands Run and Results

- `npx prisma validate`: Schema is valid (exited 0).
- `npx prisma db push`: Neon PostgreSQL database in sync (exited 0).
- `npm test`: 59 test files passed / 266 tests passed (exited 0).
- `npm run lint`: 0 errors, 0 warnings (exited 0).
- `npm run build`: 30/30 pages compiled successfully (exited 0).
