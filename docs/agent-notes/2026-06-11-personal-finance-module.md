# Personal Finance Module

Date: 2026-06-11

## Objective

Add Phase 1 Personal Finance as a logged-in module with transactions, categories, accounts, subscriptions, summary cards, lists, breakdowns, validation, permissions, and module navigation.

## Files Changed

- `prisma/schema.prisma`
  - Added personal finance relations to `User`.
  - Added `FinanceTransaction`, `FinanceCategory`, `FinanceAccount`, and `Subscription`.
- `src/app/(dashboard)/finance/page.tsx`
  - Added logged-in finance page that redirects guests to `/login`.
  - Loads default categories/accounts and current user's finance data.
- `src/app/api/finance/**`
  - Added transaction, category, account, and subscription route handlers.
- `src/components/finance/**`
  - Added dashboard, summary cards, transaction list/form, category breakdown, and subscription list/form.
- `src/lib/finance/**`
  - Added defaults, validation, permissions, serializers, and calculation helpers.
- `src/types/finance.ts`
  - Added serialized finance UI/API types.
- `src/components/modules/module-selector.tsx`
  - Enabled the Accounting Finance module card and removed mojibake emoji icons.
- `src/app/(dashboard)/select-module/page.tsx`
  - Opened module selection to every logged-in user.
- `src/components/auth/login-form.tsx`
  - Redirects successful login to `/select-module` by default.
- `src/components/auth/register-form.tsx`
  - Redirects successful registration to `/select-module` by default.
- `src/app/(marketing)/page.tsx`
  - Sends Enter workspace to `/select-module`.

## Behavior Changes

- Users can access `/finance` after login.
- Guests are redirected to `/login`.
- Users only query, create, edit, and delete their own finance records.
- Finance dashboard shows monthly income, expense, balance, subscription monthly cost, latest transactions, expense category breakdown, active subscriptions, and accounts.
- Default categories and accounts are created lazily for each user.
- Transaction category choices follow the selected income/expense type.

## Database Or Schema Changes

- Added personal finance tables for transactions, categories, accounts, and subscriptions.
- Finance records are not connected to projects in Phase 1.
- Amount values use Prisma Decimal fields.

## Verification

- `git status --short --branch`: showed finance/module/auth/schema/note changes on `master...origin/main`.
- `npx prisma validate`: passed.
- `npx prisma generate`: passed.
- `npx prisma db push`: passed and synced Neon database `neondb`.
- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed and built `/finance` plus the new finance API routes.

## Follow-Ups

- Add richer edit UI for transactions, categories, and accounts in later phases if needed.
