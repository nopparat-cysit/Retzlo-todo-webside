# 2026-06-21 - Board column settings

## Objective

Add editable board column settings with persistent color and icon metadata, plus safe column deletion.

## Files Created

- `src/app/api/columns/[columnId]/route.ts`
- `src/components/kanban/column-icon-picker.tsx`
- `src/lib/kanban/column-settings.ts`
- `src/lib/kanban/column-settings.test.ts`

## Files Modified

- `prisma/schema.prisma`
- `src/app/(dashboard)/project/[id]/board/page.tsx`
- `src/app/api/columns/route.ts`
- `src/components/kanban/board.tsx`
- `src/components/kanban/column.tsx`
- `src/types/kanban.ts`

## Behavior Changes

- Columns now have persistent `color` and `icon` settings with defaults for existing data.
- Create Column can set a column name, color, and icon.
- Board column headers now display the selected icon before the column name.
- Each column has a settings button that opens a modal for editing name, color, and icon.
- Column icon selection uses a reusable scrollable `ColumnIconPicker` component.
- Columns can be deleted only when empty. Non-empty columns show a warning and keep delete disabled.
- Column deletion compacts remaining column positions after the deleted column.

## Database Changes

- Added `Column.color String @default("default")`.
- Added `Column.icon String @default("kanban")`.
- Ran `npx prisma db push` to sync the configured PostgreSQL database schema.

## Design-System Impact

- No shared UI primitives or Tailwind tokens were changed.
- The new column theme/icon constants are scoped to Kanban column settings and do not affect unrelated pages.

## Verification

- `npm test -- src/lib/kanban/column-settings.test.ts` passed.
- `npx prisma validate` passed.
- `npx prisma generate` passed.
- `npm run lint` passed after the final board page mapping fix.
- `npx prisma db push` completed successfully.
- `npm run build` passed.

## Follow-ups

- Consider adding a move-cards flow before delete if users want to delete non-empty columns without manually moving cards first.
