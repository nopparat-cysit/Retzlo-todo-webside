# 2026-11-09 Collapsible Board and Notes Tools for Responsive Mobile Viewports

## Objective
Implement collapsible toolbars for both Kanban Board and Notes Panel with local storage persistence and mobile auto-collapse defaults. Hide the Note Studio hero banner on mobile (< md) viewports and enable active column tracking in the mobile quick-jump navigation strip to maximize vertical card reading space on mobile devices.

## Files Modified
- `src/components/kanban/board.tsx`:
  - Added `isToolsCollapsed` state with `localStorage` persistence (`retzlo_board_${board.id}_tools_collapsed`), defaulting to collapsed on viewport width < 768px.
  - Implemented always-visible compact single-row header: channel tag, board title (inline editable), focus badge, active filter pill indicator (`Filtered [count] ["query"]`), overdue clock indicator, mobile `+ Column` button, and `[Tools v]` toggle button.
  - Wrapped board controls (Board/Table switcher, card density 2x toggle, stats bar, overdue indicator, mobile filters toggle, AI summary, Notes toggle, export button, and actions dropdown) and filter strip (Today, My Tasks, Assignees dropdown, Sort dropdown, Clear filters, Undo, desktop Column button) inside a CSS grid collapse animation wrapper (`grid-rows-[0fr]` to `grid-rows-[1fr]`, `transition-all duration-300`).
  - Implemented `activeMobileColumnId` state and `handleColumnsScroll` attached to the columns scroll container, highlighting the centered column in the mobile quick-jump pill strip.
- `src/components/notes/notes-panel.tsx`:
  - Added `hidden md:block` to Note Studio hero card and adjusted section grid template (`grid-rows-[1fr] md:grid-rows-[max-content_minmax(0,1fr)]`) to eliminate mobile header crowding.
  - Added `isToolsCollapsed` state with `localStorage` persistence (`retzlo_notes_${projectId}_tools_collapsed`), defaulting to collapsed on mobile (< 768px).
  - Implemented compact always-visible top row: view icon and label, filter pill indicator, `+ Add note` button, and `[Tools v]` toggle button with `SlidersHorizontal` icon and rotating chevron.
  - Wrapped search input, view mode switcher (2, 3, 4, List), folder pills, sort dropdown, and board scope dropdown inside smooth collapsible container (`grid-rows-[0fr]` to `grid-rows-[1fr]`).
- `src/components/kanban/board-responsive.test.ts`:
  - Added unit test verifying collapsible tools state, toggle, persistence key, grid-row classes, and active filter indicator.
  - Added unit test verifying active mobile column tracking and highlight classes in quick-jump navigation.
- `src/components/notes/notes-panel.test.ts`:
  - Updated compact layout expectation for mobile responsiveness.
  - Added unit test verifying Note Studio hero is hidden on mobile (`hidden md:block`).
  - Added unit test verifying collapsible tools with persistence in Note board.

## Behavior Changes
- Kanban Board header height on mobile is reduced from ~240px down to ~44px when tools are folded, liberating ~200px (+43%) of vertical screen space for task cards.
- Clicking `Tools` smoothly animates open all board controls, view switches, filters, and actions.
- Active filters remain visibly acknowledged even while collapsed via an interactive amber chip that re-opens tools when clicked.
- Horizontal column scrolling on mobile dynamically highlights the current active column pill in the quick-jump bar.
- Note Studio hero banner is hidden on mobile screens, displaying only the compact note board with collapsible search, view switches, and folder pills.

## Database / Schema Changes
- None.

## Verification
- Unit Tests: `npx vitest run src/components/kanban/board-responsive.test.ts src/components/notes/notes-panel.test.ts` (23 passed out of 23).
- Prisma: `npx prisma validate` (passed).
- Lint: `npm run lint` (0 warnings, 0 errors).
- Build: `npm run build` (compiled successfully, 43 static/dynamic routes generated).

## Deployment Notes
- Ready for deployment to Vercel via `git push origin main`.
