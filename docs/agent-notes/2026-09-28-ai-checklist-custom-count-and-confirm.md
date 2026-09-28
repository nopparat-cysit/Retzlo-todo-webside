# AI Checklist Custom Count, Recommendations & Pre-Creation Confirmation

## Date & Objective
- **Date**: 2026-09-28
- **Objective**: Support recommended step presets, customizable step count stepper (1-15), and a two-stage preview & confirmation workflow before generating and inserting AI checklist items into cards.

## Files Created, Modified, Deleted, or Moved
- **Modified**:
  - `src/lib/ai/prompts.ts`: Updated `TASK_BREAKDOWN_SYSTEM_PROMPT` to respect exact target step count instructions (`itemCount`).
  - `src/lib/ai/engine.ts`: Added `itemCount?: number` parameter to `generateTaskBreakdown`, injecting count directives into the prompt and slicing results if needed.
  - `src/lib/ai/engine.test.ts`: Added unit test verifying `itemCount` parameter handling and adjusted difficulty score assertions.
  - `src/app/api/ai/breakdown/route.ts`: Added `itemCount: z.number().int().min(1).max(20).optional()` validation to `breakdownSchema` and forwarded it to `generateTaskBreakdown`.
  - `src/components/ai/ai-breakdown-modal.tsx`: Completely redesigned into a 2-step modal:
    - Step 1 (`configure`): Presets (3, 5 [Recommended], 8, 10 steps), custom count stepper (1-15), focus note, insert mode toggle (append vs replace), and pre-generation confirmation button.
    - Step 2 (`preview`): AI summary overview, suggested difficulty & priority tags, editable checklist preview with checkboxes, select-all/deselect-all toggles, and final confirmation button to insert into the card.
  - `src/components/kanban/card-modal.tsx`: Updated `AI Breakdown` button to launch `AiBreakdownModal` with count options and confirmation dialog rather than immediately inserting without user review. Cleaned up unused instant breakdown helpers.

## Important Behavior Changes
- Users clicking "AI Breakdown" on any card modal are now presented with a dialog allowing them to choose a recommended step count (3, 5, 8, 10) or define custom counts with `[-] [count] [+]`.
- Generation requires explicit user confirmation via "ยืนยันสร้างเช็กลิสต์".
- Once generated, users inspect the checklist in preview mode, can uncheck unwanted items or edit labels directly, and must click "ยืนยันนำไปใช้ในการ์ด ({N} ข้อ)" before items are placed into the card.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx prisma validate`: Passed (schema is valid).
- `node --max-old-space-size=4096 ./node_modules/typescript/bin/tsc --noEmit`: Passed (0 errors).
- `npx vitest run src/lib/ai/engine.test.ts`: Passed (6 tests passed, including `itemCount` test).
- `npm run lint`: Passed (✔ No ESLint warnings or errors).
- `npm run build`: Passed (Compiled successfully, static pages generated 35/35).

## Known Follow-ups, Blockers, or Deployment Notes
- None. Fully compatible with production build and Vercel deployments.
