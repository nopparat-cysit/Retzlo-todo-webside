# 2026-06-18 Auth Card Centering

## Objective

Center the login/register auth card within the auth scene.

## Files Modified

- `src/app/globals.css`

## Behavior Changes

- Removed the desktop-only left margin offset from `.auth-card`.
- The auth scene grid can now center the card naturally on login/register pages.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `.\node_modules\.bin\next.cmd build` timed out after 304 seconds without returning build output.

## Follow-Ups

- Visually verify `/login` and `/register` in the browser after starting the correct local dev server.
