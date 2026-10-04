# Work Note: 2026-10-04 — Remove DeepSeek-V4 Pro Model Mentions from User-Facing Surfaces

## Objective
Remove internal AI model branding ("DeepSeek-V4 Pro") from user-facing surfaces across the application as requested by user ("DeepSeek-V4 Pro เอาคำโมเดลออก มันไม่เกี่ยวเลย"). The product branding should consistently refer to "Retzlo AI Assistant" / "Retzlo AI" rather than exposing backend LLM model names to end users.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/ui/help-button.tsx`: In "รายละเอียดเว็บไซต์" (Website Details) modal, replaced `DeepSeek-V4 Pro Engine` under AI architecture specs with `Retzlo AI Assistant`.
  - `src/components/contact/contact-page-client.tsx`: Replaced `Retzlo AI (DeepSeek-V4 Pro)` with `Retzlo AI`.
  - `src/components/help/help-center-client.tsx`:
    - Updated article title from `ผู้ช่วยอัจฉริยะ Retzlo AI (DeepSeek-V4 Pro)` to `ผู้ช่วยอัจฉริยะ Retzlo AI`.
    - Removed `โมเดล DeepSeek-V4 Pro` from summary, highlights, and tips.
    - Updated FAQ to refer to AI settings rather than specific model names.
  - `src/components/ai/ai-chat-widget.tsx`: Replaced raw model name pill (`{activeModel}` which printed `deepseek-v4-pro`) in the chat header with a clean, actionable `ตั้งค่า AI Key` button.
  - `src/components/ai/api-key-modal.tsx`: Updated preset labels from `DeepSeek-V4 Pro` to `Retzlo AI (ค่าเริ่มต้น)` and `DeepSeek Flash` to `โหมดความเร็วสูง (Fast)`. Removed `(V4 Pro)` from reset toast message.
  - `src/components/help/help-center.test.ts`: Updated test assertions to check for `ผู้ช่วยอัจฉริยะ Retzlo AI`.
  - `docs/system-guide.md`: Updated section header `2.1 ผู้ช่วยอัจฉริยะ Retzlo AI` and website details description.
  - `docs/theme-system.md`: Updated changelog entries.

## Important Behavior Changes
- User-facing UI across Website Details, Contact page, Help Center, and AI Chat header now uniformly uses the Retzlo brand identity (`Retzlo AI` / `Retzlo AI Assistant`) without leaking backend model details (`DeepSeek-V4 Pro`).
- Backend API routing and storage keys remain fully compatible (`deepseek-v4-pro` default preserved under the hood).

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded with exit code 0).

## Known Follow-ups, Blockers, or Deployment Notes
- `src/lib/ai/engine.test.ts` remote test fails when local DeepSeek API key has zero balance (HTTP 402 from remote provider); unit test mock tests pass.
