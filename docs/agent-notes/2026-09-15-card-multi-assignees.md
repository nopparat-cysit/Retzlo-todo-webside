# 2026-09-15 Card Multi-Assignees

## Objective

Implement multi-assignee support for Kanban cards allowing users to assign one or multiple project members to a card, view assignee avatar stacks on the board, and filter cards by assignee in the toolbar.

## Files changed

- Created `src/lib/kanban/assignees.ts`: Helper utilities (`extractAssigneeIds`, `withAssignees`, `resolveAssignees`, `filterCardsByAssignee`).
- Created `src/lib/kanban/assignees.test.ts`: 14 unit tests covering sanitization, deduplication, filtering, and mapping.
- Created `src/components/kanban/assignee-avatar.tsx`: `AssigneeAvatar` and `AssigneeStack` components with retro lo-fi palette, image fallback, and tooltips.
- Created `src/components/kanban/assignee-picker.tsx`: Multi-select assignee popover with search filter, active chips, and quick toggle.
- Created `src/app/api/projects/[id]/members/route.ts`: Endpoint returning project members with authorization checks.
- Modified `src/types/kanban.ts`: Added `CardAssignee`, `assigneeIds?: string[]`, and `assignees?: CardAssignee[]` to `Card`.
- Modified `src/app/api/cards/route.ts`: Extended Zod schemas (`createCardSchema`, `updateCardSchema`) with `assigneeIds`, storing within `privateCoins` JSON for DB safety, serialized in responses.
- Modified `src/components/kanban/card-modal.tsx`: Added `AssigneePicker`, `assigneeIds` state, auto-draft saving/recovery, and form payload submission.
- Modified `src/components/kanban/card.tsx`: Renders `AssigneeStack` on card surface, forwards members to modal, resolves assignees on save.
- Modified `src/components/kanban/column.tsx`: Passes `members` to `KanbanCard` and creation `CardModal`.
- Modified `src/components/kanban/board.tsx`: Added toolbar Assignee filter dropdown and passed `members` to `KanbanColumn`.
- Modified `src/app/(dashboard)/project/[id]/board/page.tsx`: Fetches project members in server component `Promise.all` and passes to `KanbanBoard` and `toColumns`.
- Created `docs/agent-notes/2026-09-15-card-multi-assignees.md`: Change note.

## Behavior changes

- Users can open `CardModal` (in both Create and Edit mode) and choose any number of project members as assignees.
- Quick search and chip removal inside the assignee picker.
- Card items on the Kanban board display the assignee avatar stack next to the due date.
- Board toolbar now features an Assignee filter dropdown ("All Assignees", "Unassigned", or specific project members) with a one-click clear button.
- Auto-draft and draft recovery persist selected `assigneeIds`.

## Database/schema changes

- None. Assignee IDs are stored securely inside the existing `privateCoins` JSON column to prevent remote PostgreSQL schema conflicts and migration downtime.

## Verification

- `npx vitest run src/lib/kanban/assignees.test.ts`: 14/14 tests passed (100%).
- `npx vitest run`: 50 test files, 200 tests passed (100%).
- `npm run lint`: Passed with no warnings or errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Production build succeeded cleanly.

## Follow-ups

- None. Ready for use.
