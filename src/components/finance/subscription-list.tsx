import { CalendarClock, CheckCircle2, CircleOff } from "lucide-react";

import { getSubscriptionMonthlyCost } from "@/lib/finance/calculations";
import { cn } from "@/lib/utils";
import type { SerializedFinanceSubscription } from "@/types/finance";

interface SubscriptionListProps {
  subscriptions: SerializedFinanceSubscription[];
  onToggle: (subscription: SerializedFinanceSubscription) => void;
  onDelete: (subscriptionId: string) => void;
}

export function SubscriptionList({ subscriptions, onDelete, onToggle }: SubscriptionListProps) {
  const activeSubscriptions = subscriptions
    .filter((subscription) => subscription.isActive)
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

  return (
    <section className="lofi-panel rounded-lg p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Recurring</p>
        <h2 className="mt-1 text-xl font-semibold text-stone-100">Active Recurring Bills</h2>
      </div>
      {activeSubscriptions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-stone-500">
          No active recurring bills.
        </div>
      ) : (
        <div className="space-y-2">
          {activeSubscriptions.map((subscription) => (
            <article key={subscription.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-stone-100">{subscription.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-dusk-cyan">
                    <CalendarClock className="h-3 w-3" />
                    {getDueLabel(subscription.nextBillingDate)} / {subscription.billingCycle.toLowerCase()}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {subscription.category?.name ?? "Uncategorized"} / {subscription.account?.name ?? "No account"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-dusk-amber">{formatMoney(subscription.amount)}</p>
                  <p className="text-[11px] text-stone-500">{formatMoney(getSubscriptionMonthlyCost(subscription))}/mo</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  className={cn(
                    "inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs transition",
                    subscription.isActive
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
                      : "border-white/10 bg-white/5 text-stone-400"
                  )}
                  type="button"
                  onClick={() => onToggle(subscription)}
                >
                  {subscription.isActive ? <CheckCircle2 className="h-3 w-3" /> : <CircleOff className="h-3 w-3" />}
                  {subscription.isActive ? "Active" : "Paused"}
                </button>
                <button
                  className="h-8 rounded-md border border-red-300/20 bg-red-400/10 px-2 text-xs text-red-200 transition hover:bg-red-400/20"
                  type="button"
                  onClick={() => onDelete(subscription.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
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
