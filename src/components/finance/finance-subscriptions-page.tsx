"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, CircleOff, Edit3, Plus, Search, Trash2 } from "lucide-react";

import { SubscriptionForm } from "@/components/finance/subscription-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FinanceEmptyState } from "./finance-empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinanceCategoryIcon } from "@/lib/finance/category-icons";
import { getSubscriptionMonthlyCost } from "@/lib/finance/calculations";
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
            <h1 className="mt-2 text-3xl font-semibold text-stone-100">Recurring Bills</h1>
            <p className="mt-2 text-sm text-stone-400">
              Track repeated expenses such as AI tools, internet, hosting, domains, and streaming.
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
                    <Badge variant={subscription.isActive ? "cyan" : "muted"}>{subscription.isActive ? "Active" : "Paused"}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-dusk-cyan">
                    <CalendarClock className="h-3 w-3" />
                    {getDueLabel(subscription.nextBillingDate)} / {subscription.billingCycle.toLowerCase()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="muted">{subscription.category?.name ?? "Uncategorized"}</Badge>
                    <Badge variant="muted">{subscription.account?.name ?? "No account"}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-dusk-amber">{formatMoney(subscription.amount)}</p>
                    <p className="text-[11px] text-stone-500">{formatMoney(getSubscriptionMonthlyCost(subscription))}/mo</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => void toggleSubscription(subscription)}
                      aria-label={subscription.isActive ? "Pause subscription" : "Activate subscription"}
                    >
                      {subscription.isActive ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <CircleOff className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setEditingSubscription(subscription)} aria-label="Edit recurring bill">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => void deleteSubscription(subscription.id)} aria-label="Delete recurring bill">
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
