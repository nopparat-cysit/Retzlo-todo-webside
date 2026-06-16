import { CalendarClock, CheckCircle2, CircleOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSubscriptionMonthlyCost } from "@/lib/finance/calculations";
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
        <div className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-stone-400">
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
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="muted">{subscription.category?.name ?? "Uncategorized"}</Badge>
                    <Badge variant="muted">{subscription.account?.name ?? "No account"}</Badge>
                    <Badge variant="rose">{subscription.isActive ? "Active" : "Paused"}</Badge>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-dusk-amber">{formatMoney(subscription.amount)}</p>
                  <p className="text-[11px] text-stone-500">{formatMoney(getSubscriptionMonthlyCost(subscription))}/mo</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => onToggle(subscription)}
                >
                  {subscription.isActive ? <CheckCircle2 className="h-3 w-3" /> : <CircleOff className="h-3 w-3" />}
                  {subscription.isActive ? "Active" : "Paused"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  type="button"
                  onClick={() => onDelete(subscription.id)}
                >
                  Delete
                </Button>
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
