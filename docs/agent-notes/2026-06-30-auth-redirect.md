# Change Note: Auth Page Redirect for Logged-In Users

**Date:** 2026-06-30
**Objective:** Redirect users who are already logged in away from the Login and Register pages to the Select Module page immediately.

## Files Modified

- [login/page.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/app/(auth)/login/page.tsx) [MODIFY] - Made the component `async`, queried server-side session using `getServerSession`, and redirected to `/select-module` if a valid user ID exists in the session.
- [register/page.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/app/(auth)/register/page.tsx) [MODIFY] - Made the component `async`, queried server-side session using `getServerSession`, and redirected to `/select-module` if a valid user ID exists in the session.

## Verification Run
- `npm run lint`: Executed successfully with **zero ESLint warnings or errors**.
