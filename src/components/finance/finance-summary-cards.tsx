import { ArrowDownRight, ArrowUpRight, CreditCard, WalletCards } from "lucide-react";

import { cn } from "@/lib/utils";

interface FinanceSummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
  subscriptionMonthlyCost: number;
}

export function FinanceSummaryCards({
  income,
  expense,
  balance,
  subscriptionMonthlyCost
}: FinanceSummaryCardsProps) {
  const cards = [
    {
      label: "Income this month",
      value: income,
      icon: ArrowUpRight,
      tone: "text-emerald-300",
      border: "border-emerald-300/20"
    },
    {
      label: "Expense this month",
      value: expense,
      icon: ArrowDownRight,
      tone: "text-dusk-rose",
      border: "border-dusk-rose/20"
    },
    {
      label: "Balance this month",
      value: balance,
      icon: WalletCards,
      tone: balance >= 0 ? "text-dusk-cyan" : "text-dusk-rose",
      border: balance >= 0 ? "border-dusk-cyan/20" : "border-dusk-rose/20"
    },
    {
      label: "Subscription / month",
      value: subscriptionMonthlyCost,
      icon: CreditCard,
      tone: "text-dusk-amber",
      border: "border-dusk-amber/20"
    }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.label} className={cn("lofi-panel rounded-lg p-4", card.border)}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{card.label}</p>
              <Icon className={cn("h-4 w-4", card.tone)} />
            </div>
            <p className={cn("mt-4 text-2xl font-semibold", card.tone)}>{formatMoney(card.value)}</p>
          </article>
        );
      })}
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
}
