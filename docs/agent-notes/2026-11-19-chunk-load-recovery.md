# 2026-11-19 ChunkLoadError Auto-Recovery & Deployment Resilience

## Date & Objective
- Date: 2026-11-19
- Objective: Eliminate ChunkLoadError on iPad/Safari and across Vercel deployments via robust error boundaries, elimination of automatic background reload loops, strict chunk error pattern matching, native Next.js splitChunks, and Safari HTML revalidation headers.

## Files Created, Modified, Deleted, or Moved
- Created:
  - `src/lib/chunk-recovery.ts`: Strict detection and manual reload coordination for ChunkLoadError and dynamic import failures.
  - `src/lib/chunk-recovery.test.ts`: Vitest test suite (18 unit tests) covering strict matching, rejection of stack traces and DOM targets, and cooldown limits.
- Deleted:
  - `src/components/common/chunk-recovery-listener.tsx`: Removed background auto-reload component to avoid unsolicited browser reloads.
- Modified:
  - `next.config.mjs`: Removed custom splitChunks override to preserve Next.js 14 App Router chunking; added `Cache-Control: public, max-age=0, must-revalidate` for dynamic HTML routes.
  - `src/app/layout.tsx`: Removed capture-phase window error reload script and listener component; kept clean theme initialization.
  - `src/app/error.tsx`: Removed automatic `triggerChunkReload()` from `useEffect`; surfaced error details (`error.name`, `error.message`, `error.digest`) with manual "Reload page" and "Clear cache" actions.
  - `src/app/global-error.tsx`: Removed automatic `triggerChunkReload()` from `useEffect`; surfaced error details with manual reload actions.
  - `src/app/(dashboard)/error.tsx`: Removed automatic `triggerChunkReload()` from `useEffect`; surfaced error details with manual reload actions.

## Important Behavior Changes
- Removed all automatic background page reload triggers that caused the "new version" page to bounce/reload in a loop ("เด้งไม่หยุด").
- `isChunkLoadError` no longer checks `stack` or DOM element targets, preventing Webpack internal frames from falsely triggering update notices for standard application exceptions.
- Error boundaries now display real error details (`name`, `message`, `digest`) across all environments, allowing real runtime errors to be inspected and diagnosed.
- Manual "Reload page" and "Clear cache & reload" buttons remain available if a user encounters a genuine deployment chunk mismatch.
- HTML pages are served with `Cache-Control: public, max-age=0, must-revalidate`, preventing Safari BFCache/disk cache from holding stale HTML with expired chunk hashes.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/lib/chunk-recovery.test.ts`: Passed (18 tests passed).
- `npx vitest run`: Passed (123 test suites passed, 757 tests passed, 3 skipped).
- `npm run lint`: Passed (0 errors).
- `npx prisma validate`: Passed (schema valid).
- `cmd.exe /c "npm run build"`: Passed (all 43 routes compiled and generated statically/dynamically).

## Known Follow-ups, Blockers, or Deployment Notes
- Ready for immediate production deployment to Vercel via git push to main.
