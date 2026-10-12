# Kanban Column Resizing & AI Chat Left-Offset Coordination

## Date & Objective
- **Date**: 2026-10-12
- **Objective**: 
  1. Implement horizontal X-axis column resizing for Kanban boards with min (260px) and max (600px) width constraints, visual grab handle with grip dots, width tooltip, and `localStorage` persistence.
  2. Resolve floating overlap collision between the AI Chat widget (`Retzlo AI`) and the Star FAB Hub display panel by keeping the FAB grounded at the bottom when opened and shifting the floating AI Chat to the left (`sm:right-[calc(24rem+2rem)]`).
  3. Clean up card compact badges and Activity Log drawer header padding.

## Files Created
- [`src/components/kanban/column-resize.test.ts`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/column-resize.test.ts): Unit tests verifying width boundaries (260px - 600px), drag event handling, double-click reset, and localStorage persistence.

## Files Modified
- [`src/components/kanban/column.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/column.tsx):
  - Added horizontal column resizing state (`columnWidth`, `isResizing`) clamped to `MIN_COLUMN_WIDTH = 260px` and `MAX_COLUMN_WIDTH = 600px` with default `335px`.
  - Added interactive resize handle on the right edge with hover guide line, centered pill with grip dots, width badge tooltip during drag, and double-click to reset.
  - Added `localStorage` persistence per column (`column-width-${column.id}`).
  - Disabled transitions while resizing (`transition-none`) for silky smooth 60fps responsiveness.
- [`src/components/ai/ai-chat-context.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/ai/ai-chat-context.tsx):
  - Added `isFabOpen` state and `setIsFabOpen` setter to `AiChatContext` to allow floating panels to coordinate positioning.
- [`src/components/hub/fab-hub.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/hub/fab-hub.tsx):
  - Connected `isOpen` state to `setIsFabOpen`.
  - Kept the FAB container grounded at `bottom-4 sm:bottom-6` when open rather than displacing upward 560px into the ceiling/topbar.
  - Removed artificial top-squish (`compactTop`) when open so the pinned panel expands naturally.
- [`src/components/ai/ai-chat-widget.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/ai/ai-chat-widget.tsx):
  - Shifted floating AI chat to the left (`sm:right-[calc(24rem+2rem)]`) when `isFabOpen` is true so both widgets sit side-by-side without obstruction.
- [`src/components/ai/ai-chat-responsive-layout.test.ts`](file:///c:/Users/Nopparat/Documents/Todo/src/components/ai/ai-chat-responsive-layout.test.ts):
  - Added regression test for left displacement when FAB is open.
- [`src/components/kanban/board-activity-drawer.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/board-activity-drawer.tsx):
  - Replaced invalid Tailwind `p-4.5` with `px-5 py-4` and unified horizontal margins.
- [`src/components/kanban/assignee-avatar.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/assignee-avatar.tsx):
  - Added `showName?: boolean` (default `false`) to `AssigneeStackProps` to prevent raw user names from wrapping card badges into multiple rows.
- [`src/components/kanban/card.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/card.tsx):
  - Replaced invalid Tailwind classes `h-4.5 w-4.5` and `py-0.2` with `h-[18px] w-[18px]` and `py-0.5`.

## Important Behavior Changes
- **X-Axis Column Resizing**: Users can now hover over the right border of any expanded Kanban column to reveal the resize handle, click and drag left/right to resize the column between 260px and 600px, or double-click to instantly reset to the default 335px. Width preferences persist across sessions.
- **AI Chat & FAB Hub Avoidance**: When opening the Star FAB pinned display panel, Retzlo AI now smoothly slides to the left so both panels remain completely visible without clipping through the top of the browser.
- **Card Badge Compactness**: Single assignees now render as uniform circular avatar pills instead of raw text labels, eliminating unwanted line breaks on compact cards.

## Database & Schema Changes
- None (UI & client-state functionality).

## Verification Commands & Results
- `npx tsc --noEmit`: Passed with 0 errors.
- `npx vitest run`: 95 test suites passed, 498 tests passed, 0 failures.
- `npm run lint`: Passed with 0 warnings and 0 errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Production build succeeded across all 40 routes.

## Known Follow-ups & Blockers
- None.
