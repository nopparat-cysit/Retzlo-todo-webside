# OpenRouter Dual-Tier Model ID & Reasoning Resolution Fix

Date: 2026-11-11
Status: Completed

## Summary
Diagnosed and resolved why AI features were failing across public and workspace tiers. Fixed model ID mismatch, OpenRouter reasoning token exhaustion, environment precedence conflicts, and disk fallback key scanning.

## Root Causes Identified
1. **Workspace Model ID Mismatch**:
   - `AI_WORKSPACE_MODEL` was configured as `openai/gpt-6-luna-medium`.
   - OpenRouter does not have a model with `-medium` suffix; the official ID is `openai/gpt-6-luna`.
   - This caused OpenRouter to return `400 Bad Request: openai/gpt-6-luna-medium is not a valid model ID` on all workspace requests.
2. **Public Tier Reasoning Token Starvation**:
   - `openai/gpt-oss-120b` is an AkashML-hosted reasoning model that generates internal reasoning tokens first.
   - The public tier previously capped `maxTokens` at 350, exhausting all tokens before any `content` was output (`content: null`), throwing `AI returned an empty response`.
3. **Legacy Environment Precedence Conflict**:
   - Duplicate legacy DeepSeek keys (`DEEPSEEK_API_KEY`, `AI_API_KEY`, `AI_BASE_URL="https://api.deepseek.com"`) preceded `OPENROUTER_API_KEY` in `.env`, causing calls to hit DeepSeek endpoint with expired quota (HTTP 402).
   - Regex scan in `getAiApiKey()` parsed the first matching key from disk, picking legacy keys over OpenRouter.

## Changes Applied
- `src/lib/ai/tiers.ts`:
  - Updated default workspace model from `openai/gpt-6-luna-medium` to `openai/gpt-6-luna`.
  - Increased public tier `maxTokens` from 350 to 1000.
- `src/lib/ai/engine.ts`:
  - Fixed `getAiModel()` fallback to `openai/gpt-6-luna`.
  - Updated `getAiBaseUrl()` to prioritize OpenRouter URL when `OPENROUTER_API_KEY` is present.
  - Updated `getAiApiKey()` to search for `OPENROUTER_API_KEY` first on disk before legacy keys.
  - In `callAiChat()`: passed `reasoning: { effort: "low" }` for `oss` models on OpenRouter, and added fallback to `choice.message.reasoning`.
- `src/lib/ai/tiers.test.ts` & `src/lib/ai/engine.test.ts`:
  - Updated expectations for 1000 public maxTokens and `openai/gpt-6-luna` workspace model.
  - Added `OPENROUTER_API_KEY` deletion in fallback tests.
- `.env`: Cleaned up conflicting legacy DeepSeek variables, aligning with OpenRouter dual-tier configuration.

## Verification
- Unit tests: `npx vitest run src/lib/ai/` (20 passed, 3 skipped, 0 failed).
- Live OpenRouter verification:
  - Public Tier (`openai/gpt-oss-120b`): HTTP 200 OK with Thai response.
  - Workspace Tier (`openai/gpt-6-luna`): HTTP 200 OK with JSON breakdown.
- Code style: `npm run lint` (0 errors, 0 warnings).
- Database schema: `npx prisma validate` (Valid).
- Production build: `npm run build` (All 43 routes compiled successfully).
