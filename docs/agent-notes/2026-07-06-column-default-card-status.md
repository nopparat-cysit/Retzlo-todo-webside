# 2026-07-07 - Column default card status

## Objective
Use an explicit column-level default card status as the source of truth for kanban card status updates instead of inferring status from column names or board position.

## Files created
- `prisma/migrations/20260706180000_add_column_default_card_status/migration.sql`
- `src/components/kanban/column-status-picker.tsx`
- `docs/agent-notes/2026-07-06-column-default-card-status.md`

## Files modified
- `prisma/schema.prisma`
- `src/app/(dashboard)/project/[id]/board/page.tsx`
- `src/app/api/cards/reorder/route.ts`
- `src/app/api/columns/[columnId]/route.ts`
- `src/app/api/columns/route.ts`
- `src/app/api/projects/route.ts`
- `src/components/kanban/board.tsx`
- `src/components/kanban/card-interaction.test.ts`
- `src/components/kanban/column.tsx`
- `src/lib/kanban/column-settings.test.ts`
- `src/lib/kanban/column-settings.ts`
- `src/lib/kanban/reorder.test.ts`
- `src/lib/kanban/reorder.ts`
- `src/types/kanban.ts`

## Behavior changes
- Columns now have `defaultCardStatus` with supported values `TODO`, `DOING`, `WAITING`, and `DONE`.
- New default project columns are created with Backlog -> `TODO`, In Progress -> `DOING`, and Done -> `DONE`.
- New and edited columns can choose the default card status in the column UI.
- Quick-add cards inherit the column default status.
- Dragging a card into a column optimistically updates the moved card status to the destination column default status.
- `/api/cards/reorder` updates the moved card status from `destinationColumn.defaultCardStatus` and no longer infers Done from column name or last position.
- Done payout and completion celebration now trigger only when moving into a destination column whose default status is `DONE`.

## Database/schema changes
- Added `Column.defaultCardStatus String @default("TODO")`.
- Added migration SQL to add the column and backfill existing default lane names; custom/other columns default to `TODO`.
- Applied the migration SQL to the configured database with `prisma db execute` after `prisma migrate deploy` returned an empty `Schema engine error`.
- Marked `20260706180000_add_column_default_card_status` as applied with `prisma migrate resolve`.

## Verification
- `npm test -- src/lib/kanban/column-settings.test.ts` - passed (4 tests).
- `npm test -- src/lib/kanban/reorder.test.ts` - passed (3 tests).
- `npm test -- src/components/kanban/card-interaction.test.ts` - passed (5 tests).
- `npx prisma validate` - passed.
- `npx prisma generate` - passed.
- `.\node_modules\.bin\tsc.cmd --noEmit` - passed.
- `npm run lint` - passed with no ESLint warnings or errors.
- `npm run build` - passed; production build completed successfully.
- `npx prisma migrate deploy` - failed with `Schema engine error` and no additional detail.
- `npx prisma db execute --file prisma/migrations/20260706180000_add_column_default_card_status/migration.sql --schema prisma/schema.prisma` - passed; script executed successfully.
- `npx prisma migrate resolve --applied 20260706180000_add_column_default_card_status` - passed.
- `npx prisma migrate status` - passed; database schema is up to date.

## Known follow-ups
- None for the configured database; future environments should run the checked-in migration normally.