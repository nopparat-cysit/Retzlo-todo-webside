"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CreditCard } from "lucide-react";

import { CategoryBreakdown } from "@/components/finance/category-breakdown";
import { SubscriptionForm } from "@/components/finance/subscription-form";
import { SubscriptionList } from "@/components/finance/subscription-list";
import { TransactionForm } from "@/components/finance/transaction-form";
import { TransactionList } from "@/components/finance/transaction-list";
import { LedgerSelector } from "@/components/finance/ledger-selector";
import { BudgetForm } from "@/components/finance/budget-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { calculateExpenseBreakdown, calculateFinanceSummary, getRecurringIncomeMonthlyAmount } from "@/lib/finance/calculations";
import type {
  FinanceTransactionType,
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedRecurringIncome,
  SerializedFinanceSubscription,
  SerializedFinanceTransaction,
  SerializedFinanceLedger,
  SerializedFinanceBudget
} from "@/types/finance";

interface FinanceDashboardProps {
  initialAccounts: SerializedFinanceAccount[];
  initialCategories: SerializedFinanceCategory[];
  initialRecurringIncomes: SerializedRecurringIncome[];
  initialSubscriptions: SerializedFinanceSubscription[];
  initialTransactions: SerializedFinanceTransaction[];
  initialLedgers: SerializedFinanceLedger[];
  initialBudgets: SerializedFinanceBudget[];
  activeLedgerId: string | null;
}

type ModalMode = "income" | "expense" | "subscription" | null;

