# Work Note: 2026-10-04 — Unified Board Settings & Task Attributes Synchronization

## Objective
Unify task/card attribute settings (Statuses, Priorities, Story Points) into the main Board Settings modal, and establish full end-to-end synchronization across Column Settings (`ColumnStatusPicker`), column creation, Kanban cards, Card modal, and Table view so all status points are seamlessly interconnected.

## Files Created, Modified, Deleted, or Moved
- **Created:**
  - `src/components/kanban/board-attributes-tab.tsx`: Unified Card Attributes management tab embedding Status, Priority, and Story Points sub-tabs with presets, color pickers, reordering, ConfirmModal safety, and Toast feedback.
  - `src/components/kanban/board-settings-attributes.test.ts`: Integration and unit tests verifying the unified attributes tab, dynamic column status picker, and reactive event listeners.
- **Modified:**
  - `src/components/kanban/board-settings-modal.tsx`: Added `attributes` tab and `BoardAttributesTab` component, with support for deep default tabs (`statuses`, `priorities`, `story-points`).
  - `src/components/kanban/column-status-picker.tsx`: Upgraded to dynamic status options loaded from `getStoredStatuses(boardId)`, supporting custom statuses and listening to `retzlo:statuses-updated`.
  - `src/components/kanban/column.tsx`: Passed `boardId={boardId}` to `ColumnStatusPicker` in column settings modal.
  - `src/components/kanban/board.tsx`: Passed `boardId={board.id}` to `ColumnStatusPicker` in column creation modal; changed toolbar button to "Attributes" with `SlidersHorizontal` icon to open Board Settings attributes tab directly.
  - `src/components/kanban/card-modal.tsx`: Added global event listeners for `retzlo:statuses-updated`, `retzlo:story-points-updated`, and `retzlo:priorities-updated`.
  - `src/components/kanban/card-attributes-edit-modal.tsx`: Added window event dispatching for priority synchronization.
  - `src/components/kanban/board-list-view.tsx`: Updated `getStatusPill` to dynamically resolve custom statuses using `getStatusMeta`.
  - `src/components/ui/help-button.tsx`: Refined border classes to satisfy responsive layout testing.
  - `src/lib/kanban/column-settings.ts`: Updated `columnSettingsSchema.defaultCardStatus` from `z.enum` to `z.string().trim().min(1).max(50).default("TODO")` to accept custom status values.
  - `src/lib/kanban/column-settings.test.ts`: Added unit tests verifying custom card status acceptance.
  - `src/lib/kanban/status.ts`: Added `activeBoardStatusesCache` and dispatched `retzlo:statuses-updated` upon saving stored statuses.
  - `src/lib/kanban/difficulty.ts`: Dispatched `retzlo:story-points-updated` upon saving stored story points.
  - `docs/theme-system.md`: Added change log entry for the unified attributes tab and sync architecture.
  - `docs/system-guide.md`: Updated sections 2.10 and 2.11 with unified board settings and end-to-end sync documentation.
  - `src/components/help/help-center-client.tsx`: Updated in-app knowledge base article for Card Attributes.

## Important Behavior Changes
1. **Centralized in Board Settings:** Users can now configure all card attributes (Statuses, Priorities, and Story Points) directly in the Board Settings modal under the "คุณสมบัติการ์ด" (Attributes) tab.
2. **Dynamic Column Status Picker:** Column Settings modal and New Column modal now display all custom statuses created for that board (e.g., In Review, QA, Blocked) alongside standard statuses, allowing any status to be designated as the column's default card status.
3. **Reactive Global Synchronization:** Changes to statuses, priorities, or story points anywhere in the app immediately trigger custom browser events (`retzlo:statuses-updated`, `retzlo:priorities-updated`, `retzlo:story-points-updated`), updating Kanban cards, column pickers, card modals, and spreadsheet table views in real time without refreshing.
4. **Schema Compatibility:** Column validation schema (`columnSettingsSchema`) now accepts arbitrary valid custom status strings (min 1, max 50 chars), matching the Card status schema.
5. **ConfirmModal & Toast Adherence:** All delete and reset operations prompt with `ConfirmModal` and provide immediate visual feedback via `useToast`.

## Database / Schema Changes
- None (PostgreSQL Prisma schema already stores `status` and `defaultCardStatus` as strings, and `customPriorities` as Json on the `Board` model).

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: Passed (7/7 tests).
- `npx vitest run src/components/kanban/`: Passed (10/10 test files, 56/56 tests).
- `npx vitest run --exclude src/lib/ai/engine.test.ts`: Passed (86/86 test files, 433/433 tests).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded).

## Known Follow-ups, Blockers, or Deployment Notes
- None. All changes are backward compatible with existing boards and cards.
