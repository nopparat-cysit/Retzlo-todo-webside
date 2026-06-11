"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CreditCard, Landmark } from "lucide-react";

import { CategoryBreakdown } from "@/components/finance/category-breakdown";
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { SubscriptionForm } from "@/components/finance/subscription-form";
import { SubscriptionList } from "@/components/finance/subscription-list";
import { TransactionForm } from "@/components/finance/transaction-form";
import { TransactionList } from "@/components/finance/transaction-list";
import { Button } from "@/components/ui/button";
import { calculateExpenseBreakdown, calculateFinanceSummary } from "@/lib/finance/calculations";
import type {
  FinanceTransactionType,
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedFinanceSubscription,
  SerializedFinanceTransaction
} from "@/types/finance";

interface FinanceDashboardProps {
  initialAccounts: SerializedFinanceAccount[];
  initialCategories: SerializedFinanceCategory[];
  initialSubscriptions: SerializedFinanceSubscription[];
  initialTransactions: SerializedFinanceTransaction[];
}

type ModalMode = "income" | "expense" | "subscription" | null;

export function FinanceDashboard({
  initialAccounts,
  initialCategories,
  initialSubscriptions,
  initialTransactions
}: FinanceDashboardProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [error, setError] = useState<string | null>(null);
  const summary = useMemo(() => calculateFinanceSummary(transactions, subscriptions), [subscriptions, transactions]);
  const breakdown = useMemo(() => calculateExpenseBreakdown(transactions), [transactions]);

  function addTransaction(transaction: SerializedFinanceTransaction) {
    setTransactions((current) => [transaction, ...current]);
    setModalMode(null);
    setError(null);
  }

  function addSubscription(subscription: SerializedFinanceSubscription) {
    setSubscriptions((current) => [subscription, ...current]);
    setModalMode(null);
    setError(null);
  }

  async function toggleSubscription(subscription: SerializedFinanceSubscription) {
    const response = await fetch(`/api/finance/subscriptions/${subscription.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !subscription.isActive })
    });
    const data = (await response.json()) as { subscription?: SerializedFinanceSubscription; error?: string };

    if (!response.ok || !data.subscription) {
      setError(data.error ?? "Could not update subscription.");
      return;
    }

    setSubscriptions((current) => current.map((item) => (item.id === data.subscription?.id ? data.subscription : item)));
  }

  async function deleteSubscription(subscriptionId: string) {
    const response = await fetch(`/api/finance/subscriptions/${subscriptionId}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not delete subscription.");
      return;
    }

    setSubscriptions((current) => current.filter((item) => item.id !== subscriptionId));
  }

  function formType(): FinanceTransactionType {
    return modalMode === "income" ? "INCOME" : "EXPENSE";
  }

  return (
    <main className="soft-grid-bg min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <section className="lofi-panel rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Accounting Finance</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-100 sm:text-4xl">Personal Finance</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
                Track income, expenses, accounts, and recurring subscriptions in one calm monthly workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setModalMode("income")}>
                <ArrowUpRight className="h-4 w-4" />
                Add Income
              </Button>
              <Button type="button" variant="ghost" onClick={() => setModalMode("expense")}>
                <ArrowDownRight className="h-4 w-4" />
                Add Expense
              </Button>
              <Button type="button" variant="ghost" onClick={() => setModalMode("subscription")}>
                <CreditCard className="h-4 w-4" />
                Add Subscription
              </Button>
            </div>
          </div>
        </section>

        {error ? <p className="rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

        <FinanceSummaryCards {...summary} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
          <TransactionList transactions={transactions} />
          <div className="grid gap-4">
            <CategoryBreakdown items={breakdown} />
            <SubscriptionList subscriptions={subscriptions} onDelete={deleteSubscription} onToggle={toggleSubscription} />
          </div>
        </div>

        <section className="lofi-panel rounded-lg p-5">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-dusk-lavender" />
            <h2 className="text-xl font-semibold text-stone-100">Accounts</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {initialAccounts.map((account) => (
              <article key={account.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <p className="text-sm font-semibold text-stone-100">{account.name}</p>
                <p className="mt-1 text-xs text-stone-500">{account.type}</p>
                <p className="mt-3 text-lg font-semibold text-dusk-cyan">{account.balance ?? 0}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {modalMode === "income" || modalMode === "expense" ? (
        <TransactionForm
          accounts={initialAccounts}
          categories={initialCategories}
          defaultType={formType()}
          error={error}
          onClose={() => setModalMode(null)}
          onError={setError}
          onSubmit={addTransaction}
        />
      ) : null}

      {modalMode === "subscription" ? (
        <SubscriptionForm
          accounts={initialAccounts}
          categories={initialCategories}
          error={error}
          onClose={() => setModalMode(null)}
          onError={setError}
          onSubmit={addSubscription}
        />
      ) : null}
    </main>
  );
}
