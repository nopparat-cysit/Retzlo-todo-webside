# 2026-11-19 ChunkLoadError Auto-Recovery & Deployment Resilience

## Date & Objective
- Date: 2026-11-19
- Objective: Eliminate ChunkLoadError on iPad/Safari and across Vercel deployments via automated client recovery, early window error listener, resilient error boundaries, native Next.js splitChunks, and Safari HTML revalidation headers.

## Files Created, Modified, Deleted, or Moved
- Created:
  - `src/lib/chunk-recovery.ts`: Detection and throttled auto-reload logic for ChunkLoadError and dynamic import failures.
  - `src/lib/chunk-recovery.test.ts`: Vitest test suite (18 unit tests) covering detection, throttle limits, and edge cases.
  - `src/components/common/chunk-recovery-listener.tsx`: Client listener registering global error and unhandledrejection handlers.
- Modified:
  - `next.config.mjs`: Removed custom splitChunks override to preserve Next.js 14 App Router chunking; added `Cache-Control: public, max-age=0, must-revalidate` for dynamic HTML routes.
  - `src/app/layout.tsx`: Injected inline early recovery script in `<head>` before chunk evaluation; mounted `ChunkRecoveryListener`.
  - `src/app/error.tsx`: Added chunk error detection, automatic reload dispatch, and bilingual update UI.
  - `src/app/global-error.tsx`: Added chunk error detection, automatic reload dispatch, and bilingual update UI.
  - `src/app/(dashboard)/error.tsx`: Added chunk error detection, automatic reload dispatch, and bilingual update UI.

## Important Behavior Changes
- iPad and mobile Safari instances with cached tabs or stale chunk references from prior deployments now automatically reload upon encountering a 404 chunk error, seamlessly updating to the newest Vercel deployment without crashing into an unhandled error screen.
- Reload attempts are throttled to at most once per 20 seconds using sessionStorage, preventing reload loops if the network is down.
- If auto-reload cannot proceed, error boundaries now render a bilingual update card ("A new version of Retzlo is available / มีการอัปเดตเวอร์ชันใหม่") with Reload and Clear Cache & Reload buttons instead of a generic error box.
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
- Ready for production deployment on Vercel via git push to main.
