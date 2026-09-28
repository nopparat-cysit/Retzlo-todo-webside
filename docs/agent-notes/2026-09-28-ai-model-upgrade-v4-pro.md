# Upgrade Default AI Model to DeepSeek-V4 Pro & Add Model Selector

## Date & Objective
- **Date**: 2026-09-28
- **Objective**: Upgrade system default AI model to `deepseek-v4-pro` to replace `deepseek-flash` (routed from legacy `deepseek-chat`), increase reasoning token headroom to 4096, implement resilient JSON parsing, and provide a user-facing Model Selector in `ApiKeyModal`.

## Files Created, Modified, Deleted, or Moved
- **Modified**:
  - `src/lib/ai/engine.ts`:
    - Updated `getAiModel(overrideModel?: string)` to default to `"deepseek-v4-pro"`.
    - Added `model?: string` to `AiChatOptions`, `generateTaskBreakdown`, and `generateProjectSummary`.
    - Increased `max_tokens` default from 1500 to 4096 to prevent token exhaustion during deep reasoning.
    - Added `safeParseJson` helper with automatic trailing comma/brace recovery for truncated outputs.
    - Handled reasoning models returning output in `reasoning_content` if `content` is empty.
  - `src/lib/ai/client-key.ts`:
    - Added `AI_MODEL_STORAGE_KEY`, `getClientAiModel()`, and `setClientAiModel()`.
    - Included `x-ai-model` in `getAiAuthHeaders()`.
  - `src/app/api/ai/breakdown/route.ts`:
    - Extracted `x-ai-model` header and passed `model` to `generateTaskBreakdown`.
  - `src/app/api/ai/summary/route.ts`:
    - Extracted `x-ai-model` header and passed `model` to `generateProjectSummary`.
  - `src/components/ai/api-key-modal.tsx`:
    - Added interactive Model Selector supporting `deepseek-v4-pro` (Recommended/Flagship), `deepseek-flash` (High speed), and Custom model names (`gpt-4o`, `claude-3-7-sonnet`, etc.).
  - `src/lib/ai/engine.test.ts`:
    - Increased suite timeout to 60000ms for deep reasoning models and verified all 6 tests pass.

## Important Behavior Changes
- API requests now explicitly request `model: "deepseek-v4-pro"` by default instead of `"deepseek-chat"`, preventing the DeepSeek provider from automatically routing calls to `deepseek-flash`.
- Users can switch or inspect the AI model in the web UI under the key setting modal.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx prisma validate`: Passed (schema is valid).
- `node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc --noEmit`: Passed (0 errors).
- `npx vitest run src/lib/ai/engine.test.ts`: Passed (6/6 tests passed).
- `npm run lint`: Passed (✔ No ESLint warnings or errors).
- `npm run build`: Passed (Compiled successfully, static pages generated 35/35).

## Known Follow-ups, Blockers, or Deployment Notes
- Server environment variable `AI_MODEL="deepseek-v4-pro"` should also be configured on Vercel deployment if explicitly overriding.
