# Work Note: Fix artPointerRaf ReferenceError on Marketing Page Unmount

- Date: 2026-11-06
- Objective: Fix `ReferenceError: artPointerRaf is not defined` captured by the global error boundary when navigating away from the marketing landing page (`/`) to `/projects`.

## Files Created, Modified, or Deleted

- Modified: `src/app/(marketing)/page.tsx`
- Created: `src/app/(marketing)/marketing-unmount.test.tsx`
- Created: `docs/agent-notes/2026-11-06-fix-art-pointer-raf-reference-error.md`

## Important Behavior Changes

1. **Eliminated Stale Animation Frame Cancellation:**
   - Removed orphaned `artPointerRaf.current` cleanup from `useEffect` in `src/app/(marketing)/page.tsx`.
   - The reference was left behind during hero section redesign when retro artwork state was replaced with the product-first board preview.
   - When users clicked to navigate from `/` to `/projects`, React unmounted the marketing page and threw `ReferenceError: artPointerRaf is not defined`.
   - The global error boundary caught and surfaced this exact error string.

2. **Added Regression Test:**
   - Added `src/app/(marketing)/marketing-unmount.test.tsx` to verify mounting and server-rendering of `LandingPage` wrapped in `ThemeProvider`.

## Database / Schema Changes

- None.

## Verification Commands Run & Results

- `npx vitest run`: Passed (107 test files, 586 passed, 3 skipped).
- `npm run lint`: Passed (No ESLint warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (Production compilation and static page generation completed with exit code 0).

## Known Follow-ups, Blockers, or Deployment Notes

- Push commit to `main` for automated Vercel deployment.
