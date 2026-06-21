# 2026-06-20 Projects DB Fallback

## Objective

Prevent the projects page from crashing with a Next.js runtime overlay when the database connection is temporarily unreachable.

## Files Modified

- `src/app/(dashboard)/projects/page.tsx`
- `src/components/project/projects-dashboard.tsx`

## Behavior Changes

- The projects page now catches database load failures for the dashboard query batch.
- When the database is unreachable, the page renders an empty dashboard with a short connection warning instead of throwing a runtime error.
- The warning does not expose database hostnames, credentials, or connection strings.
- Basic user profile fallback data comes from the active NextAuth session.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- First `npm run build` attempt failed during `prisma generate` with `EPERM` because running Next dev server processes were holding the Prisma query engine DLL.
- Stopped the repo-specific Next dev server processes, then reran `npm run build`; the second build passed.

## Follow-Ups

- If Neon connection failures repeat, check the Neon project status, region, branch endpoint, and whether the dev server has stale environment variables.
