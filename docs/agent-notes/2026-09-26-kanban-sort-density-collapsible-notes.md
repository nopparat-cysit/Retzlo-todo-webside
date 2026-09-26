# 2026-09-26 Kanban Sort, Density Toggle & Collapsible Notes Rail

## Objective
Implement Kanban card sorting by Story Points (Difficulty) and Priority, add card density modes (comfortable vs compact) to prevent cards from being too large, streamline the board header, and make the Notes sidebar collapsible so the board area expands to 100% full width when notes are closed.

## Files Created, Modified, Deleted, or Moved
- **Created**:
  - `src/components/kanban/board-view-container.tsx`: Client container managing collapsible Notes state and card density mode (`comfortable` vs `compact`) with local storage persistence.
  - `src/lib/kanban/card-sort.ts`: Pure sorting helper for Kanban cards supporting Manual, Story Points (High→Low, Low→High), Priority (High→Low, Low→High), and Due Date.
  - `src/lib/kanban/card-sort.test.ts`: Vitest suite covering all sorting options and stable tie-breaking.
  - `docs/agent-notes/2026-09-26-kanban-sort-density-collapsible-notes.md`: This work note.
- **Modified**:
  - `src/app/(dashboard)/project/[id]/board/page.tsx`: Swapped hardcoded 2-column grid layout for `BoardViewContainer` while preserving the `.board-page-grid` styling hook.
  - `src/components/notes/board-notes-rail.tsx`: Added `onClose` callback prop and close panel button (`PanelRightClose`) in header.
  - `src/components/kanban/card.tsx`: Added `density` prop. In `compact` mode, hides multiline description on card surface, shrinks stickers to 18px, and condenses meta badges to reduce card height by >60%. Clamped comfortable description to 2 lines max.
  - `src/components/kanban/column.tsx`: Forwarded `density` prop to cards, tightened spacing in compact mode (`space-y-1.5` vs `space-y-2.5`), and set responsive column widths.
  - `src/components/kanban/board.tsx`: Integrated `cardSort` state with `sortCards`, streamlined header into 2 compact rows, added density toggle button and collapsible notes button with count badge, and restored focus mode interactive badge.

## Important Behavior Changes
- **Sorting Options**:
  - Users can sort columns on demand by Story Points (8→1 or 1→8), Priority (High→Low or Low→High), or Due Date.
  - Selecting a sort option preserves drag-and-drop capability.
  - 1-click reset button returns columns to manual order.
- **Card Density Modes**:
  - `Comfortable` (default): Shows badges, truncated 2-line description, stickers, assignees, and checklist progress.
  - `Compact`: Removes descriptions from card face, shrinks stickers to mini 18px, tightens padding, lowering card height to ~55-65px for scanning many cards quickly.
  - Mode is saved in `localStorage["kanban_card_density"]`.
- **Collapsible Notes & Board Width**:
  - Notes panel is collapsed by default, giving the Kanban board 100% full width and freeing 340px horizontal space.
  - Clicking the "Notes" toggle button in the header slides out the notes panel.
  - State is saved in `localStorage["kanban_notes_open"]`.
- **Streamlined Board Header**:
  - Stat counters are presented as sleek inline pills in the control bar, saving ~60px vertical height.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run`: Passed (66 test files, 320 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (Production build compiled cleanly with all routes generated).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
