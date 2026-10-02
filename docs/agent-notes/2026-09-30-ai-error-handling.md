# 2026-09-30 — AI Error Handling Improvements

## Objective
Fix AI features showing generic "เกิดข้อผิดพลาด" errors by improving error handling, timeout config, and response parsing.

## Root Cause Analysis
- **Vercel Hobby plan default timeout is 10s** — DeepSeek V4 Pro (reasoning model) can take 15-30s to respond
- **Non-JSON responses from Vercel 504** — `res.json()` would throw when Vercel returns HTML timeout page, causing a generic network error
- **Default AI engine timeout was 45s** — increased to 60s for reasoning models
- **Missing specific error messages** for 402 (insufficient balance), 429 (rate limit), and AbortError (timeout)

## Files Modified
1. **`src/lib/ai/engine.ts`** — Core AI engine
   - Increased default timeout from 45s → 60s with explanatory comment
   - Added specific error messages for HTTP 402 (DeepSeek balance) and 429 (rate limit)
   - Added AbortError catch → clear Thai timeout message
   - Changed "AI returned an empty response" to Thai message

2. **`src/app/api/ai/chat/route.ts`** — Added `maxDuration = 60` for Vercel
3. **`src/app/api/ai/breakdown/route.ts`** — Added `maxDuration = 60` for Vercel
4. **`src/app/api/ai/summary/route.ts`** — Added `maxDuration = 60` for Vercel

5. **`src/components/ai/ai-chat-widget.tsx`** — Client-side chat
   - Safe JSON parsing with try/catch around `res.json()`
   - Specific error message for HTTP 504 timeout

6. **`src/components/ai/ai-breakdown-modal.tsx`** — AI checklist generator
   - Safe JSON parsing with try/catch around `res.json()`
   - Specific error message for HTTP 504 timeout

7. **`src/components/ai/ai-project-summary-modal.tsx`** — AI project summary
   - Safe JSON parsing with try/catch around `res.json()`
   - Specific error message for HTTP 504 timeout

8. **`src/components/theme/theme.test.ts`** — Updated test
   - Changed assertion from `appearance-none` → `SelectTrigger` (notes-panel now uses Radix Select)

## Verification
- `npx tsc --noEmit` — 0 errors ✅
- `npm run lint` — No warnings or errors ✅
- `npx prisma validate` — Valid ✅
- `npm run build` — Compiled successfully ✅
- `npx vitest run src/components/theme/theme.test.ts` — 20/20 passed ✅

## Commits
- `60dda72` — `fix(notes): upgrade folder/board select to Radix UI and align calendar with DateTimeField`
- `d75d250` — `fix(ai): improve error handling, add Vercel maxDuration, fix timeout and non-JSON response handling`

## Deployment Notes
- Vercel `maxDuration = 60` requires **Vercel Pro plan**. On Hobby plan, max is still 10s.
- If user is on Hobby plan, the AI features may still timeout for complex prompts.
- Recommended: Set `AI_API_KEY` in Vercel Dashboard environment variables for production.

## Follow-ups
- Consider adding streaming (SSE) for AI chat to avoid timeout issues entirely
- Monitor DeepSeek API balance at platform.deepseek.com
