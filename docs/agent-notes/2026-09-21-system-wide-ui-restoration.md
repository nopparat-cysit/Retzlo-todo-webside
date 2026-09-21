# 2026-09-21 - System-wide UI Scale Restoration and Void Elimination

## Objective
Restore balanced proportions and eliminate layout distortions across the platform caused by aggressive global downscaling. Specifically, resolve the large empty black void to the right of the Kanban board by restoring columns to a comfortable responsive width (`w-72 sm:w-[336px]`), restoring telemetry metric cards, expanding the sidebar back to 280px to prevent project title wrapping, and harmonizing sizes across the Diary, Calendar, Notes, and Cards views.

## Files Created, Modified, Deleted, or Moved
- `src/components/kanban/column.tsx` (Modified: restored column width to `w-72 sm:w-[336px]`, `rounded-2xl`, header padding `px-2.5 py-2`, cards container `space-y-3 p-3`, quick-add form `p-3 rounded-2xl`, quick-add button `h-7 px-3`, and standard full-width `Add card` button)
- `src/components/kanban/card.tsx` (Modified: restored card padding to `p-3 sm:p-3.5`, `rounded-xl`, badge font sizes to `text-xs px-2 py-0.5`, retro sticker size to 28px, and date/avatar row gap)
- `src/components/kanban/board.tsx` (Modified: restored header metrics to `h-11 min-w-[7.5rem]` with `text-base font-bold`, search input to `h-9 w-44 rounded-xl`, filter buttons to `h-9 rounded-xl`, and header container to `rounded-2xl p-3 sm:p-3.5`)
- `src/components/project/project-shell.tsx` (Modified: restored sidebar grid from 256px to 280px `lg:grid-cols-[280px_minmax(0,1fr)]`, container width to 280px, padding to `p-4`, and grid gap to `gap-3`)
- `src/app/(dashboard)/project/[id]/board/page.tsx` (Modified: restored board notes rail grid from 280px to 340px `xl:grid-cols-[minmax(0,1fr)_340px]` and grid gap to `gap-3`)
- `src/components/diary/diary-list-panel.tsx` (Modified: rebalanced header card to `rounded-2xl p-4 sm:p-5`, title to `text-xl sm:text-2xl`, metric pills to `h-9 min-w-[6.75rem] rounded-xl px-3` with `text-sm font-bold`, buttons to `h-9 rounded-xl`, notebook sticker to 64px, shelf rail to `20rem` with `p-3.5 sm:p-4`, and checklist panel to `rounded-2xl`)
- `src/components/kanban/project-calendar.tsx` (Modified: restored upcoming collapsible panel width to `w-80` with `p-4` padding)
- `src/components/notes/notes-panel.tsx` (Modified: standardized `Add note` button to `h-9 rounded-lg px-3.5 text-xs font-semibold` matching view mode toggle)

## Important Behavior Changes
- Kanban board columns no longer leave a ~550px blank void on desktop viewports.
- Project sidebar titles such as "Capital One Real Estate" fit cleanly on one line without awkward word breaking.
- Metrics across Kanban and Diary are readable and prominent while preserving the dark lofi retro indigo aesthetic.
- Kanban cards display badges, stickers, and checklists comfortably without claustrophobic multi-line wrapping.

## Database/Schema Changes
- None.

## Verification Commands Run and Results
- `npm run lint`: Passed (0 errors, 0 warnings)
- `npm test`: Passed (61 test files, 279 tests passing)
- `npx prisma validate`: Passed (Prisma schema valid)
- `npm run build`: Passed (All 35 static/dynamic routes compiled and optimized)

## Known Follow-ups, Blockers, or Deployment Notes
- Commit changes and push to `main` for Vercel production deployment.
