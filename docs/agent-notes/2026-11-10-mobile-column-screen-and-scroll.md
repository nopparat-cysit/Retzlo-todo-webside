# 2026-11-10 Mobile Kanban Column Full-Screen Height & Snap Scroll Carousel

## Objective
Address user feedback regarding mobile Kanban columns ("ให้column มะน screen สิ" with screenshot `media_1794302406840_af615c85.png`).
1. Expand mobile column height to fill the screen (Full Screen Height): Previously, empty columns ("Drop a card here.") collapsed to content height (~150px), creating a massive blank void (~40% of the viewport) above the bottom navigation bar.
2. Enable horizontal snap scrolling across columns on mobile (1 screen per column): Previously, inactive columns were hidden with `hidden sm:flex` and `overflow-x-hidden`, forcing users onto a cramped 5-tab strip where titles were truncated into unreadable abbreviations (`In... 0`, `Ne... 0`). Now, users can swipe left/right between columns naturally, and the tab strip smoothly scrolls without truncating column titles.

## Files Created, Modified, Deleted, or Moved
- Modified: `src/components/kanban/board.tsx`
- Modified: `src/components/kanban/column.tsx`
- Modified: `docs/theme-system.md`
- Created: `docs/agent-notes/2026-11-10-mobile-column-screen-and-scroll.md`

## Important Behavior Changes
1. **Vertical Height Expansion (`src/components/kanban/column.tsx`):**
   - Added `flex-1` to the outer `<section>` and inner wrapper `<div>` of each column.
   - Configured the card drop zone (`[data-card-zone]`) to use `flex-1 flex flex-col`.
   - Updated the empty drop zone (`totalCards === 0`) with `flex-1 flex flex-col items-center justify-center min-h-[160px]`, ensuring empty columns stretch smoothly to fill the screen rather than collapsing to an awkward 60px box.
   - Pinned the quick-add form at the bottom with `shrink-0`.
   - Set the desktop column resize handle to `hidden sm:flex` to prevent touch gesture conflicts with horizontal swiping on mobile screens.

2. **Full-Screen Horizontal Snap Scroll (`src/components/kanban/board.tsx`):**
   - Removed `hidden sm:flex` and enabled `overflow-x-auto pb-1 snap-x snap-mandatory` on mobile.
   - Rendered each column on mobile as an adaptive full-screen carousel item:
     `flex flex-col flex-1 h-full min-h-0 w-[calc(100vw-1.5rem)] sm:flex-none sm:w-auto sm:shrink-0 shrink-0 snap-center`.
   - Connected `handleColumnsScroll` to track horizontal scrolling in real-time and smoothly bring the active tab into view (`tabEl?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })`).
   - Tapping any tab smoothly scrolls the columns container directly to that column (`columnEl?.scrollIntoView({ behavior: "smooth", inline: "center" })`).

3. **Horizontal Scrollable Tab Strip (`src/components/kanban/board.tsx`):**
   - Added `overflow-x-auto scrollbar-none` to the segmented tab strip.
   - Styled tab buttons with `shrink-0 whitespace-nowrap px-2.5 py-1.5`, completely eliminating title truncation (`In... 0`, `Ne... 0` -> "Inbox", "Needs Review", "In Progress", "Waiting", "Done").

## Database/Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/kanban/` (145/145 tests passed across 18 test files)
- `npm run lint` (0 errors, 0 warnings)
- `npx prisma validate` (Prisma schema is valid)
- `npm run build` (Next.js production build succeeded, 43/43 pages generated)

## Known Follow-ups, Blockers, or Deployment Notes
- None.
