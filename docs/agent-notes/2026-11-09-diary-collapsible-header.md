# 2026-11-09 - Diary Collapsible Header Toolbar

## Objective
Implement collapsible header tools for the Diary page matching the collapsible toolbar patterns in Kanban Board and Notes, maximizing vertical screen real estate for checklist items on mobile viewports.

## Files Created, Modified, Deleted, or Moved
- `src/components/diary/diary-list-panel.tsx`:
  - Added `isToolsCollapsed` state with `localStorage` persistence (`retzlo_diary_${projectId}_tools_collapsed`).
  - Set default collapse to `true` on mobile screens (`window.innerWidth < 768`) and restored saved desktop state.
  - Added always-visible compact top row containing the title, `< Today >` navigation, inline `DatePicker`, clickable quick status summary pill (`Due {dueTodayCount} • Done {completedTodayCount}` when collapsed), `+ Add diary` button, and the animated `SlidersHorizontal` + `ChevronDown` collapse toggle button.
  - Wrapped secondary hero elements (Due/Done/Starred metric cards, Calendar navigation button, description text, retro sticker) in a smooth CSS grid collapsible container (`grid-rows-[1fr]` to `grid-rows-[0fr]`).
- `src/components/diary/diary-list-panel.test.ts`: Added test assertions verifying `isToolsCollapsed`, `toggleToolsCollapse`, `retzlo_diary_`, `grid-rows-[0fr]`, and `grid-rows-[1fr]`.

## Important Behavior Changes
- On mobile devices, the Diary header now auto-collapses to a compact single row, freeing up substantial vertical viewport space for rituals and checklists.
- Users can toggle the tools open/closed at any time using the "Tools" / "Hide" button or tapping the quick summary pill.
- User preference persists across page reloads via localStorage.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/diary/diary-list-panel.test.ts src/components/kanban/board-responsive.test.ts`: Passed (22/22 tests passing).
- `npx vitest run src/lib/diary/checklist.test.ts src/lib/diary/recurrence.test.ts`: Passed (29/29 tests passing).
- `npx prisma validate`: Passed (schema valid).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Passed (Next.js 14 production build completed successfully).

## Known Follow-ups, Blockers, or Deployment Notes
- None. Ready for deployment.
