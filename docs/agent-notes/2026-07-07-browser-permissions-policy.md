# 2026-07-07 - Browser permissions policy

## Objective
Disable browser access to microphone, camera, and location APIs across the app.

## Files created
- `src/lib/security-headers.test.ts`
- `docs/agent-notes/2026-07-07-browser-permissions-policy.md`

## Files modified
- `next.config.mjs`

## Behavior changes
- Added a global `Permissions-Policy` response header for all routes.
- The header denies `camera`, `microphone`, and `geolocation` with `camera=(), microphone=(), geolocation=()`.

## Database/schema changes
- None.

## Verification
- `npm test -- src/lib/security-headers.test.ts` - passed (1 test).
- `npm run lint` - passed with no ESLint warnings or errors.
- `npm run build` - passed; production build completed successfully.
- `npx prisma validate` - passed.

## Known follow-ups
- None.