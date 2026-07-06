"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, CircleOff, Edit3, Plus, Search, Trash2, TrendingUp } from "lucide-react";
import Image from "next/image";

import { RecurringIncomeForm } from "@/components/finance/recurring-income-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { FinanceEmptyState } from "./finance-empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMediumDate } from "@/lib/date-format";
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
  const { toast } = useToast();
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [editingIncome, setEditingIncome] = useState<SerializedRecurringIncome | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [isDeletingIncome, setIsDeletingIncome] = useState(false);
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
    const exists = recurringIncomes.some((item) => item.id === income.id);
    setRecurringIncomes((current) => {
      return exists ? current.map((item) => (item.id === income.id ? income : item)) : [income, ...current];
    });
    toast({
      message: exists ? `Recurring income "${income.name}" updated.` : `Recurring income "${income.name}" created.`,
      type: "success"
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
      const msg = data.error ?? "Could not update recurring income.";
      setError(msg);
      toast({ message: msg, type: "error" });
      return;
    }

    setRecurringIncomes((current) =>
      current.map((item) => (item.id === data.recurringIncome!.id ? data.recurringIncome! : item))
    );
    toast({
      message: data.recurringIncome.isActive
        ? `Recurring income "${data.recurringIncome.name}" activated.`
        : `Recurring income "${data.recurringIncome.name}" paused.`,
      type: "success"
    });
  }

  async function deleteIncome(incomeId: string) {
    const incomeName = recurringIncomes.find((i) => i.id === incomeId)?.name || "";
    setIsDeletingIncome(true);
    const response = await fetch(`/api/finance/recurring-income/${incomeId}`, { method: "DELETE" });
    setIsDeletingIncome(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not delete recurring income.");
      toast({ message: data.error ?? "Could not delete recurring income.", type: "error" });
      return;
    }

    setRecurringIncomes((current) => current.filter((income) => income.id !== incomeId));
    toast({ message: `Recurring income "${incomeName}" deleted.`, type: "success" });
  }

  return (
    <div className="grid gap-4">
      <section className="lofi-panel rounded-2xl p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Recurring Income</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-100">Recurring Income</h1>
              <p className="mt-2 text-sm text-stone-400">
                Track repeated money coming in, such as salary, retainers, rent, allowance, or other recurring income.
              </p>
            </div>
            <Image
              alt=""
              aria-hidden="true"
              className="pointer-events-none hidden h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_14px_rgba(8,8,23,0.5)] sm:block xl:h-20 xl:w-20 transition-transform duration-300 hover:scale-105 hover:rotate-3 cursor-default"
              height={96}
              src="/stickers/retro/retro-sticker-50-battery-charge.png"
              width={96}
            />
          </div>
          <div className="flex shrink-0 items-center">
            <Button type="button" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Add Recurring Income
            </Button>
          </div>
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
            stickerSrc="/stickers/retro/retro-sticker-50-battery-charge.png"
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
                    <Button type="button" variant="ghost" size="icon" onClick={() => setDeletingIncomeId(income.id)} aria-label="Delete recurring income">
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

      <ConfirmModal
        open={Boolean(deletingIncomeId)}
        title="Delete Recurring Income?"
        message="Are you sure you want to delete this recurring income stream? This will stop future automatic income generation."
        variant="danger"
        confirmLabel="Delete Income"
        isLoading={isDeletingIncome}
        onConfirm={async () => {
          if (deletingIncomeId) {
            await deleteIncome(deletingIncomeId);
            setDeletingIncomeId(null);
          }
        }}
        onClose={() => {
          if (!isDeletingIncome) setDeletingIncomeId(null);
        }}
      />
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
  const dateText = formatMediumDate(dueDate);

  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d (${dateText})`;
  if (diffDays === 0) return `Expected today (${dateText})`;
  if (diffDays === 1) return `Expected tomorrow (${dateText})`;
  return `Expected in ${diffDays}d (${dateText})`;
}
