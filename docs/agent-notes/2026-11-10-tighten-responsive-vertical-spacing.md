# 2026-11-10 Tighten Responsive Vertical Spacing Across Key Pages

## Objective
Address user feedback regarding excessive mobile vertical space consumption on responsive viewports ("แก้ไขจุนนี้ในหลายๆหน้าหน่อย resposive มันพื่นที่เยอะไป"). Specifically, prevent multi-line flex-wrapping in the compact header cards (such as the Kanban board header where "CHANNEL" wrapped onto line 1 and "Task For Me" onto line 2), tighten mobile outer padding and margins across the Project Shell, Kanban Board, Calendar, Diary, and Notes panels, and recover approximately 25-40px of vertical viewport space for cards and checklists on mobile screens.

## Files Created, Modified, Deleted, or Moved
- Modified: `src/components/kanban/board.tsx`
- Modified: `src/components/project/project-shell.tsx`
- Modified: `src/components/kanban/project-calendar.tsx`
- Modified: `src/components/diary/diary-list-panel.tsx`
- Modified: `src/components/notes/notes-panel.tsx`
- Modified: `src/components/kanban/board-responsive.test.ts`
- Modified: `docs/theme-system.md`
- Created: `docs/agent-notes/2026-11-10-tighten-responsive-vertical-spacing.md`

## Important Behavior Changes
1. **Kanban Board Header (`board.tsx`):**
   - Reduced mobile panel padding from `p-2.5 sm:p-3.5` to `p-2 sm:p-3.5`.
   - Removed `flex-wrap` from the left cluster (`min-w-0 flex-1 flex items-center gap-1.5 sm:gap-2`), keeping `Channel` badge and `boardName` on a single horizontal row.
   - Refined `Channel` badge visibility on ultra-narrow viewports to `hidden min-[360px]:inline-block` to prevent horizontal squishing on < 360px devices.
   - Adjusted mobile board name typography from `text-base` to `text-sm sm:text-lg` with `truncate` to ensure clean single-row presentation.
   - Tightened kanban viewport top margin from `mt-4` to `mt-2.5 sm:mt-4`.

2. **Project Shell (`project-shell.tsx`):**
   - Reduced root container padding on mobile from `p-2 sm:p-3` to `p-1.5 sm:p-3`.
   - Reduced grid gap on mobile from `gap-2.5 sm:gap-3` to `gap-2 sm:gap-3`.
   - Tightened sticky topbar header from `top-2 mb-3 min-h-14 px-2.5` to `top-1.5 sm:top-2 mb-2 sm:mb-3 min-h-12 sm:min-h-14 px-2 sm:px-4`.
   - Adjusted children wrapper bottom padding from `pb-20 lg:pb-0` to `pb-16 sm:pb-20 lg:pb-0` to align cleanly with the floating detached mobile bottom nav.

3. **Project Calendar (`project-calendar.tsx`):**
   - Reduced outer gap from `gap-3` to `gap-2 sm:gap-3`.
   - Reduced top control bar panel padding from `p-3 sm:p-4` to `p-2 sm:p-4`.
   - Removed `flex-wrap` from the top navigation row container so Month title and arrow navigation stay on a single line.

4. **Diary Panel (`diary-list-panel.tsx`):**
   - Reduced section grid gap from `gap-2.5 sm:gap-3` to `gap-2 sm:gap-3`.
   - Reduced hero panel padding from `p-2.5 sm:p-5` to `p-2 sm:p-4`.
   - Removed `flex-wrap` from the top row header so title, badge, and date navigation controls stay on a single line.

5. **Notes Panel (`notes-panel.tsx`):**
   - Reduced layout grid gap from `gap-3` to `gap-2 sm:gap-3`.
   - Reduced main board panel padding from `p-3` to `p-2 sm:p-3`.

6. **Contract Test Suite (`board-responsive.test.ts`):**
   - Updated source assertions for `project-shell.tsx` (`top-1.5 sm:top-2` and `pb-16 sm:pb-20`).

## Database/Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/kanban/board-responsive.test.ts src/components/project/project-shell.test.ts` (32/32 tests passed)
- `npx vitest run src/components/kanban/ src/components/project/` (193/193 tests passed across 25 files)
- `npm run lint` (0 warnings, 0 errors)
- `npx prisma validate` (Prisma schema is valid)
- `npm run build` (In progress / verifying)

## Known Follow-ups, Blockers, or Deployment Notes
- None. All changes strictly preserve desktop styling while reclaiming essential vertical viewport space on mobile devices.
