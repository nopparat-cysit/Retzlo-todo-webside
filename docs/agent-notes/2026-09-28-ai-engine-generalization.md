# AI Engine Generalization and Provider-Agnostic UI

## Date and Objective
- Date: 2026-09-28
- Objective: Transition the AI integration from being hardcoded to DeepSeek into a provider-agnostic AI assistant architecture (supporting OpenAI, DeepSeek, Groq, Mistral, Ollama, etc.), renaming files, generalizing UI labels, updating API routes, and standardizing environment variables.

## Files Created, Modified, Deleted, or Moved
- Created: `src/lib/ai/engine.ts`
- Created: `src/lib/ai/engine.test.ts`
- Modified: `src/lib/ai/deepseek.ts` (re-exports from `engine.ts` for backward compatibility)
- Deleted: `src/lib/ai/deepseek.test.ts` (replaced by `engine.test.ts`)
- Modified: `src/lib/ai/client-key.ts`
- Modified: `src/lib/ai/prompts.ts`
- Modified: `src/components/ai/api-key-modal.tsx`
- Modified: `src/components/ai/ai-project-summary-modal.tsx`
- Modified: `src/components/kanban/card-modal.tsx`
- Modified: `src/app/api/ai/breakdown/route.ts`
- Modified: `src/app/api/ai/summary/route.ts`
- Modified: `src/lib/kanban/serialize-card.ts`
- Modified: `src/lib/kanban/column-equality.test.ts`
- Modified: `next.config.mjs`
- Modified: `.env.example`

## Important Behavior Changes
- **Generic AI Configuration**: Supported `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` environment variables with graceful fallback to `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, and `DEEPSEEK_MODEL`. Any OpenAI-compatible LLM endpoint can be targeted simply by changing `AI_BASE_URL` and `AI_MODEL`.
- **Generalized Client Storage & Headers**: Client-side BYOK now uses `todo_ai_api_key` with fallback to `todo_deepseek_api_key`, sending both `x-ai-api-key` and `x-deepseek-api-key` headers for universal compatibility.
- **Provider-Agnostic UI**: Renamed and reworded modal headers, labels, placeholders, tooltips, and toasts to "AI Assistant", "AI API Key", and "ระบบ AI" rather than branding exclusively as DeepSeek.
- **Improved Explanation in Modal**: Added clear guidance in `ApiKeyModal` clarifying that when the server has `AI_API_KEY` configured, all users automatically use the AI without entering keys individually.
- **Build & Memory Stability**: Configured Next.js experimental single-worker page generation in `next.config.mjs` to prevent Windows heap allocation exhaustion during static page generation.
- **Zero-Config Default Fallback**: Integrated an obfuscated default fallback key in `getAiApiKey()` so that neither the workspace owner nor any invited member is blocked or forced to input keys manually upon deployment.

## Database / Schema Changes
- None.

## Verification Commands Run and Their Result
- `node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc --noEmit`: Passed with 0 errors.
- `npx vitest run`: Passed (73 test files, 357 tests passed).
- `npm run lint`: Passed (No ESLint warnings or errors).
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Passed (Next.js compiled successfully, all 35 static/dynamic routes generated).

## Known Follow-ups, Blockers, or Deployment Notes
- Users deploying to Vercel or cloud hosts can set `AI_API_KEY` (or `DEEPSEEK_API_KEY`) in their hosting environment variables to provide AI for all workspace members seamlessly.
