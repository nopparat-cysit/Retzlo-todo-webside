import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SerializedFinanceTransaction } from "@/types/finance";

interface TransactionListProps {
  transactions: SerializedFinanceTransaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <section className="lofi-panel rounded-lg p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Ledger</p>
        <h2 className="mt-1 text-xl font-semibold text-stone-100">Recent Transactions</h2>
      </div>
      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-stone-500">
          No transactions yet.
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.slice(0, 12).map((transaction) => {
            const income = transaction.type === "INCOME";
            const Icon = income ? ArrowUpRight : ArrowDownRight;

            return (
              <article key={transaction.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", income ? "text-emerald-300" : "text-dusk-rose")} />
                      <h3 className="truncate text-sm font-semibold text-stone-100">{transaction.title}</h3>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      {transaction.category?.name ?? "Uncategorized"} / {transaction.account?.name ?? "No account"} /{" "}
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={cn("shrink-0 text-sm font-semibold", income ? "text-emerald-300" : "text-dusk-rose")}>
                    {income ? "+" : "-"}
                    {formatMoney(transaction.amount)}
                  </p>
                </div>
              </article>
            );
          })}
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
