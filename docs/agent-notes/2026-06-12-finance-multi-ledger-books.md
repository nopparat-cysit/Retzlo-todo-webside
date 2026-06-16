# Finance Multi-Ledger Books

Date: 2026-06-12

## Objective

Implement a Multi-Ledger Book (Multi-Book) system for the Personal Finance module, allowing users to create, view, search, edit, and delete multiple independent ledger books (e.g., Personal, Travel, Office).

## Files Created/Modified

### Created
- `src/app/api/finance/ledgers/[ledgerId]/route.ts`
  - Added route handlers for updating (renaming/recoloring) and deleting ledger books.
  - Deletion cascades to associated transactions, bills, and recurring items, and enforces keeping at least one ledger book.
- `src/components/finance/finance-books-page.tsx`
  - Created the ledger books selection dashboard showing book cards, transaction counts, search/filter, and create/edit/delete modals.

### Modified
- `src/app/(dashboard)/finance/page.tsx`
  - Refactored the main entry point to render the ledger books directory list when no `ledgerId` query parameter is present.
  - Implemented default ledger creation on first load.
- `src/components/finance/finance-shell.tsx`
  - Configured layout behavior to hide the sidebar if no active ledger is selected (enabling full-width landing directory) and automatically append `?ledgerId={id}` query parameter to workspace navigation links.
- `src/app/(dashboard)/finance/layout.tsx`
  - Wrapped `FinanceShell` inside a React `<Suspense>` boundary to prevent CSR bailout prerender failures during compilation.
- `src/types/finance.ts`
  - Added `ledgerId: string | null` to `SerializedFinanceTransaction`, `SerializedFinanceSubscription`, and `SerializedRecurringIncome` types.
- Subpage Route Loaders:
  - `src/app/(dashboard)/finance/income/page.tsx`
  - `src/app/(dashboard)/finance/expenses/page.tsx`
  - `src/app/(dashboard)/finance/accounts/page.tsx`
  - `src/app/(dashboard)/finance/subscriptions/page.tsx`
  - `src/app/(dashboard)/finance/recurring-income/page.tsx`
    - Configured each page load query to guard against missing `ledgerId`, redirecting to `/finance` selection screen if no book is active.

## Behavior Changes

- Landing on `/finance` now displays the Books selection screen with search, custom color options, and ledger management options.
- The sidebar layout is only visible when an active book is selected, offering a focused workspace environment.
- Subpages (Income, Expenses, Bills, Accounts, etc.) require an active book. If accessed directly without a `ledgerId`, the user is seamlessly redirected back to the books directory.
- Legacy transactions, categories, and bills without a ledger association fallback to the first (default) created ledger book.

## Verification

- `npx prisma validate`: Passed.
- `npm run lint`: Passed with zero warnings or errors.
- `npm run build`: Passed successfully. All routes were statically compiled or dynamically generated without prerender failures.
