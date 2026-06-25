"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, CreditCard, Landmark, LayoutDashboard, Repeat, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavGroup {
  label?: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const financeNavGroups: NavGroup[] = [
  {
    items: [
      { href: "/finance", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "Transactions",
    items: [
      { href: "/finance/income", label: "Income", icon: TrendingUp },
      { href: "/finance/recurring-income", label: "Recurring Income", icon: Repeat },
      { href: "/finance/expenses", label: "Expenses", icon: TrendingDown },
      { href: "/finance/subscriptions", label: "Recurring Bills", icon: CreditCard },
    ]
  },
  {
    label: "Money Places",
    items: [
      { href: "/finance/accounts", label: "Accounts", icon: Landmark },
    ]
  },
];

interface FinanceShellProps {
  children: React.ReactNode;
}

export function FinanceShell({ children }: FinanceShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ledgerId = searchParams.get("ledgerId");
  const [activeLedgerName, setActiveLedgerName] = useState<string | null>(null);

  useEffect(() => {
    if (!ledgerId) {
      setActiveLedgerName(null);
      return;
    }

    fetch("/api/finance/ledgers")
      .then((res) => res.json())
      .then((data: { ledgers?: { id: string; name: string }[] }) => {
        const found = data.ledgers?.find((l) => l.id === ledgerId);
        setActiveLedgerName(found?.name ?? null);
      })
      .catch(() => {});
  }, [ledgerId]);

  const isSelectionPage = pathname === "/finance" && !ledgerId;

  if (isSelectionPage) {
    return (
      <main className="soft-grid-bg min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    );
  }

  return (
    <main className="soft-grid-bg min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="lofi-panel h-fit rounded-2xl p-3 lg:sticky lg:top-4">
          <div className="mb-3 flex items-center gap-3 px-2 py-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-dusk-amber">Finance</p>
              <p className="truncate text-sm font-semibold text-stone-100">
                {activeLedgerName ?? "Personal Ledger"}
              </p>
            </div>
          </div>

          <nav className="grid gap-3">
            {financeNavGroups.map((group, groupIndex) => {
              const href = ledgerId
                ? `${group.items[0]?.href}?ledgerId=${ledgerId}`
                : group.items[0]?.href;
              void href;

              return (
                <div key={groupIndex}>
                  {group.label && (
                    <p className="mb-1 px-3 text-[9px] uppercase tracking-[0.28em] text-stone-600 select-none">
                      {group.label}
                    </p>
                  )}
                  <div className="grid gap-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href;
                      const Icon = item.icon;
                      const itemHref = ledgerId ? `${item.href}?ledgerId=${ledgerId}` : item.href;

                      return (
                        <Link
                          key={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition",
                            active
                              ? "border-dusk-lavender/35 bg-dusk-lavender/15 text-stone-100 shadow-[0_0_18px_rgba(196,167,231,0.12)]"
                              : "border-transparent text-stone-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-stone-100"
                          )}
                          href={itemHref}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", active ? "text-dusk-lavender" : "text-stone-500")} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                  {groupIndex < financeNavGroups.length - 1 && (
                    <div className="mt-2 border-t border-white/5" />
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
