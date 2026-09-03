# 2026-07-29 Auth-Aware Login And Navbar

## Objective
Prevent signed-in users from staying on the login page and show authenticated navigation data on the marketing navbar.

## Changed Files
- `src/components/auth/login-form.tsx`
- `src/app/(marketing)/page.tsx`
- `src/components/auth/auth-navigation.test.ts`
- `docs/agent-notes/2026-07-29-auth-aware-login-navbar.md`

## Behavior
- `LoginForm` now checks the client session with `getSession()` and redirects existing sessions to the callback URL or `/select-module`.
- While checking the session, the login form shows a short session-checking message instead of the credential form.
- Marketing landing navigation now fetches `/api/auth/session` client-side.
- If a session exists, desktop/mobile nav shows the user name/email linked to `/profile` and keeps the workspace entry action visible.
- If no session exists, nav keeps the existing Sign In / Start planning behavior.

## Verification
- `npm test -- src/components/auth/auth-navigation.test.ts`: passed, 2 tests.
- `npm run lint`: passed.
- `npx prisma validate`: passed.
- `npm run build`: blocked by active dev server locking Prisma query engine DLL (`EPERM rename query_engine-windows.dll.node`).

## Notes
- Dev server was left running for browser preview.