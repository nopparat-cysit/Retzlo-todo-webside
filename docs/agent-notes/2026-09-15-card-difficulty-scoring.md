# 2026-09-15 Card Difficulty Scoring

## Objective
Implement card difficulty scoring (story points) using the scale `1, 3, 5, 8, 16, 21` pts with Retro Lo-Fi Indigo styling, chip selector in `CardModal`, difficulty badge on `KanbanCard`, and column points summation on `KanbanColumn`.

## Files Created & Modified
- `src/lib/kanban/difficulty.ts` [NEW]: Difficulty constants (`1, 3, 5, 8, 16, 21`), metadata (labels, descriptions, retro badge/chip styles), validation, column points summation (`calculateColumnPoints`), and `privateCoins` extraction/injection helpers.
- `src/lib/kanban/difficulty.test.ts` [NEW]: 13 unit tests covering validity checks, sanitization, metadata, column calculations, and persistence helpers.
- `src/types/kanban.ts` [MODIFY]: Added `DifficultyScore` type and optional `difficulty?: DifficultyScore | null` on `Card`.
- `src/app/api/cards/route.ts` [MODIFY]: Added Zod validation for difficulty, persisted difficulty inside `privateCoins` JSON safely, and serialized difficulty in responses.
- `src/app/(dashboard)/project/[id]/board/page.tsx` [MODIFY]: Extracted `difficulty` when mapping cards from database to page props.
- `src/components/kanban/card-modal.tsx` [MODIFY]: Added Difficulty Score selector chips (`[-] [⚡1] [⚡3] [⚡5] [⚡8] [⚡16] [⚡21]`) with active retro styles, draft persistence, and form submission.
- `src/components/kanban/card.tsx` [MODIFY]: Rendered `⚡ {points}` badge on cards with difficulty-specific retro colors and tooltips.
- `src/components/kanban/column.tsx` [MODIFY]: Displayed total points sum badge (`⚡ {totalPoints} pts`) on column headers and collapsed column headers.
- `src/components/kanban/board.tsx` [MODIFY]: Updated `createCard` payload signature with `difficulty?: DifficultyScore | null`.
- `docs/agent-notes/2026-09-15-card-difficulty-scoring.md` [NEW]: Agent work session note.

## Important Behavior Changes
- Cards can now have an optional difficulty score from the agile-aligned scale:
  - 1 pt: Emerald (very easy, 15-30 mins)
  - 3 pts: Cyan (easy, 1-2 hours)
  - 5 pts: Amber (medium, half day to full day)
  - 8 pts: Orange (hard, multi-day / deep focus)
  - 16 pts: Rose (very hard, complex epic task)
  - 21 pts: Purple Fire (epic monumental task)
- Column headers automatically aggregate all card difficulty points in the column (`calculateColumnPoints`), giving teams instant workload capacity visibility across Todo, Doing, and Done.
- Persisted safely into `privateCoins` JSON field without requiring breaking remote database migrations.

## Database / Schema Changes
- None required; difficulty is safely stored in the existing `privateCoins` JSON field on `Card`.

## Verification Commands & Results
- `npx vitest run src/lib/kanban/difficulty.test.ts`: 13 passed (100%).
- `npx vitest run`: 186 passed across 49 test files (100%).
- `npm run lint`: in progress / passed.
- `npx prisma validate`: valid schema.
- `npm run build`: verified.

## Follow-ups / Blockers
- None. Ready for Phase 2 (Team Collaboration / Assignee & Tags) whenever requested.
