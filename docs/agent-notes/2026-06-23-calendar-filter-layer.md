# Calendar filter stacking fix

- Date: 2026-06-23
- Objective: Keep the Calendar filter dropdown above calendar day cells.
- Modified: `src/components/kanban/project-calendar.tsx`.
- Created: `src/components/kanban/project-calendar.test.ts`.
- Behavior changes: The Calendar toolbar now owns a higher stacking context, so its filter dropdown is painted above the later calendar grid.
- Root cause: Shared `.lofi-panel > *` styling gives each direct child `z-index: 1`; the later calendar grid therefore painted above the toolbar's nested dropdown. The toolbar uses an explicit important layer to override that shared rule.
- Shared design-system impact: None. The shared `lofi-panel` rule was not changed; the override is scoped to Calendar.
- Database/schema changes: None.
- Design follow-up: Approved Reward-style Calendar implementation is planned in `docs/superpowers/plans/2026-06-23-calendar-reward-sticker.md` and will remain scoped to the Calendar feature.

## Reward-style Calendar implementation

- Modified: `src/components/kanban/project-calendar.tsx`, `src/components/kanban/project-calendar.test.ts`, `src/lib/calendar/view.ts`, and `src/lib/calendar/view.test.ts`.
- Created: `docs/superpowers/plans/2026-06-23-calendar-reward-sticker.md`.
- Visual changes:
  - Added the Reward-style Calendar hero, visible-range metrics, and restrained RetroD sticker accents.
  - Reorganized navigation and filter controls into a responsive toolbar while preserving the filter stacking fix.
  - Kept weekday labels and day cells in one horizontal scroll surface on narrow screens.
  - Rebuilt Upcoming as a responsive sticker rail with matching empty and supporting states.
- Behavior changes: Summary metrics now count visible filtered items, unique visible focus days, and completed visible cards. Existing date navigation, views, filtering, card editing, note opening, and item limits remain intact.
- Shared design-system impact: None. No shared component or token was changed; all presentation changes are scoped to `ProjectCalendar`.
- Layout revision: The approved Calendar hero direction changed to a compact single-row desktop layout with the sticker fixed at the far right and no oversized empty area.
- Compact viewport revision:
  - The Calendar wrapper now uses a fixed-height grid instead of page-level vertical scrolling.
  - The hero is a compact single-row layout on desktop with title copy on the left, metrics in the middle, and the ring-planet sticker as the far-right flex item.
  - Calendar grid and Upcoming rail overflow inside their own panels when content exceeds available height, so the page frame stays in one viewport.
  - Added a source-contract test to guard against returning to the oversized absolute-sticker hero.
- Database/schema changes: None.
- Final verification:
  - `npm test -- src/lib/calendar/view.test.ts src/components/kanban/project-calendar.test.ts`: passed (11/11).
  - `npm run lint`: passed with no warnings or errors.
  - `npx prisma validate`: passed.
  - `npm run build`: blocked by `EPERM` while `prisma generate` tried to rename the Prisma query engine DLL, likely because the running dev server or another Node process is holding the file. This is not recorded as a pass.
  - `git -c safe.directory=C:/Users/Nopparat/Documents/Todo diff --check`: no whitespace errors; Git reported LF-to-CRLF warnings for existing working-copy files.
  - `git -c safe.directory=C:/Users/Nopparat/Documents/Todo status --short --branch`: branch is ahead of origin by 2 and the worktree still contains multiple pre-existing dirty files plus the Calendar files from this session.
  - Live visual verification remains blocked until the stale dev server and `.next` cache are restarted.
- Verification:
  - `npm test -- src/components/kanban/project-calendar.test.ts`: failed before the fix and passed after it (1/1).
  - `npm run lint`: passed.
  - `npx prisma validate`: passed.
  - `npm run build`: blocked by `EPERM` while the running dev server held the Prisma engine file.
  - `.\\node_modules\\.bin\\next.cmd build`: blocked by `EPERM` on the running dev server's `.next/trace` file.
  - `.\\node_modules\\.bin\\tsc.cmd --noEmit`: blocked by pre-existing stale test fixtures in `reorder.test.ts` and `shared-icon-options.test.ts`; no error referenced the Calendar change.
  - Browser verification: blocked by the stale dev server cache (`Cannot find module './9276.js'`). Restart the dev server before visual verification.
