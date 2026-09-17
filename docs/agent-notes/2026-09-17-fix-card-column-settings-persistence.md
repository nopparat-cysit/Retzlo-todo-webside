# Fix Card & Column Settings Persistence (Assignees, Difficulty, Dates, WIP Limits)

- **Date**: 2026-09-17
- **Objective**: Fix bug where card assignees, difficulty scores, start/due dates, and column WIP limits would unexpectedly disappear upon editing column settings, updating cards, or reopening modals with UTC timestamps.

## Files Created / Modified

- `src/lib/kanban/serialize-card.ts`:
  - Created centralized card serializer `serializeCard` that correctly extracts `difficulty`, `assigneeIds`, `startDate`, and `startDateAllDay` from `privateCoins`.
- `src/app/api/columns/[columnId]/route.ts`:
  - Prevented deleting column WIP limit by using conditional spread `...(payload.wipLimit !== undefined && { wipLimit: payload.wipLimit })` instead of `wipLimit: payload.wipLimit ?? null`.
  - Serialized all returned cards in `column.cards` with `serializeCard` so client never receives raw un-serialized Prisma records.
- `src/app/api/cards/route.ts`:
  - Implemented safe merge of `privateCoins` in `PATCH`: fetches existing `privateCoins` from the DB and merges with incoming changes so omitting fields never destroys existing keys.
  - Replaced duplicate local serializer with `@/lib/kanban/serialize-card`.
- `src/components/kanban/board.tsx`:
  - Fixed `updateColumn`: updates column metadata only, keeping `cards: col.cards` intact so column setting updates never blow away cards in state.
  - Enhanced `normalizeCard`: added fallback extraction from `card.privateCoins` for `assigneeIds`, `difficulty`, `startDate`, and `startDateAllDay`.
- `src/components/kanban/project-calendar.tsx`:
  - Enhanced `normalizeCalendarCard`: added fallback extraction from `card.privateCoins` for `assigneeIds`, `difficulty`, `startDate`, and `startDateAllDay`.
- `src/components/kanban/card-modal.tsx`:
  - Replaced naive `.slice(0, 10)` on UTC timestamps with `formatLocalDate(isoString, isAllDay)`, extracting the user's local year, month, and day to prevent timezone day-shifting.
- `src/lib/kanban/card-serialization.test.ts`:
  - Added unit tests for `serializeCard`.
- `src/components/kanban/card-interaction.test.ts`:
  - Added unit tests verifying card preservation on column updates, privateCoins fallback in `normalizeCard`, and timezone date parsing in `CardModal`.

## Important Behavior Changes

- Editing column settings (name, color, icon, limit) no longer wipes out card assignees, difficulty scores, or dates.
- Omission of `wipLimit` in column update calls no longer resets WIP limit to null.
- Dates with specific times no longer shift back 1 day in the date picker when re-opening `CardModal`.
- Card updates safely preserve existing gamification and metadata keys in `privateCoins`.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test`: 52 test suites, 199 tests passed (100%).
- `npm run lint`: 0 warnings, 0 errors.
- `npm run build`: Production build verified for all 31 routes.
- `npx prisma validate`: Schema is valid.
