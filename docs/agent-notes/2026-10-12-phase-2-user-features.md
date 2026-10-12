# Work Note: 2026-10-12 — Phase 2 Kanban Workflow Enhancements (Archive, Activity Trail, Attachments)

## Objective
Implement Phase 2 of the platform enhancement roadmap:
1. **Card Archive & 30-Day Trash Bin**: Soft-delete Kanban cards, preserve in board archive, search and restore or permanently delete.
2. **Board Activity Log & Audit Trail**: Real-time auditing of card creation, movements, updates, archives, restorations, deletions, and attachments with a slide-over timeline drawer synced via Pusher WebSockets.
3. **Card Attachments**: Direct upload of file attachments (images, PDFs, documents) via Cloudinary or web links with thumbnails, preview links, and badge counters on Kanban cards.

## Files Created, Modified, Deleted, or Moved

### Created
- `src/components/kanban/archived-cards-modal.tsx`: Modal to view, search, restore, and permanently delete archived cards.
- `src/components/kanban/board-activity-drawer.tsx`: Real-time audit log drawer with Pusher WebSockets live subscription.
- `src/components/kanban/card-attachments-section.tsx`: Attachments management UI with file upload, web link input, image previews, and deletion confirmation.
- `src/lib/kanban/activity-logger.ts`: Helper to persist board activities and broadcast Pusher sync events.
- `src/lib/kanban/phase-2-features.test.ts`: Automated unit test suite for card archive and attachment serialization.
- `src/app/api/boards/[boardId]/activities/route.ts`: API endpoint for fetching board activity trail.
- `src/app/api/boards/[boardId]/archived/route.ts`: API endpoint for fetching archived cards for a board.
- `src/app/api/cards/[cardId]/archive/route.ts`: API endpoint to archive a card and broadcast update.
- `src/app/api/cards/[cardId]/restore/route.ts`: API endpoint to restore an archived card to active board.
- `src/app/api/cards/[cardId]/attachments/route.ts`: API endpoint to upload or link an attachment.
- `src/app/api/cards/[cardId]/attachments/[attachmentId]/route.ts`: API endpoint to remove an attachment.

### Modified
- `prisma/schema.prisma`: Added `isArchived`, `archivedAt`, `attachments` relation to `Card`, and models `BoardActivity`, `CardAttachment`.
- `src/types/kanban.ts`: Added `CardAttachmentItem`, `BoardActivityItem`, and updated `Card` interface.
- `src/lib/kanban/serialize-card.ts`: Updated serialization to format `isArchived`, `archivedAt`, and `attachments`.
- `src/app/api/boards/[boardId]/route.ts`: Filter active columns with `{ where: { isArchived: false } }` and include `attachments`.
- `src/app/api/cards/route.ts`: Integrated activity logging on `POST`, `PATCH`, and `DELETE`.
- `src/app/api/cards/reorder/route.ts`: Integrated activity logging (`CARD_MOVED`) when moving cards across columns.
- `src/components/kanban/card-modal.tsx`: Added `CardAttachmentsSection` and Archive button.
- `src/components/kanban/card.tsx`: Added `Paperclip` attachment badge counter.
- `src/components/kanban/board.tsx`: Added Activity Log and Archive buttons in toolbar, wired up `ArchivedCardsModal`, `BoardActivityDrawer`, and `cardToArchive` `ConfirmModal`.
- `src/components/help/help-center-client.tsx`: Updated English & Thai documentation for Kanban features.
- `src/components/project/user-profile-popover.tsx`: Removed direct `useSession` hook which caused client runtime crashes without `<SessionProvider>`, and switched to explicit `isAdmin` prop passed down from server layouts.
- `src/components/project/project-shell.tsx`: Extracted `isGlobalAdmin` from server session and passed as `isAdmin` prop to `UserProfilePopover`.
- `src/components/project/projects-dashboard.tsx`: Passed `isAdmin` prop to `UserProfilePopover`.
- `src/app/(dashboard)/project/[id]/board/page.tsx`: Filtered `isArchived: false` in server query, included attachments, and mapped cards with `serializeCard` to avoid date serialization issues.

## Database & Schema Changes
- `Card`: Added `isArchived Boolean @default(false)`, `archivedAt DateTime?`, `attachments CardAttachment[]`, index `@@index([columnId, isArchived])`.
- `BoardActivity`: Model created (`id`, `boardId`, `userId`, `cardId`, `action`, `details`, `createdAt`, relations to `Board` and `User`).
- `CardAttachment`: Model created (`id`, `cardId`, `userId`, `name`, `url`, `size`, `fileType`, `createdAt`, relations to `Card` and `User`).
- Neon PostgreSQL synchronized with `npx prisma db push --skip-generate` and `npx prisma generate`.

## Behavior Changes
- Cards can be archived rather than destructively deleted right away.
- Active Kanban boards and calendar views hide archived cards while preserving task history.
- Every important board action (create, move, edit, archive, restore, delete, attach) is logged to the board's immutable audit trail and pushed live to connected users via Pusher.
- Users can attach files (images, documents, PDFs) or web URLs to cards. Cards with attachments display a paperclip badge with the total attachment count.
- All destructive operations (permanent deletion, removing attachments) enforce `ConfirmModal` intent confirmation.
- All CUD operations trigger immediate toast feedback.
- Fixed "Unable to load dashboard" error boundary trigger caused by `useSession` invocation in `UserProfilePopover`.

## Verification Commands & Results
- `npx prisma validate`: Passed (The schema at prisma\schema.prisma is valid 🚀)
- `npx tsc --noEmit`: Passed (0 errors)
- `npm run lint`: Passed (0 errors, 0 warnings)
- `npx vitest run`: Passed (94 test files, 495 tests passed)
- `npm run build`: Passed (Generated all 40 static & dynamic routes successfully)

## Follow-ups & Deployment Notes
- Neon DB schema was pushed and validated.
- Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are active. If not configured in any local clone, web links are still supported seamlessly.

- Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are active. If not configured in any local clone, web links are still supported seamlessly.
