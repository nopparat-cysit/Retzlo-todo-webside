# Work Session Note: AI Stability, Dynamic Hot-Reload & Error Reporting

## Objective
Harden DeepSeek AI integration against runtime environment stale-caching, eliminate misleading generic database error messages on AI failures, prevent unfair credit deduction on failed calls, and verify clean git history without secrets.

## Files Created, Modified, Deleted, or Moved
- **Modified**:
  - `src/lib/ai/deepseek.ts`: Added dynamic `.env` file read (`getDeepSeekApiKey`), automatic 401 recovery retry, and hardened JSON boundary extraction.
  - `src/app/api/ai/breakdown/route.ts`: Switched to deducting credits only after successful AI response; removed `parseError` masking in catch block to return descriptive AI errors.
  - `src/app/api/ai/summary/route.ts`: Switched to deducting credits only after successful AI response; removed `parseError` masking in catch block to return descriptive AI errors.
  - `vitest.config.ts`: Configured Vite `loadEnv` to safely supply environment variables to test runners.
  - `src/lib/ai/deepseek.test.ts`: Ensured no secrets exist in test code and use `it.runIf(Boolean(process.env.DEEPSEEK_API_KEY))`.
- **Created**:
  - `docs/agent-notes/2026-09-28-ai-stability-and-key-rotation.md`: Work session documentation note.

## Important Behavior Changes
- **Dynamic Hot-Reload:** If `.env` is updated while Next.js dev server is running, `getDeepSeekApiKey()` reads from `.env` directly, preventing 401 errors caused by stale in-memory environment variables.
- **Fair Credit Deductions:** AI credits are only deducted AFTER a successful response from DeepSeek. If the network fails or DeepSeek returns an error, 0 credits are deducted.
- **Transparent Errors:** AI routes return clear, actionable error messages instead of the generic database message `"Something did not sync. Try again."`.
- **Git Security:** All git history verified with zero hardcoded API keys on `origin/main`.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run`: Passed (72 test files, 348 tests passed).
- `npm run lint`: Passed with 0 warnings and 0 errors.
- `npm run build`: Production build completed successfully.
- `git log -S`: Verified 0 secrets in git history.

## Known Follow-ups, Blockers, or Deployment Notes
- Ensure `.env` contains `DEEPSEEK_API_KEY` for the AI assistant to operate in production.
