# Work Session Note: AI Assistant (DeepSeek Engine) — Task Breakdown, Progress Summary & Credit Quota

## Objective
Implement the AI Assistant feature powered by the DeepSeek API (`deepseek-chat`) allowing users to auto-breakdown tasks into structured checklist items (e.g., "วิธีทำผัดกะเพรา" into actionable steps) directly in the Card Modal, generate board-level executive progress summaries with markdown export and notes integration, and manage AI credit quotas (Free Tier 50 credits, deduct on usage).

## Files Created, Modified, Deleted, or Moved
- **Created**:
  - `src/lib/ai/prompts.ts`: High-quality system prompts for task breakdown, project progress summary, and chat confirmation.
  - `src/lib/ai/deepseek.ts`: DeepSeek API client with native fetch, 20s timeout, response sanitization, and fallback mode.
  - `src/lib/ai/deepseek.test.ts`: Vitest suite (3 tests) testing real DeepSeek API call and fallback mode.
  - `src/lib/ai/credits.ts`: Quota and credit management (Free Tier 50 credits, atomic deduction).
  - `src/lib/ai/credits.test.ts`: Unit tests for AI credit costs and tier limits.
  - `src/app/api/ai/breakdown/route.ts`: Endpoint for task checklist breakdown with credit deduction.
  - `src/app/api/ai/summary/route.ts`: Endpoint for project progress summary with board card snapshot analytics.
  - `src/app/api/ai/credits/route.ts`: Endpoint returning current user's AI tier and remaining credit balance.
  - `src/components/ai/ai-breakdown-modal.tsx`: Interactive modal for task breakdown with depth and insertion mode toggles.
  - `src/components/ai/ai-project-summary-modal.tsx`: Executive progress summary modal with Copy Markdown and Save to Notes.
  - `src/components/ai/ai-features.test.ts`: Component integration tests (3 tests) verifying modal triggers and direct form application.
  - `docs/agent-notes/2026-09-27-ai-assistant-deepseek.md`: Work session documentation note.
- **Modified**:
  - `src/components/kanban/card-modal.tsx`: Added `✨ AI Breakdown (1 cr)` button in Checklist header and mounted `AiBreakdownModal`.
  - `src/components/kanban/board.tsx`: Added `🤖 AI Summary (2 cr)` button in the control bar and mounted `AiProjectSummaryModal`.
  - `.env`: Configured `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, and `DEEPSEEK_MODEL` (local secret, gitignored).

## Important Behavior Changes
- **1-Click Instant AI Breakdown in Card Modal:** Clicking `✨ AI Breakdown (1 cr)` now triggers instant generation in 1 click (no modal popup interruption). AI analyzes the card title & description and immediately populates 8–10 actionable checklist steps starting with action verbs (e.g. "สร้าง...", "เตรียม...", "ทดสอบ...").
- **Custom Goal Options Modal:** Added a discreet `SlidersHorizontal` button next to AI Breakdown for users who explicitly want to specify custom goals or choose Replace vs Append mode.
- **High-IQ Domain-Specific Prompts:**
  - `TASK_BREAKDOWN_SYSTEM_PROMPT` enforces crisp, punchy, sequential actionable checklist items (default 8–10 steps) with domain excellence (cooking, coding, business, travel).
  - `PROJECT_SUMMARY_SYSTEM_PROMPT` enforces insightful native Thai executive analysis with WIP limit awareness, blocker isolation, and strategic sprint recommendations.
  - Sanitization cleans numeric prefixes ("1. ", "2. ") so checklist items remain pure task labels.
  - Transparent error handling: Fails clearly if `DEEPSEEK_API_KEY` is missing instead of returning robotic mock fallbacks.
- **Kanban Board Summary:** Clicking `🤖 AI Summary (2 cr)` analyzes all cards on the board and displays health status, in-progress focus, overdue bottlenecks, and recommended next steps in natural Thai, with 1-click Markdown copy and Save to Notes.
- **Credits:** Deducts 1 credit for breakdown, 2 credits for summary, tracks balance in real-time.

## Database / Schema Changes
- None required. AI credits and quota are managed flexibly through the user's existing JSON metadata profile without requiring schema migrations.

## Verification Commands Run & Results
- `npx vitest run`: Passed (72 test files, 348 tests passed, including Pad Kra Pao breakdown, Google OAuth software breakdown, and Thai project summary).
- `npx prisma validate`: Valid.
- `npm run lint`: Passed with 0 warnings and 0 errors.
- `npm run build`: Production build completed successfully (all pages compiled and optimized).

## Known Follow-ups, Blockers, or Deployment Notes
- Server must be started/restarted after `.env` changes so Node.js loads `DEEPSEEK_API_KEY`.
