"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, CircleOff, Edit3, Plus, Search, Trash2, TrendingUp } from "lucide-react";

import { RecurringIncomeForm } from "@/components/finance/recurring-income-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FinanceEmptyState } from "./finance-empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinanceCategoryIcon } from "@/lib/finance/category-icons";
import { getRecurringIncomeMonthlyAmount } from "@/lib/finance/calculations";
import type {
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedRecurringIncome
} from "@/types/finance";

interface FinanceRecurringIncomePageProps {
  accounts: SerializedFinanceAccount[];
  categories: SerializedFinanceCategory[];
  initialRecurringIncomes: SerializedRecurringIncome[];
}

export function FinanceRecurringIncomePage({
  accounts,
  categories,
  initialRecurringIncomes
}: FinanceRecurringIncomePageProps) {
  const [recurringIncomes, setRecurringIncomes] = useState(initialRecurringIncomes);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [editingIncome, setEditingIncome] = useState<SerializedRecurringIncome | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ cycle: "", query: "", status: "active" });

  const filteredIncomes = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return recurringIncomes
      .filter((income) => {
        const matchesStatus = filters.status === "all" ? true : filters.status === "active" ? income.isActive : !income.isActive;
        const matchesCycle = filters.cycle ? income.incomeCycle === filters.cycle : true;
        const matchesQuery = query
          ? [income.name, income.note, income.category?.name, income.account?.name]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query)
          : true;

        return matchesStatus && matchesCycle && matchesQuery;
      })
      .sort((a, b) => new Date(a.nextIncomeDate).getTime() - new Date(b.nextIncomeDate).getTime());
  }, [filters, recurringIncomes]);

  const activeMonthlyTotal = recurringIncomes
    .filter((income) => income.isActive)
    .reduce((sum, income) => sum + getRecurringIncomeMonthlyAmount(income), 0);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function upsertIncome(income: SerializedRecurringIncome) {
    setRecurringIncomes((current) => {
      const exists = current.some((item) => item.id === income.id);
      return exists ? current.map((item) => (item.id === income.id ? income : item)) : [income, ...current];
    });
    setEditingIncome(null);
    setShowCreate(false);
    setError(null);
  }

  async function toggleIncome(income: SerializedRecurringIncome) {
    const response = await fetch(`/api/finance/recurring-income/${income.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !income.isActive })
    });
    const data = (await response.json()) as { recurringIncome?: SerializedRecurringIncome; error?: string };

    if (!response.ok || !data.recurringIncome) {
      setError(data.error ?? "Could not update recurring income.");
      return;
    }

    upsertIncome(data.recurringIncome);
  }

  async function deleteIncome(incomeId: string) {
    const response = await fetch(`/api/finance/recurring-income/${incomeId}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not delete recurring income.");
      return;
    }

    setRecurringIncomes((current) => current.filter((income) => income.id !== incomeId));
  }

  return (
    <div className="grid gap-4">
      <section className="lofi-panel rounded-2xl p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Recurring Income</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-100">Recurring Income</h1>
            <p className="mt-2 text-sm text-stone-400">
              Track repeated money coming in, such as salary, retainers, rent, allowance, or other recurring income.
            </p>
          </div>
          <Button type="button" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Add Recurring Income
          </Button>
        </div>
      </section>

      {error ? <p className="rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

      <section className="lofi-panel rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_150px_150px_180px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <Input
              className="pl-9"
              placeholder="Search recurring income..."
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
            />
          </label>
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.cycle || "all"} onValueChange={(value) => updateFilter("cycle", value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cycles</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
              <SelectItem value="CUSTOM">Custom</SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Monthly income</p>
            <p className="text-sm font-semibold text-emerald-300">{formatMoney(activeMonthlyTotal)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {filteredIncomes.length === 0 ? (
          <FinanceEmptyState
            icon={Search}
            title="No recurring income found"
            description="You don't have any recurring income sources matching these filters."
            actionLabel="Add Recurring Income"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          filteredIncomes.map((income) => (
            <article key={income.id} className="lofi-panel rounded-lg p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-300" />
                    <FinanceCategoryIcon className="text-dusk-lavender" icon={income.category?.icon} label={income.category?.name ?? income.name} />
                    <h2 className="truncate text-base font-semibold text-stone-100">{income.name}</h2>
                    <Badge variant={income.isActive ? "cyan" : "muted"}>{income.isActive ? "Active" : "Paused"}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-dusk-cyan">
                    <CalendarClock className="h-3 w-3" />
                    {getDueLabel(income.nextIncomeDate)} / {income.incomeCycle.toLowerCase()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="muted">{income.category?.name ?? "Uncategorized"}</Badge>
                    <Badge variant="muted">{income.account?.name ?? "No account"}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-300">{formatMoney(income.amount)}</p>
                    <p className="text-[11px] text-stone-500">{formatMoney(getRecurringIncomeMonthlyAmount(income))}/mo</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => void toggleIncome(income)}
                      aria-label={income.isActive ? "Pause recurring income" : "Activate recurring income"}
                    >
                      {income.isActive ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <CircleOff className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setEditingIncome(income)} aria-label="Edit recurring income">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => void deleteIncome(income.id)} aria-label="Delete recurring income">
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {showCreate || editingIncome ? (
        <RecurringIncomeForm
          accounts={accounts}
          categories={availableCategories}
          error={error}
          recurringIncome={editingIncome}
          onCategoryCreated={(category) => setAvailableCategories((current) => [...current, category])}
          onClose={() => {
            setShowCreate(false);
            setEditingIncome(null);
          }}
          onError={setError}
          onSubmit={upsertIncome}
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

function getDueLabel(nextIncomeDate: string) {
  const today = new Date();
  const dueDate = new Date(nextIncomeDate);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
  const dateText = dueDate.toLocaleDateString();

  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d (${dateText})`;
  if (diffDays === 0) return `Expected today (${dateText})`;
  if (diffDays === 1) return `Expected tomorrow (${dateText})`;
  return `Expected in ${diffDays}d (${dateText})`;
}
