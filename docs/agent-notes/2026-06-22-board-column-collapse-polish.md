# 2026-06-22 Board Column Collapse Polish

## Objective

Improve the collapsed Kanban column UI so folded columns no longer appear as tall empty rails.

## Files changed

- Modified `src/components/kanban/column.tsx`
- Modified `src/app/globals.css`
- Created `docs/agent-notes/2026-06-22-board-column-collapse-polish.md`

## Behavior changes

- Collapsed columns now render as compact cards with an expand button, column icon, readable column name, and card count.
- Collapsed columns no longer stretch to the full board height.
- Collapsed column names no longer use vertical rotated text.
- The collapsed column keeps sortable node wiring so the folded state still participates in board layout behavior.

## Shared design-system impact

- Updated global `.column-collapsed-rail` and `.column-collapsed-title` styles.
- Impact is limited to Kanban board collapsed columns because these classes are only used by `src/components/kanban/column.tsx`.

## Database/schema changes

- None.

## Verification

- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` passed.
- After build, the existing dev server returned a Next dev cache `500`; restarted only the Todo dev server processes.
- Confirmed `http://localhost:3000` returns `200 OK` after restarting the dev server.

## Follow-ups

- Visually verify folded columns in the board after a dev refresh.
