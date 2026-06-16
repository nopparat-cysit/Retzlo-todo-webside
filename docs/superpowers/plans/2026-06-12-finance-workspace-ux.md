# Finance Workspace UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the personal finance module into a small workspace with dashboard, history pages, filters, editing, and clearer category icons.

**Architecture:** Keep finance data ownership in existing API routes and add focused UI components for navigation, filtering, and editing. Reuse existing transaction/subscription forms by adding edit mode, and add a small account management API/page. Keep Phase 2 project-scoped finance out of scope.

**Tech Stack:** Next.js App Router, React client components, Prisma, PostgreSQL, Zod, Tailwind CSS, lucide-react.

---

### Task 1: Finance Shell And Notes

**Files:**
- Create: `docs/agent-notes/2026-06-12-finance-workspace-ux.md`
- Create: `src/components/finance/finance-shell.tsx`
- Create: `src/app/(dashboard)/finance/layout.tsx`

- [ ] Add the agent note describing Phase 2 scope, changed files, schema impact, and verification.
- [ ] Add a Finance shell component with an internal sidebar for Dashboard, Income, Expenses, Accounts, and Subscriptions.
- [ ] Wrap all `/finance` routes with the shell.

### Task 2: Category Icons And Dashboard Polish

**Files:**
- Create: `src/lib/finance/category-icons.tsx`
- Modify: `src/lib/finance/defaults.ts`
- Modify: `src/components/finance/transaction-list.tsx`
- Modify: `src/components/finance/finance-dashboard.tsx`

- [ ] Add reusable lucide icon mapping for category/account/subscription labels.
- [ ] Update default finance category icon keys.
- [ ] Limit dashboard Recent Transactions to 5.
- [ ] Add a compact dashboard strip for top expense category, active subscriptions, next billing date, and account count.

### Task 3: Transaction History Pages

**Files:**
- Create: `src/components/finance/finance-ledger-page.tsx`
- Create: `src/app/(dashboard)/finance/income/page.tsx`
- Create: `src/app/(dashboard)/finance/expenses/page.tsx`
- Modify: `src/components/finance/transaction-form.tsx`

- [ ] Add client-side filters for search, month, category, and account.
- [ ] Add edit/delete actions for user-owned transactions through existing PATCH/DELETE routes.
- [ ] Add Income and Expenses pages that load only the current user's records.

### Task 4: Accounts And Subscriptions Management

**Files:**
- Create: `src/app/api/finance/accounts/[accountId]/route.ts`
- Create: `src/components/finance/account-form.tsx`
- Create: `src/components/finance/finance-accounts-page.tsx`
- Create: `src/app/(dashboard)/finance/accounts/page.tsx`
- Create: `src/components/finance/finance-subscriptions-page.tsx`
- Create: `src/app/(dashboard)/finance/subscriptions/page.tsx`
- Modify: `src/components/finance/subscription-form.tsx`

- [ ] Add account PATCH/DELETE with user ownership checks.
- [ ] Add account list, create, edit, and delete UI.
- [ ] Add subscription list, filters, edit, pause/resume, and delete UI.

### Task 5: Verification

**Commands:**
- `npx prisma validate`
- `npx prisma generate`
- `npm run lint`
- `npm run build`

- [ ] Run all verification commands.
- [ ] Update the agent note with results.
