# 2026-10-05 — Use a standard Story Points icon

- Objective: Replace the custom bitmap lightning icon used for Story Points with the standard Lucide `Zap` icon.
- Files modified: `src/components/kanban/card-modal.tsx`, `src/components/kanban/card.tsx`, `src/components/kanban/column.tsx`, `src/components/kanban/board-list-view.tsx`, `src/components/kanban/board.tsx`, `src/components/kanban/board-attributes-tab.tsx`, and `src/components/kanban/card-attributes-edit-modal.tsx`.
- Behavior: Story Points headings, choices, badges, totals, settings, and sort options now use a consistent outline icon. Scores and selection behavior are unchanged.
- Database/schema: None.
- Verification: `npm run lint`, `npm run build`, and `npx prisma validate` all passed.
- Follow-ups: None.
