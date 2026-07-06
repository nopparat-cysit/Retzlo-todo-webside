import { EmptyState } from "@/components/ui/state";

interface CategoryBreakdownProps {
  items: Array<{
    name: string;
    amount: number;
  }>;
}

export function CategoryBreakdown({ items }: CategoryBreakdownProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="lofi-panel rounded-lg p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Expense Map</p>
        <h2 className="mt-1 text-xl font-semibold text-stone-100">Category Breakdown</h2>
      </div>
      {items.length === 0 ? (
        <EmptyState
          className="border-dashed bg-white/[0.015] p-6"
          title="No expense map"
          message="Expenses will be grouped by category once transactions are recorded."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;

            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-stone-200">{item.name}</span>
                  <span className="text-dusk-rose">{formatMoney(item.amount)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-dusk-rose/70" style={{ width: `${pct}%` }} />
                </div>
              </div>
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
