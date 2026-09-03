# 2026-07-29 Login Session Guard Nonblocking

## Objective
Investigate why the login page did not feel usable and make the client-side existing-session redirect nonblocking.

## Files Modified
- `src/components/auth/login-form.tsx`
- `src/components/auth/auth-navigation.test.ts`

## Behavior Changes
- The login form now renders immediately while the client checks for an existing session in the background.
- Existing logged-in sessions still redirect to the callback URL or `/select-module`.
- Login submission now sends the password as an explicit string.
- Replaced the corrupted password placeholder text with plain ASCII text.

## Database / Schema Changes
- None.

## Verification
- `Invoke-WebRequest http://localhost:3000/api/auth/session -UseBasicParsing` returned `{}`, so the checked request had no active session.
- `Invoke-WebRequest http://localhost:3000/api/auth/csrf -UseBasicParsing` returned a CSRF token.
- A credentials callback request with fake credentials returned `401`, confirming the auth route responds normally instead of crashing.
- `npm test -- src/components/auth/auth-navigation.test.ts` passed.
- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` failed because Prisma could not rename `node_modules/.prisma/client/query_engine-windows.dll.node`, likely due to an active process locking the file.

## Follow-Ups
- If real credentials still fail, verify that the account exists in the active database and that the password is correct.
- Stop the dev server or any process holding Prisma files before running `npm run build` again.
