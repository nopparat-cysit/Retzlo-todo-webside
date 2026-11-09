# Fix Overdue Filter Badge Centering and Separation

## Date and Objective
- Date: 2026-11-09
- Objective: Fix the sunken / misaligned badge and text alignment on the Overdue filter button (`overdueCards`) on the Kanban board page so the task count number is vertically centered and does not blend into the red button border and background.

## Files Modified
- `src/components/kanban/board.tsx`
- `src/components/kanban/board-switch-skeleton.test.ts`
- `docs/theme-system.md`

## Important Behavior Changes
- **Overdue Indicator Badge on Board Control Bar (`board.tsx`)**:
  - Replaced the nested `-top-1 -right-1` badge with elevated `-top-1.5 -right-1.5 z-10` placement.
  - Added `ring-2 ring-white dark:ring-ink-950` separation border so the red badge never sinks or merges into the red button border and background.
  - Applied `inline-flex h-4.5 min-w-[18px] items-center justify-center leading-none text-[10px] font-bold font-mono text-white select-none` to guarantee vertical centering and eliminate baseline glyph drop of monospace numbers.
- **Overdue Indicator Badge when Tools are Collapsed (`board.tsx`)**:
  - Replaced `-top-1 -right-1` with `-top-1.5 -right-1.5 z-10`.
  - Added `ring-2 ring-white dark:ring-ink-950` separation ring.
  - Upgraded typography from `text-[7px]` to `inline-flex h-4 min-w-4 text-[9px] font-bold font-mono leading-none` for clarity and vertical centering.
- **Contract Tests (`board-switch-skeleton.test.ts`)**:
  - Added test assertions verifying overdue badge offset (`-top-1.5 -right-1.5 z-10`), contrast separation ring (`ring-2 ring-white dark:ring-ink-950`), and `leading-none` vertical alignment.

## Database / Schema Changes
- None.

## Verification Commands Run and Result
- `npx vitest run src/components/kanban/`: Passed (17 test files, 128 tests passed).
- `npx vitest run src/components/kanban/board-switch-skeleton.test.ts`: Passed (4 tests passed).
- `npm run lint`: Passed (`✔ No ESLint warnings or errors`).
- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid`).
- `npm run build`: Passed (Next.js production build succeeded with 43/43 routes).

## Known Follow-ups, Blockers, or Deployment Notes
- None. Ready for production deployment.
