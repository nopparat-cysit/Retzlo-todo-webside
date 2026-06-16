"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, CircleOff, Edit3, Plus, Search, Trash2 } from "lucide-react";

import { SubscriptionForm } from "@/components/finance/subscription-form";
import { Button } from "@/components/ui/button";
import { FinanceEmptyState } from "./finance-empty-state";
import { Input } from "@/components/ui/input";
import { FinanceCategoryIcon } from "@/lib/finance/category-icons";
import { getSubscriptionMonthlyCost } from "@/lib/finance/calculations";
import { cn } from "@/lib/utils";
import type {
  SerializedFinanceAccount,
  SerializedFinanceCategory,
  SerializedFinanceSubscription
} from "@/types/finance";

interface FinanceSubscriptionsPageProps {
  accounts: SerializedFinanceAccount[];
  categories: SerializedFinanceCategory[];
  initialSubscriptions: SerializedFinanceSubscription[];
}

export function FinanceSubscriptionsPage({
  accounts,
  categories,
  initialSubscriptions
}: FinanceSubscriptionsPageProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [editingSubscription, setEditingSubscription] = useState<SerializedFinanceSubscription | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ cycle: "", query: "", status: "active" });
  const filteredSubscriptions = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return subscriptions
      .filter((subscription) => {
        const matchesStatus =
          filters.status === "all" ? true : filters.status === "active" ? subscription.isActive : !subscription.isActive;
        const matchesCycle = filters.cycle ? subscription.billingCycle === filters.cycle : true;
        const matchesQuery = query
          ? [subscription.name, subscription.note, subscription.category?.name, subscription.account?.name]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query)
          : true;

        return matchesStatus && matchesCycle && matchesQuery;
      })
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  }, [filters, subscriptions]);
  const activeMonthlyTotal = subscriptions
    .filter((subscription) => subscription.isActive)
    .reduce((sum, subscription) => sum + getSubscriptionMonthlyCost(subscription), 0);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function upsertSubscription(subscription: SerializedFinanceSubscription) {
    setSubscriptions((current) => {
      const exists = current.some((item) => item.id === subscription.id);
      return exists ? current.map((item) => (item.id === subscription.id ? subscription : item)) : [subscription, ...current];
    });
    setEditingSubscription(null);
    setShowCreate(false);
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

    upsertSubscription(data.subscription);
  }

  async function deleteSubscription(subscriptionId: string) {
    const response = await fetch(`/api/finance/subscriptions/${subscriptionId}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not delete subscription.");
      return;
    }

    setSubscriptions((current) => current.filter((subscription) => subscription.id !== subscriptionId));
  }

  return (
    <div className="grid gap-4">
      <section className="lofi-panel rounded-2xl p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-dusk-amber">Recurring Bills</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-100">รายจ่ายประจำ</h1>
            <p className="mt-2 text-sm text-stone-400">
              ใส่บิลที่จ่ายซ้ำ เช่น AI tools, ค่าเน็ต, hosting หรือ streaming เพื่อดูว่าทุกเดือนเงินออกประจำเท่าไหร่
            </p>
          </div>
          <Button type="button" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Add Recurring Bill
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
              placeholder="Search recurring bill..."
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
            />
          </label>
          <select className="h-11 rounded-md border border-white/10 bg-ink-950/70 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="all">All</option>
          </select>
          <select className="h-11 rounded-md border border-white/10 bg-ink-950/70 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70" value={filters.cycle} onChange={(event) => updateFilter("cycle", event.target.value)}>
            <option value="">All cycles</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Monthly cost</p>
            <p className="text-sm font-semibold text-dusk-amber">{formatMoney(activeMonthlyTotal)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {filteredSubscriptions.length === 0 ? (
          <FinanceEmptyState
            icon={Search}
            title="No recurring bills found"
            description="You don't have any active subscriptions or recurring bills matching these filters."
            actionLabel="Add Recurring Bill"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          filteredSubscriptions.map((subscription) => (
            <article key={subscription.id} className="lofi-panel rounded-lg p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FinanceCategoryIcon className="text-dusk-lavender" icon={subscription.category?.icon} label={subscription.category?.name ?? subscription.name} />
                    <h2 className="truncate text-base font-semibold text-stone-100">{subscription.name}</h2>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]",
                        subscription.isActive
                          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-300"
                          : "border-white/10 bg-white/5 text-stone-400"
                      )}
                    >
                      {subscription.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-dusk-cyan">
                    <CalendarClock className="h-3 w-3" />
                    {getDueLabel(subscription.nextBillingDate)} / {subscription.billingCycle.toLowerCase()}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {subscription.category?.name ?? "Uncategorized"} / {subscription.account?.name ?? "No account"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-dusk-amber">{formatMoney(subscription.amount)}</p>
                    <p className="text-[11px] text-stone-500">{formatMoney(getSubscriptionMonthlyCost(subscription))}/mo</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => void toggleSubscription(subscription)}>
                      {subscription.isActive ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <CircleOff className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingSubscription(subscription)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => void deleteSubscription(subscription.id)}>
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {showCreate || editingSubscription ? (
        <SubscriptionForm
          accounts={accounts}
          categories={availableCategories}
          error={error}
          subscription={editingSubscription}
          onClose={() => {
            setShowCreate(false);
            setEditingSubscription(null);
          }}
          onCategoryCreated={(category) => setAvailableCategories((current) => [...current, category])}
          onError={setError}
          onSubmit={upsertSubscription}
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

function getDueLabel(nextBillingDate: string) {
  const today = new Date();
  const dueDate = new Date(nextBillingDate);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
  const dateText = dueDate.toLocaleDateString();

  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d (${dateText})`;
  if (diffDays === 0) return `Due today (${dateText})`;
  if (diffDays === 1) return `Due tomorrow (${dateText})`;
  return `Due in ${diffDays}d (${dateText})`;
}
