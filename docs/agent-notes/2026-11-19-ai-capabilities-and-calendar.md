# Work Note: AI Capabilities Architecture & Calendar Scheduling Fix

- Date: 2026-11-19
- Objective: Fix AI assistant inability to generate calendar schedules and resolve command header top alignment defect.

## Root Causes Identified

1. AI System Prompt Limitations:
   - `AI_CHATBOT_SYSTEM_PROMPT` in `src/lib/ai/prompts.ts` strictly restricted proposals only to explicit card creation requests and forbade guessing dates from relative wording.
   - The prompt lacked domain knowledge explaining that Calendar events in Retzlo are directly populated by Kanban cards with a `dueDate`.
2. Missing Temporal Reference:
   - `src/app/api/ai/chat/route.ts` did not provide current date/time context to the LLM, preventing the calculation of relative terms such as "tomorrow", "this Friday", or "next 3 days".
3. Visual Header Alignment:
   - `src/components/project/projects-dashboard.tsx` line 869 had `sticky top-0 sm:top-2`, introducing an 8px vertical drop on small/desktop viewports that misaligned the command header with the left sidebar.

## Files Created & Modified

- `src/lib/ai/prompts.ts`: Updated `AI_CHATBOT_SYSTEM_PROMPT` to teach the AI that Retzlo Calendar is driven by cards with `dueDate`, enabling schedule and timeline proposals from relative temporal requests.
- `src/app/api/ai/chat/route.ts`: Injected `Current Reference Date` (ISO date + day of week) into `projectContext`.
- `src/components/ai/ai-chat-widget.tsx`: Polished draft proposal labels and confirmation toasts to indicate cards are added to both board and calendar.
- `src/components/project/projects-dashboard.tsx`: Removed `sm:top-2` from the unified command header sticky class to ensure exact baseline top alignment with the left sidebar.
- `src/lib/ai/chat-actions.test.ts`: Added unit tests verifying `extractAiCreateCardProposal` parses calendar dates and due dates correctly.

## Database & Schema Changes

- None.

## Verification

- `npx vitest run src/lib/ai/chat-actions.test.ts`: Passed (3/3 tests).
- `npx vitest run src/lib/ai src/components/ai`: Passed (7 test files, 33 tests).
- `npx vitest run`: Passed (124 test files, 760 tests).
- `npm run lint`: Passed (0 errors).
- `npx prisma validate`: Schema valid.

## Deployment Notes

- No migrations or environment variable changes required.
