# Work Session Note: AI Stability, Dynamic Hot-Reload & Error Reporting

## Objective
Harden DeepSeek AI integration against runtime environment stale-caching, eliminate misleading generic database error messages on AI failures, prevent unfair credit deduction on failed calls, and verify clean git history without secrets.

## Files Created, Modified, Deleted, or Moved
- **Modified**:
  - `src/lib/ai/deepseek.ts`: Added dynamic `.env` / `.env.local` traversal (`getDeepSeekApiKey`), custom `apiKey` parameter override, automatic 401 recovery retry, and hardened JSON boundary extraction.
  - `src/app/api/ai/breakdown/route.ts`: Supported client-provided `x-deepseek-api-key` header; switched to deducting credits only after successful AI response; descriptive error handling.
  - `src/app/api/ai/summary/route.ts`: Supported client-provided `x-deepseek-api-key` header; switched to deducting credits only after successful AI response; descriptive error handling.
  - `src/components/kanban/card-modal.tsx`: Integrated client API key handling, KeyRound settings button, and automatic `ApiKeyModal` prompt if server has no key.
  - `src/components/ai/ai-breakdown-modal.tsx`: Supported client API key headers in request.
  - `src/components/ai/ai-project-summary-modal.tsx`: Supported client API key headers in request.
  - `vitest.config.ts`: Configured Vite `loadEnv` to safely supply environment variables to test runners.
  - `src/lib/ai/deepseek.test.ts`: Ensured no secrets exist in test code and use `it.runIf(Boolean(process.env.DEEPSEEK_API_KEY))`.
- **Created**:
  - `src/lib/ai/client-key.ts`: Client-side helper for reading/storing DeepSeek API key in browser `localStorage` and attaching `x-deepseek-api-key` headers.
  - `src/components/ai/api-key-modal.tsx`: User-friendly modal allowing users to enter and save their DeepSeek API key directly in the browser.
  - `docs/agent-notes/2026-09-28-ai-stability-and-key-rotation.md`: Work session documentation note.

## Important Behavior Changes
- **Client-Side Key Fallback & Vercel Resilience:** If deployed on Vercel where `.env` is not present and `DEEPSEEK_API_KEY` has not yet been configured in the Vercel dashboard, users can enter their API key directly via `ApiKeyModal`. The key is securely saved in `localStorage` and sent via `x-deepseek-api-key` header.
- **Auto-Prompt on Missing Key:** When a user triggers AI Breakdown without a server key configured, rather than failing silently or showing a dead-end error, the system automatically opens the `ApiKeyModal` and immediately retries the breakdown upon saving.
- **Dynamic Hot-Reload & Traversal:** If `.env` or `.env.local` is updated, `getDeepSeekApiKey()` traverses parent directories and parses disk files directly, preventing 401 errors caused by stale in-memory environment variables.
- **Fair Credit Deductions:** AI credits are only deducted AFTER a successful response from DeepSeek. If the network fails or DeepSeek returns an error, 0 credits are deducted.
- **Transparent Errors:** AI routes return clear, actionable error messages with clear instructions for both Vercel and local environments.
- **Git Security:** All git history verified with zero hardcoded API keys on `origin/main`.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run`: Passed (72 test files, 348 tests passed).
- `npm run lint`: Passed with 0 warnings and 0 errors.
- `npm run build`: Production build completed successfully (all 35 routes compiled).
- `npx prisma validate`: Schema is valid.
- `git diff`: Verified 0 secrets in diff.

## Known Follow-ups, Blockers, or Deployment Notes
- For production on Vercel, users can either:
  1. Add `DEEPSEEK_API_KEY` to **Vercel Dashboard > Project Settings > Environment Variables** and redeploy.
  2. Or simply input the API key in the UI when prompted, which works immediately in the browser.
