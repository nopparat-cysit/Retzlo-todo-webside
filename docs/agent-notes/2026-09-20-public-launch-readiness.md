# Agent Note: Public Launch Web Application Hardening & Readiness

## Date and Short Objective
- **Date:** 2026-09-20
- **Objective:** Implement critical public launch fixes focused exclusively on our Next.js web application codebase: rate limiting, welcome workspace seeding, terms of service and privacy policy pages, security headers, error boundary privacy, and SEO/branding metadata.

## Files Created, Modified, Deleted, or Moved
### Created
- `src/lib/rate-limit.ts`: In-memory sliding window rate limiter with LRU pruning and client IP extraction.
- `src/lib/rate-limit.test.ts`: Unit tests for rate limiting logic.
- `src/lib/onboarding.ts`: Auto-seed welcome starter workspace (`✨ Welcome to Retzlo`) with sample cards and checklist.
- `src/lib/onboarding.test.ts`: Unit tests for onboarding starter template configuration.
- `src/app/(marketing)/terms/page.tsx`: Terms of Service page with retro-lofi aesthetic.
- `src/app/(marketing)/privacy/page.tsx`: Privacy Policy page with PDPA/GDPR compliance clauses.
- `src/app/icon.svg`: Dynamic Next.js App Router brand favicon icon.
- `public/icon.svg`: Public directory fallback brand icon.
- `src/app/robots.ts`: Next.js robots.txt generator.
- `src/app/sitemap.ts`: Next.js sitemap.xml generator.
- `docs/agent-notes/2026-09-20-public-launch-readiness.md`: Work session documentation note.

### Modified
- `src/app/api/auth/register/route.ts`: Added IP rate limiting (max 5 / 15m) and auto-seeding of welcome workspace upon registration.
- `src/app/api/auth/forgot-password/route.ts`: Added IP and email rate limiting (max 3 / 10m).
- `src/app/api/auth/verify-reset-otp/route.ts`: Added IP rate limiting (max 10 / 10m).
- `src/app/api/projects/[id]/invite/route.ts`: Added user-level rate limiting (max 10 / 10m).
- `next.config.mjs`: Added security headers `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- `src/lib/security-headers.test.ts`: Extended unit tests to assert new security headers.
- `src/app/error.tsx`: Conditionally hide stack trace and internal error messages in production mode.
- `src/app/(dashboard)/error.tsx`: Conditionally hide stack trace and internal error messages in production mode.
- `src/components/auth/register-form.tsx`: Added terms and privacy agreement notice with links to `/terms` and `/privacy`.
- `src/app/layout.tsx`: Updated metadata with title template, OpenGraph, and Twitter cards.

## Important Behavior Changes
- New user registrations now immediately generate a starter workspace with 3 interactive guide cards, eliminating the blank canvas issue.
- Sensitive auth endpoints (`/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/verify-reset-otp`, `/api/projects/[id]/invite`) are protected against automated abuse and spam with HTTP 429 responses.
- Application error screens no longer disclose server internals or stack traces to end-users in production.
- Legal compliance pages (`/terms` and `/privacy`) are accessible to the public and linked in the registration form.
- Social sharing and search engines receive branded metadata, OpenGraph tags, robots directives, and a sitemap.

## Database/Schema Changes
- None (uses existing Prisma schema tables `Project`, `Board`, `Column`, `Card`).

## Verification Commands Run and Results
- `npm test`: Passed (61 test files, 277 tests passed).
- `npm run lint`: Passed (0 ESLint warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (all 35 routes compiled and static pages prerendered successfully).

## Known Follow-ups, Blockers, or Deployment Notes
- Ready for production deployment on Vercel.
- Configure production SMTP credentials (e.g. Resend / AWS SES) in Vercel environment variables for real email delivery.
