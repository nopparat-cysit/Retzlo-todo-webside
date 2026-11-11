# Cloudflare R2 Storage Integration

Date: 2026-11-11
Author: Cloud Storage Integration Specialist
Status: Completed

## Summary
Integrated Cloudflare R2 object storage into Retzlo using `@aws-sdk/client-s3`. Card attachments uploaded as multipart form data route directly to Cloudflare R2 when credentials and bucket configuration exist in environment variables, with automated fallback to Cloudinary when R2 is unconfigured.

## Architecture & Design
- S3 Client Initialization:
  - Region: `auto`
  - Endpoint: Derived from `R2_ENDPOINT` or constructed as `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`.
  - Credentials: `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
  - Public URL resolution: Prefers `R2_PUBLIC_URL` when provided (e.g. custom domain or r2.dev URL), falling back to `${endpoint}/${bucketName}/${key}`.
- Object Storage Layout:
  - Object Key format: `cards/${cardId}/${timestamp}_${sanitizedFilename}`
- Error Handling and Fallbacks:
  - `isR2Configured()` validates that credentials, endpoint/account, and bucket name are set.
  - If R2 is not configured, attachment upload gracefully falls back to `uploadToCloudinary`.
  - `deleteFromR2` handles deletion errors gracefully and returns a boolean.

## Configuration Keys
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`

## Files Created & Modified
- `src/lib/r2.ts`: Core S3 client initialization, configuration checks, upload, and deletion utilities.
- `src/lib/r2.test.ts`: Vitest unit tests verifying configuration checks, URL formatting, command dispatch, and deletion resilience.
- `src/app/api/cards/[cardId]/attachments/route.ts`: Upload handler integration routing to R2 with Cloudinary fallback.
- `.env.example`: Added R2 environment variable templates.
- `docs/agent-notes/2026-11-11-cloudflare-r2-integration.md`: Technical documentation.

## Verification
- Unit tests: `npx vitest run src/lib/r2.test.ts`
- Linter: `npm run lint`
- Schema validation: `npx prisma validate`
- Build: `cmd.exe /c "npm run build"`
