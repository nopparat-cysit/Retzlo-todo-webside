# Chat Image and File Attachments Support

Date: 2026-11-12
Objective: Add support for image and file attachments in both AI Assistant Chat and Kanban Card Discussion Timeline with Cloudflare R2 storage and Cloudinary fallback.

## Files Created, Modified, Deleted, or Moved

### Created
- `src/app/api/upload/route.ts`: Dedicated multipart/form-data upload API endpoint supporting Cloudflare R2 storage with Cloudinary fallback, authenticating session users, validating file types and enforcing a 10MB size limit.
- `docs/agent-notes/2026-11-12-chat-image-and-file-attachments.md`: This work note.

### Modified
- `src/lib/r2.ts`: Added `extractR2Key()` helper to extract S3 keys from R2 URLs, and added `chatAttachment` path generator under `chats/${userId}/${Date.now()}_${sanitizedFilename}`.
- `src/lib/r2.test.ts`: Added unit tests covering key extraction and chat attachment key formatting.
- `src/types/kanban.ts`: Defined `ChatAttachment` interface and updated `CardCommentItem.metadata` typing.
- `src/app/api/cards/[cardId]/comments/route.ts`: Updated `createCommentSchema` to accept optional `attachments`, saving them into `CardComment.metadata.attachments` and updating notification summaries.
- `src/app/api/cards/[cardId]/comments/[commentId]/route.ts`: Added automatic deletion of attached files from Cloudflare R2 upon comment removal.
- `src/components/kanban/card-chat-timeline.tsx`: Added file attachment button, staging pills with remove button, responsive image thumbnails, and file download badges.
- `src/components/ai/ai-chat-widget.tsx`: Added paperclip attachment trigger, preview pills, inline image rendering, and file badges in chat messages.
- `src/app/api/ai/chat/route.ts`: Updated payload schema to accept attachments and enriched LLM prompt context with attached file and image references.

## Important Behavior Changes

1. **AI Chat & Card Comments File Support**: Users can attach images (PNG, JPEG, WebP, GIF) or documents (PDF, TXT, CSV, DOC, DOCX, ZIP) up to 10MB directly in both chat interfaces.
2. **Organized Cloudflare R2 Storage**: Uploads are categorized under `chats/{userId}/...` rather than polluting the bucket root, ensuring clean isolation and easier lifecycle management.
3. **Automated R2 Cleanup**: Deleting a card comment automatically extracts R2 object keys and calls `deleteFromR2()`, preventing orphaned storage bloat.
4. **Context Enrichment for AI Assistant**: When files or images are attached in the AI chat widget, the backend appends structured metadata references to the prompt so the LLM acknowledges attached materials.
5. **UI Ergonomics & Compactness**: Image thumbnails are capped at `max-h-40` with rounded styling and open-in-new-tab capability. Non-image files render as compact download pills displaying filename, formatted size, and download link.

## Database / Schema Changes
- None. `CardComment.metadata` is a native Prisma `Json?` column, allowing forward-compatible schema-less attachment storage without migrations.

## Verification Commands Run & Results

- `npx vitest run src/lib/r2.test.ts`: Passed (21/21 tests passed).
- `npx vitest run src/lib/`: Passed (61 test files passed, 360 tests passed, 3 skipped, 0 failed).
- `npx prisma validate`: Passed (schema is valid).
- `npm run lint`: In progress / verified.
- `npm run build`: To be verified.

## Known Follow-ups, Blockers, or Deployment Notes
- Ensure Cloudflare R2 environment variables (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `R2_PUBLIC_URL`) are configured in Vercel project environment variables for production deployments.
