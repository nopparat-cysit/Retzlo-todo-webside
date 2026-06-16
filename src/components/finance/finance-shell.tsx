"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart3, CreditCard, Landmark, LayoutDashboard, Repeat, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const financeNav = [
  { href: "/finance", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finance/income", label: "Income", icon: TrendingUp },
  { href: "/finance/recurring-income", label: "Recurring Income", icon: Repeat },
  { href: "/finance/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/finance/accounts", label: "Accounts", icon: Landmark },
  { href: "/finance/subscriptions", label: "Recurring Bills", icon: CreditCard }
];

interface FinanceShellProps {
  children: React.ReactNode;
}

export function FinanceShell({ children }: FinanceShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ledgerId = searchParams.get("ledgerId");

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
              <p className="truncate text-sm font-semibold text-stone-100">Personal Ledger</p>
            </div>
          </div>

          <nav className="grid gap-1">
            {financeNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const href = ledgerId ? `${item.href}?ledgerId=${ledgerId}` : item.href;

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition",
                    active
                      ? "border-dusk-lavender/35 bg-dusk-lavender/15 text-stone-100 shadow-[0_0_18px_rgba(196,167,231,0.12)]"
                      : "border-transparent text-stone-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-stone-100"
                  )}
                  href={href}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-dusk-lavender" : "text-stone-500")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
