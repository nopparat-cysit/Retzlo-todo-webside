# Cloudflare R2 Storage Integration & Structured Folder Hierarchy

Date: 2026-11-11
Author: Cloud Storage Integration Specialist
Status: Completed

## Summary
Integrated Cloudflare R2 object storage into Retzlo using `@aws-sdk/client-s3`. Established a standardized folder hierarchy (`R2_STORAGE_PATHS`) to ensure clean separation of user avatars, project covers, card attachments, diary media, note files, and report exports.

## Structured Object Storage Layout (`R2_STORAGE_PATHS`)
- User Avatars: `users/{userId}/avatar/avatar_{timestamp}.{ext}`
- Project Covers: `projects/{projectId}/covers/cover_{timestamp}.{ext}`
- Card Attachments: `projects/{projectId}/cards/{cardId}/attachments/{timestamp}_{sanitizedFilename}`
- Diary Media: `projects/{projectId}/diary/{diaryId}/media/{timestamp}_{sanitizedFilename}`
- Note Attachments: `projects/{projectId}/notes/{noteId}/attachments/{timestamp}_{sanitizedFilename}`
- Export Reports: `exports/{userId}/{timestamp}_{sanitizedFilename}`

## Upload Routes Integrated
- `src/app/api/cards/[cardId]/attachments/route.ts`: Card attachments stored under project/card folder.
- `src/app/api/profile/avatar/route.ts`: Profile avatars stored under user avatar folder.
- `src/app/api/projects/[id]/cover/route.ts`: Project covers stored under project cover folder.
- All routes feature automated fallback to Cloudinary when R2 is unconfigured.

## Files Created & Modified
- `src/lib/r2.ts`: Core S3 client initialization, configuration checks, upload/delete utilities, and `R2_STORAGE_PATHS`.
- `src/lib/r2.test.ts`: Vitest unit tests verifying configuration checks, URL formatting, command dispatch, and folder path generation.
- `src/app/api/cards/[cardId]/attachments/route.ts`: Upload handler integration.
- `src/app/api/profile/avatar/route.ts`: Profile avatar upload handler.
- `src/app/api/projects/[id]/cover/route.ts`: Project cover upload handler.
- `.env.example`: Added R2 environment variable templates.
- `docs/agent-notes/2026-11-11-cloudflare-r2-integration.md`: Technical documentation.

## Verification
- Unit tests: `npx vitest run src/lib/r2.test.ts` (18/18 passed)
- Linter: `npm run lint` (0 errors, 0 warnings)
- Schema validation: `npx prisma validate` (Valid)
- Build: `cmd.exe /c "npm run build"` (43/43 routes compiled successfully)
