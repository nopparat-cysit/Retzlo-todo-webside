# Column Card Limit (WIP Limit) Configuration

- **Date**: 2026-09-17
- **Objective**: Allow users to optionally configure a card limit (WIP limit) when creating or editing columns, default to no limit (empty), and remove hardcoded WIP limit badges (`LIMIT 4` on In Progress / `LIMIT 8` on Todo).

## Files Modified / Created

- `prisma/schema.prisma`: Added `wipLimit Int?` to the `Column` model.
- `src/types/kanban.ts`: Added `wipLimit?: number | null;` to `ColumnWithCards`.
- `src/lib/kanban/column-settings.ts`: Added `wipLimit` validation schema to `columnSettingsSchema` (allowing integer 1-99, empty string coerced to null, or null).
- `src/lib/kanban/column-settings.test.ts`: Added unit tests verifying valid integers, empty strings, nulls, and boundary conditions.
- `src/app/api/columns/route.ts`: Handled `wipLimit: payload.wipLimit ?? null` on column creation.
- `src/app/api/columns/[columnId]/route.ts`: Handled `wipLimit: payload.wipLimit ?? null` on column updates.
- `src/app/(dashboard)/project/[id]/board/page.tsx`: Mapped `wipLimit: column.wipLimit ?? null` in server data fetching.
- `src/components/kanban/board.tsx`:
  - Preserved `wipLimit` in `normalizeColumn`.
  - Added `columnWipLimit` state to Create Column form.
  - Added "Card limit (WIP)" optional input in Create Column modal.
  - Wired `wipLimit` into column creation and update handlers and unsaved changes check.
- `src/components/kanban/column.tsx`:
  - Replaced hardcoded name-based WIP limit (`nameLower.includes(...) ? 4 : ...`) with `const wipLimit = column.wipLimit ?? null;`.
  - Only displays `LIMIT N` badge when a limit is explicitly set.
  - Added "Card limit (WIP)" input in Edit Column settings modal.
  - Wired `settingsWipLimit` state, unsaved changes detection, and save handler.
- `docs/agent-notes/2026-09-17-column-card-limit.md`: Work session documentation note.

## Important Behavior Changes

1. When creating or editing a column, users can enter an optional WIP limit between 1 and 99.
2. By default, columns have NO limit (`null`).
3. If no limit is configured, no `LIMIT` badge is displayed on the column header.
4. If a limit is configured, `LIMIT N` displays in the column header and animates with an amber pulse if the number of cards exceeds the configured limit.

## Database / Schema Changes

- Added `wipLimit Int?` to table `Column`.
- Synced to remote database via `npx prisma db push`.

## Verification Commands & Results

- `npx prisma db push`: Remote database schema updated and Prisma Client generated successfully.
- `npx prisma validate`: Schema is valid.
- `npm test`: All 51 test suites and 194 tests passed.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Verified production build.

## Known Follow-ups

- None.
