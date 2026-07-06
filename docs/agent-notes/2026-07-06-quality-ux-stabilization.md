# 2026-07-06 - Quality & UX Stabilization

## Objective

Stabilize RETROD modal layering, board drag/click behavior, and date display consistency without adding new product scope.

## Files changed

- Added `src/components/ui/app-modal.tsx`
- Added `src/components/ui/app-modal.test.ts`
- Added `src/components/kanban/work-modals.test.ts`
- Added `src/components/kanban/calendar-modals.test.ts`
- Added `src/components/notes/note-modals.test.ts`
- Modified `src/components/kanban/card-modal.tsx`
- Modified `src/components/kanban/board.tsx`
- Modified `src/components/kanban/column.tsx`
- Modified `src/components/kanban/project-calendar.tsx`
- Modified `src/components/kanban/card-interaction.test.ts`
- Modified `src/components/notes/notes-panel.tsx`
- Modified `src/components/notes/board-notes-rail.tsx`
- Modified `src/components/finance/finance-ledger-page.tsx`
- Modified `src/components/finance/transaction-list.tsx`
- Modified `src/components/finance/subscription-list.tsx`
- Modified `src/components/finance/finance-dashboard.tsx`
- Modified `src/components/finance/finance-subscriptions-page.tsx`
- Modified `src/components/finance/finance-recurring-income-page.tsx`
- Modified `src/components/profile/profile-client.tsx`

## Behavior changes

- Added a shared `AppModal` primitive that portals to body, isolates pointer/click/keyboard events, supports Escape close, and routes dirty closes through a discard confirmation.
- Migrated Work module card, column creation, column settings, calendar note, and calendar day overlays to `AppModal`.
- Migrated project notes and board notes create/edit modals to `AppModal`.
- Replaced direct date `toLocaleDateString` usages in Finance/Profile display paths with shared `date-format` helpers.
- Updated source tests to guard modal isolation and drag activation contracts.

## Database/schema changes

- None.

## Verification

- `npm test -- src/components/ui/app-modal.test.ts src/components/kanban/work-modals.test.ts src/components/kanban/card-interaction.test.ts src/components/notes/note-modals.test.ts src/lib/date-format.test.ts src/lib/safe-db.test.ts` passed.
- `.\node_modules\.bin\tsc.cmd --noEmit` passed.
- `npm test -- src/components/ui/app-modal.test.ts src/components/kanban/work-modals.test.ts src/components/kanban/calendar-modals.test.ts src/components/kanban/card-interaction.test.ts src/components/notes/note-modals.test.ts src/lib/date-format.test.ts src/lib/safe-db.test.ts` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npx prisma validate` passed.

## Follow-ups

- Remaining custom overlays in hub, diary, rewards, and project dashboard should be migrated to `AppModal` in the next stabilization slice.
- Some legacy mojibake text remains in older UI content and should be cleaned in a separate copy/encoding pass.
