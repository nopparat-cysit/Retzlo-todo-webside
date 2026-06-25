# 2026-06-24 — UX Review Fixes: Kanban + Finance Module

## Objective
Implement all P0, P1, and P2 fixes identified in the Senior UX/UI review of the Kanban Todo system and the Finance module.

## Files Modified

### Kanban
- `src/components/kanban/card.tsx`
  - **Removed** `isUpdateConfirmOpen` state, `pendingUpdatePayload` state, `handleSaveIntent()`, and `executeSaveCard()` functions
  - **Removed** the ConfirmModal that was incorrectly gating every card save (non-destructive action)
  - **Added** `saveCard()` function with a proper strongly-typed payload that wires directly to `CardModal.onSubmit`
  - Toast notifications remain for success/error feedback
  - Replaced `any` type on payload with the proper CardModal payload interface

### Finance: Navigation Shell
- `src/components/finance/finance-shell.tsx` — **Rewritten**
  - **Added** dynamic ledger name fetch from `GET /api/finance/ledgers` using `useEffect` — displays the actual active book name instead of hardcoded "Personal Ledger"
  - **Added** grouped navigation with visual section dividers: Dashboard → Transactions group (Income, Recurring Income, Expenses, Recurring Bills) → Accounts group
  - Ledger name falls back to "Personal Ledger" while loading

### Finance: Ledger Page (Income + Expenses)
- `src/components/finance/finance-ledger-page.tsx`
  - **Added** `isDeletingTransaction` state + wired to `ConfirmModal isLoading`
  - **Added** `onClose` guard to prevent accidental close during delete
  - **Added** "Clear" filter reset button — appears conditionally when any non-default filter is active
  - **Fixed** income sticker: `retro-sticker-01-coin-reward.png` (income) / `retro-sticker-16-tape.png` (expense) instead of both using calculator
  - **Fixed** `emerald-300` → `text-dusk-cyan` for income icons and amounts
  - **Fixed** date display: `toLocaleDateString("en-GB", {...})` for consistent format across browsers

### Finance: Subscriptions Page
- `src/components/finance/finance-subscriptions-page.tsx`
  - **Added** `isDeletingSubscription` state + wired to `ConfirmModal isLoading`
  - **Fixed** `emerald-300` → `text-dusk-cyan` on active subscription icon
  - **Fixed** `getDueLabel()` date format: `en-GB` locale with explicit day/month/year options

### Finance: Recurring Income Page
- `src/components/finance/finance-recurring-income-page.tsx`
  - **Added** `isDeletingIncome` state + wired to `ConfirmModal isLoading`
  - **Fixed** `getDueLabel()` date format: `en-GB` locale with explicit options

### Finance: Accounts Page
- `src/components/finance/finance-accounts-page.tsx`
  - **Added** `isDeletingAccount` state + wired to `ConfirmModal isLoading`

### Finance: Dashboard
- `src/components/finance/finance-dashboard.tsx`
  - **Added** `isDeletingDashboardSub` state + wired to `ConfirmModal isLoading`
  - **Fixed** `emerald-300` → `text-dusk-cyan` on income stat display
  - **Fixed** Next Billing Date format: `en-GB` locale with explicit options

## Behavior Changes
- Card edits now save immediately on submit — no more "Are you sure?" dialog for non-destructive edits
- Finance sidebar now shows the real active book name
- Finance nav has visual grouping: Dashboard / Transactions (4 items) / Accounts (1 item)
- All Finance delete operations now show a loading spinner in the ConfirmModal during the async request
- Income and Expense pages now have contextually different header stickers
- All date displays in Finance use consistent `"DD Mon YYYY"` format regardless of browser locale
- Income color is now `dusk-cyan` token throughout (previously mixed `emerald-300` and `dusk-cyan`)
- Ledger filter bar shows a "Clear" button when non-default filters are active

## Database / Schema Changes
None

## Verification
- `npm run lint` → ✔ No ESLint warnings or errors
- `npm run build` → (running)

## Known Follow-ups
- URL persistence for Kanban search/filter state (P2 — not implemented this session)
- Virtual scroll / pagination for large card columns (P2 — deferred)
- Mobile Finance nav bottom-sheet variant (P2 — deferred)
