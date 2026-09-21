# Work Note: System-Wide Scale & Density Optimization

- **Date:** 2026-09-21
- **Objective:** Optimize scale, spacing, and information density across the entire system (Kanban board, Diary, Calendar, Notes, Navigation rails, and Cards) to eliminate bulky vertical padding, reclaim viewport real estate, and enable 4–5 Kanban columns on 1080p displays without horizontal scroll.

## Files Modified
- `src/components/diary/diary-list-panel.tsx`:
  - Streamlined `Today rhythm` hero banner to a single-tier horizontal header on desktop (`p-3 sm:p-3.5`), reducing height from ~140px to ~64px (saving 76px of vertical height).
  - Scaled `DiaryMetric` pills to compact `h-8 min-w-[5.75rem]` with `text-xs font-mono font-bold`.
  - Harmonized shelf rail width from `22rem` (352px) to `17.5rem` (280px) and item padding from `p-3` to `p-2.5`, reclaiming 72px horizontal space for the checklist.
- `src/components/kanban/column.tsx`:
  - Reduced column width from `w-72 sm:w-[336px]` to `w-[270px] sm:w-[280px]`, reclaiming 56px per column and fitting 4 columns on 1080p screens with the Notes rail open.
  - Streamlined column header padding to `px-2 py-1.5` and quick-add form/buttons to `h-8` and `h-7`.
- `src/components/kanban/board.tsx`:
  - Scaled board header metric boxes from `h-11 min-w-[7.5rem]` (44px) down to `h-8.5 min-w-[6.25rem]` (34px) with `text-sm font-bold`.
  - Compacted filter bar controls (Search `h-8.5 w-40`, Today `h-8.5`, My Tasks `h-8.5`, Select `h-8.5`, Undo `h-8.5`, Add Column `h-8.5`).
- `src/components/kanban/card.tsx`:
  - Adjusted card container padding to `p-2.5`.
  - Converted card badges (Status, Priority, Difficulty, Checklist, Notes) from `text-xs px-2 py-1` to high-density micro-pills (`text-[10px] px-1.5 py-0.5 leading-none`), preventing awkward multi-line badge wrapping.
  - Scaled sticker icons from `28px` (`h-7 w-7`) to `24px` (`h-6 w-6`).
- `src/app/(dashboard)/project/[id]/board/page.tsx`:
  - Harmonized board notes rail layout grid from `xl:grid-cols-[minmax(0,1fr)_340px]` to `xl:grid-cols-[minmax(0,1fr)_280px]`, reclaiming 60px on the board.
- `src/components/kanban/project-calendar.tsx`:
  - Harmonized upcoming panel from `w-80` (320px) to `w-[280px]` with `p-3.5`.
- `src/components/project/project-shell.tsx`:
  - Streamlined project sidebar from `280px` to `256px` (`lg:grid-cols-[256px_minmax(0,1fr)]`), reclaiming 24px horizontal space for pages.

## Verification
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm test`: Passed (61 test files, 279 tests passed).
- `npx prisma validate`: Passed (Schema is valid).
- `npm run build`: Passed (All 35 routes compiled successfully).