export function FinanceDashboard({
  initialAccounts,
  initialCategories,
  initialRecurringIncomes,
  initialSubscriptions,
  initialTransactions,
  initialLedgers,
  initialBudgets,
  activeLedgerId
}: FinanceDashboardProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [categories, setCategories] = useState(initialCategories);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => calculateFinanceSummary(transactions, subscriptions), [subscriptions, transactions]);
  const breakdown = useMemo(() => calculateExpenseBreakdown(transactions), [transactions]);
  const activeSubscriptions = useMemo(() => subscriptions.filter((subscription) => subscription.isActive), [subscriptions]);
  
  const recurringIncomeMonthlyTotal = useMemo(
    () =>
      initialRecurringIncomes
        .filter((income) => income.isActive)
        .reduce((sum, income) => sum + getRecurringIncomeMonthlyAmount(income), 0),
    [initialRecurringIncomes]
  );
  
  const nextSubscription = useMemo(
    () =>
      activeSubscriptions
        .slice()
        .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())[0],
    [activeSubscriptions]
  );
  
  const topExpenseCategory = breakdown[0];

  // Calculate current month's expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return transactions
      .filter((t) => {
        if (t.type !== "EXPENSE") return false;
        const d = new Date(t.transactionDate);
        return d >= startOfMonth && d <= endOfMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Find active monthly budget limit (categoryId === null)
  const activeBudget = useMemo(() => {
    return budgets.find((b) => b.categoryId === null || b.categoryId === undefined);
  }, [budgets]);

  const budgetAmount = activeBudget ? activeBudget.amount : 0;

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

  function handleBudgetSubmit(newBudget: SerializedFinanceBudget) {
    if (newBudget.id === "") {
      // Deleted
      setBudgets((current) => current.filter((b) => b.id !== activeBudget?.id));
    } else {
      setBudgets((current) => {
        const index = current.findIndex((b) => b.id === newBudget.id);
        if (index > -1) {
          return current.map((b) => (b.id === newBudget.id ? newBudget : b));
        }
        return [...current, newBudget];
      });
    }
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
    <div className="flex flex-col gap-4">
      <section className="lofi-panel rounded-2xl p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Accounting Finance</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-100 sm:text-4xl">Personal Finance</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
              Track income, expenses, accounts, and recurring subscriptions in one calm monthly workspace.
            </p>
            
            {/* Active Ledger Selector */}
            <div className="mt-4">
              <LedgerSelector ledgers={initialLedgers} activeLedgerId={activeLedgerId} />
            </div>
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
              Add Recurring Bill
            </Button>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

      {/* Workspace Financial Overview Panel */}
      <section className="lofi-panel rounded-2xl p-6 bg-white/[0.015]">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x lg:divide-y-0 divide-white/10">
          {/* Net Balance */}
          <div className="flex flex-col justify-between pb-4 md:pb-0 lg:px-4 first:pl-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Balance this month</p>
              <p className={cn("mt-2 text-2xl font-bold tracking-tight", summary.balance >= 0 ? "text-dusk-cyan" : "text-dusk-rose")}>
                {formatMoney(summary.balance)} <span className="text-xs font-normal text-stone-500">THB</span>
              </p>
            </div>
            <p className="mt-1 text-xs text-stone-500">ยอดคงเหลือสุทธิเดือนนี้</p>
          </div>

          {/* Income */}
          <div className="flex flex-col justify-between py-4 md:py-0 md:pl-4 lg:px-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Income this month</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-300">
                {formatMoney(summary.income)} <span className="text-xs font-normal text-stone-500">THB</span>
              </p>
            </div>
            <p className="mt-1 text-xs text-stone-500">รายรับทั้งหมดของเดือนนี้</p>
          </div>

          {/* Expenses */}
          <div className="flex flex-col justify-between py-4 md:py-0 lg:px-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Expense this month</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-dusk-rose">
                {formatMoney(summary.expense)} <span className="text-xs font-normal text-stone-500">THB</span>
              </p>
            </div>
            <p className="mt-1 text-xs text-stone-500">รายจ่ายรวมของเดือนนี้</p>
          </div>

          {/* Budget */}
          <div className="flex flex-col justify-between pt-4 md:pt-0 lg:pl-4 last:pr-0">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Monthly Budget</p>
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(true)}
                  className="text-[10px] font-semibold text-dusk-lavender hover:underline active:scale-[0.98] transition-transform"
                >
                  {budgetAmount > 0 ? "Edit" : "Set Limit"}
                </button>
              </div>
              
              {budgetAmount > 0 ? (
                <>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-dusk-amber">
                    {formatMoney(budgetAmount)} <span className="text-xs font-normal text-stone-500">THB</span>
                  </p>
                  
                  {/* Budget Progress Bar */}
                  <div className="mt-3 flex flex-col gap-1.5">
                    <div className="h-2 w-full rounded-full bg-ink-950 overflow-hidden border border-white/5 p-[1px]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          currentMonthExpenses / budgetAmount >= 0.9
                            ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : currentMonthExpenses / budgetAmount >= 0.7
                            ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        )}
                        style={{ width: `${Math.min(100, (currentMonthExpenses / budgetAmount) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>Used {((currentMonthExpenses / budgetAmount) * 100).toFixed(0)}%</span>
                      <span className={cn(
                        "font-semibold",
                        currentMonthExpenses > budgetAmount 
                          ? "text-red-400" 
                          : currentMonthExpenses >= budgetAmount * 0.7 
                          ? "text-amber-400" 
                          : "text-emerald-400"
                      )}>
                        {currentMonthExpenses > budgetAmount ? "Over budget" : "In control"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-xs text-stone-500 italic leading-relaxed pt-1">
                  No budget limit set for this book.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        {/* Left Column: Ledger activities */}
        <div className="space-y-4">
          <TransactionList limit={7} transactions={transactions} />
        </div>

        {/* Right Column: Summaries, Highlights & Accounts */}
        <div className="space-y-4">
          {/* Recurring Bills Overview Widget */}
          <section className="lofi-panel rounded-lg p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-dusk-rose" />
                <h2 className="text-lg font-semibold text-stone-100">Monthly Bills Summary</h2>
              </div>
              <Link
                href={`/finance/subscriptions${activeLedgerId ? `?ledgerId=${activeLedgerId}` : ""}`}
                className="text-xs font-semibold text-dusk-lavender hover:underline active:scale-[0.98] transition-transform"
              >
                Manage
              </Link>
            </div>
            
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Total Monthly Cost</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-dusk-rose">
                  {formatMoney(summary.subscriptionMonthlyCost)} <span className="text-xs font-normal text-stone-500">THB / month</span>
                </p>
              </div>

              <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Active Bills</span>
                  <span className="font-medium text-stone-200">{activeSubscriptions.length} bills</span>
                </div>
                
                {nextSubscription ? (
                  <div className="flex flex-col gap-1 border-t border-white/5 pt-2 mt-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Next Due Bill</p>
                    <div className="flex justify-between items-start text-xs gap-3">
                      <span className="text-stone-200 font-medium truncate max-w-[150px]">{nextSubscription.name}</span>
                      <span className="text-dusk-amber font-semibold shrink-0">
                        {formatMoney(nextSubscription.amount)} THB
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Due on {new Date(nextSubscription.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-stone-500 italic mt-1 border-t border-white/5 pt-2">
                    No upcoming bills.
                  </p>
                )}
              </div>
            </div>
          </section>

          <CategoryBreakdown items={breakdown} />
          
          <SubscriptionList subscriptions={subscriptions} onDelete={deleteSubscription} onToggle={toggleSubscription} />
        </div>
      </div>

      {modalMode === "income" || modalMode === "expense" ? (
        <TransactionForm
          accounts={initialAccounts}
          categories={categories}
          defaultType={formType()}
          error={error}
          activeLedgerId={activeLedgerId}
          onClose={() => setModalMode(null)}
          onCategoryCreated={(category) => setCategories((current) => [...current, category])}
          onError={setError}
          onSubmit={addTransaction}
        />
      ) : null}

      {modalMode === "subscription" ? (
        <SubscriptionForm
          accounts={initialAccounts}
          categories={categories}
          error={error}
          activeLedgerId={activeLedgerId}
          onClose={() => setModalMode(null)}
          onCategoryCreated={(category) => setCategories((current) => [...current, category])}
          onError={setError}
          onSubmit={addSubscription}
        />
      ) : null}

      {showBudgetModal && activeLedgerId ? (
        <BudgetForm
          ledgerId={activeLedgerId}
          currentBudget={activeBudget || null}
          onClose={() => setShowBudgetModal(false)}
          onError={setError}
          onSubmit={handleBudgetSubmit}
        />
      ) : null}
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2
  });
}
