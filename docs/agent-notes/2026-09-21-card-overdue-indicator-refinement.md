# 2026-09-21 - Kanban Card Overdue Indicator Refinement

## Objective
Refine the overdue indicator on Kanban cards per user request. Instead of occupying a full text pill badge `[Overdue]` in the middle of the tags row, display a pulsing red clock icon with a pinging alert beacon in the top-right corner of the card. When hovered, display a retro lofi tooltip showing the overdue details (due date and overdue status), leaving the tags row uncluttered.

## Files Created, Modified, Deleted, or Moved
- `src/components/kanban/card.tsx` (Modified: moved overdue indicator to top-right corner header next to Star, styled with `h-5 w-5 rounded-full border border-red-500/40 bg-red-500/15 text-red-400` with pulsing clock icon and `animate-ping` alert dot, added rich hover tooltip with `group-hover/overdue:block`, and removed the `[Overdue]` badge from the badges row)

## Important Behavior Changes
- The tags row on Kanban cards (`status`, `priority`, `difficulty`, `checklist`, `note`) is no longer crowded by the overdue text badge.
- Cards that are overdue clearly show a pulsing red clock beacon in the top right corner.
- Hovering over the overdue icon reveals a tooltip with the exact due date and overdue note.

## Database/Schema Changes
- None.

## Verification Commands Run and Results
- `npm run lint`: Passed (0 errors, 0 warnings)
- `npm test`: Passed (61 test files, 279 tests passed)
- `npm run build`: Passed (All 35 static/dynamic routes compiled successfully)

## Known Follow-ups, Blockers, or Deployment Notes
- Commit and push to `origin/main` for Vercel production deployment.
