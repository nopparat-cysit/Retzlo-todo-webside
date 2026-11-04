# 2026-11-04 Landing Hero Board Redesign

## Date and Objective
- Date: 2026-11-04
- Objective: Redesign the marketing landing page hero section into a clean, product-first sample Kanban board preview showcasing Retzlo core capabilities directly above the fold.

## Files Created, Modified, Deleted, or Moved
- Created: `src/app/(marketing)/hero-board-preview.tsx`
  - Clean, static product Kanban board mockup preview with responsive horizontal scrolling layout on mobile devices (`aria-hidden="true"`).
  - Realistic task cards across three columns ("ต้องทำ", "กำลังทำ", "เสร็จแล้ว") with priority badges, due dates, checklists, retro stickers, and assignee avatar stacks.
- Modified: `src/app/(marketing)/page.tsx`
  - Replaced legacy `#cp-hero` section with centered product-first headline, value description, tactile CTA buttons, and `HeroBoardPreview`.
  - Removed unused retro artwork state and event handlers (`artRef`, `artBoundsRef`, `artPointerRaf`, `moveArtwork`, `resetArtwork`).
  - Pruned unused hero icon imports while retaining audio and mini-game integration.

## Important Behavior Changes
- Hero section renders an immediate, authentic preview of the Kanban board instead of the oversized vector artwork studio.
- Page bundle payload decreased from 56 kB to 44.7 kB.
- No emojis used in code, comments, or UI microcopy.

## Database / Schema Changes
- None.

## Verification Commands Run and Result
- `npm run lint`: Passed with 0 errors and 0 warnings.
- `npx vitest run`: Passed (105 test files, 584 tests passed, 3 skipped).
- `npm run build`: Passed (all 43 routes compiled and generated statically/dynamically).
- `npx prisma validate`: Passed (schema valid).

## Known Follow-ups, Blockers, or Deployment Notes
- None. Ready for coordinator review.
