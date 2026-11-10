# Agent Work Note: Redesign Kanban Overdue Indicator Pill

- **Date:** 2026-11-10
- **Objective:** Redesign the overdue alert button in the Kanban board header ("ทำดีๆ") into a self-contained, elegant pill chip consistent with Retzlo design language.

## Files Created, Modified, Deleted, or Moved

- `src/components/kanban/board.tsx`:
  - Replaced the square button with floating offset badge in both collapsed tools (`isToolsCollapsed`) and expanded tools headers.
  - Implemented self-contained pill chip (`inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold`).
  - Integrated inline mono count pill (`bg-rose-600 px-1.5 font-mono text-[10px] text-white shadow-2xs`).
- `src/components/kanban/board-switch-skeleton.test.ts`:
  - Updated contract test asserting the self-contained pill chip structure with matching height, label, and inline counter.
- `docs/theme-system.md`:
  - Appended dated entry documenting component design alignment.

## Important Behavior Changes

- The overdue indicator in both collapsed and expanded states now renders as a refined pill button (`[ ⏰ Overdue 1 ]`), matching the aesthetic of Calendar's `Upcoming` chip and Diary's `Due` chips.
- The badge no longer has floating negative margins (`-top-1.5 -right-1.5`) or black ring outlines (`dark:ring-ink-950`), completely eliminating any risk of clipping by `overflow-hidden` containers and providing a clean, professional aesthetic.
- Clicking the pill filters cards by Today/Overdue as before.

## Database / Schema Changes

- None.

## Verification Commands Run & Results

- `npx vitest run src/components/kanban/board-switch-skeleton.test.ts` — 4/4 passed.
- `npx vitest run src/components/kanban/` — 145/145 passed across 18 test files.
- `npm run lint` — Clean (0 errors, 0 warnings).
- `npx prisma validate` — Valid.
- `cmd.exe /c "npm run build"` — Succeeded (43/43 routes compiled).

## Known Follow-ups, Blockers, or Deployment Notes

- None.
