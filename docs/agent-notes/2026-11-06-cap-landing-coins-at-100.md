# Work Note: Cap Landing Page Wallet Coins at 100 Maximum

## Date & Objective
- **Date:** 2026-11-06
- **Objective:** Cap the landing page interactive wallet coins accumulation and the transfer bonus displayed on `/login` and `/register` to a maximum of 100 coins (`Math.min(100, ...)`), fixing legacy stored values (e.g., 20090) in client `localStorage`.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/app/(marketing)/page.tsx`: Added a 100-coin clamp to `triggerEarnCoin`, save routines, and local storage read routines. Rewrites bloated legacy values in `localStorage` back down to 100.
  - `src/components/auth/login-scene.tsx`: Clamped `walletCoins` from `retzlo:landing-pass` to a maximum of 100, rewrote existing bloated values in `localStorage` to 100, and clamped the display banner text to `Math.min(100, bonusInfo.walletCoins)`.
- **Created:**
  - `src/components/auth/landing-coins-cap.test.ts`: Unit test asserting the 100 maximum clamp behavior for legacy values and edge cases.
  - `docs/agent-notes/2026-11-06-cap-landing-coins-at-100.md`: This work note.

## Important Behavior Changes
- Users can accumulate coins on the landing page only up to 100 coins.
- When visiting `/login` or `/register`, any previously accumulated coins above 100 in `localStorage` (`retzlo:landing-pass`) are automatically clamped to 100 and rewritten to prevent displaying legacy bloated amounts (e.g. 20090 coins).
- The bonus notification banner on the auth screen consistently displays up to 100 Coins maximum.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/auth/landing-coins-cap.test.ts`: Passed (1 test suite, 2 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded with exit code 0).

## Known Follow-ups, Blockers, or Deployment Notes
- None. Ready to commit and push to `origin/main`.
