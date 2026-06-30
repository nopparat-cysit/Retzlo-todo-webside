"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, CreditCard, Landmark, LayoutDashboard, Repeat, TrendingDown, TrendingUp, Menu, PanelLeftClose } from "lucide-react";

import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { UserProfilePopover } from "@/components/project/user-profile-popover";

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

const STATUS_COLORS: Record<string, string> = {
  ONLINE: "bg-emerald-400",
  BUSY: "bg-dusk-amber",
  OFFLINE: "bg-stone-500",
};

interface FinanceShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userAvatar: string | null | undefined;
  userStatus: string | null | undefined;
}

export function FinanceShell({
  children,
  userName,
  userEmail,
  userAvatar,
  userStatus
}: FinanceShellProps) {
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

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statusColor = STATUS_COLORS[userStatus ?? "ONLINE"] ?? "bg-stone-500";

  return (
    <main className="soft-grid-bg min-h-screen w-full overflow-hidden p-3">
      <input id="project-sidebar-toggle" className="peer sr-only" type="checkbox" />
      <label
        htmlFor="project-sidebar-toggle"
        className="pointer-events-none fixed inset-0 z-[240] bg-ink-950/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 peer-checked:pointer-events-auto peer-checked:opacity-100 lg:hidden"
        aria-hidden="true"
      />
      <div className="project-shell-grid grid h-[calc(100vh-1.5rem)] min-h-0 gap-3 transition-[grid-template-columns] duration-200 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="project-sidebar lofi-panel fixed bottom-3 left-3 top-3 z-[250] flex min-h-0 w-[280px] -translate-x-[calc(100%+1rem)] flex-col overflow-hidden rounded-2xl bg-ink-950/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 peer-checked:translate-x-0 lg:relative lg:bottom-0 lg:left-0 lg:top-0 lg:z-10 lg:w-auto lg:translate-x-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/select-module"
                className="sidebar-expanded-only text-xs uppercase tracking-[0.3em] text-dusk-amber transition-opacity hover:opacity-70"
              >
                Workspace
              </Link>
              <label
                htmlFor="project-sidebar-toggle"
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.055] text-stone-300 transition hover:border-dusk-lavender/45 hover:bg-white/10 hover:text-dusk-lavender"
                title="Toggle sidebar"
                aria-label="Toggle sidebar"
              >
                <PanelLeftClose className="project-sidebar-toggle-icon h-4 w-4 transition-transform duration-200" />
              </label>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h1 className="sidebar-expanded-only text-2xl font-semibold leading-tight text-stone-100 truncate">
                {activeLedgerName ?? "Personal Ledger"}
              </h1>
            </div>

            <p className="sidebar-expanded-only mt-1 text-xs text-stone-500 uppercase tracking-wider">
              Finance Workspace
            </p>
          </div>

          <div className="my-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-soft">
            <nav className="grid gap-4">
              {financeNavGroups.map((group, groupIndex) => {
                return (
                  <div key={groupIndex} className="space-y-1">
                    {group.label && (
                      <p className="sidebar-expanded-only mb-1 px-3 text-[9px] uppercase tracking-[0.28em] text-stone-600 select-none">
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
                            aria-current={active ? "page" : undefined}
                            title={item.label}
                            className={cn(
                              "project-nav-link group relative flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-sm transition duration-200",
                              active && "project-nav-link-active border-dusk-lavender/40 bg-dusk-lavender/12 text-stone-50",
                              !active && "border-transparent bg-transparent text-stone-400 hover:border-white/10 hover:bg-white/[0.055] hover:text-stone-100"
                            )}
                            href={itemHref}
                          >
                            <span
                              className={cn(
                                "project-nav-active-marker absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition",
                                active ? "bg-dusk-lavender shadow-[0_0_10px_rgba(169,162,255,0.55)]" : "bg-transparent group-hover:bg-white/25"
                              )}
                            />
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0 project-sidebar-icon",
                                active ? "text-dusk-lavender" : "text-stone-400"
                              )}
                            />
                            <span className="sidebar-expanded-only truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-3 border-t border-white/5 pt-4">
            <div className="sidebar-expanded-only">
              <UserProfilePopover
                avatar={userAvatar}
                email={userEmail}
                initials={initials}
                name={userName}
                status={userStatus}
                statusColor={statusColor}
                variant="card"
              />
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col rounded-2xl">
          <header className="lofi-panel relative z-40 mb-3 flex min-h-14 items-center justify-between gap-3 overflow-visible rounded-2xl px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <label
                htmlFor="project-sidebar-toggle"
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-300 transition hover:border-dusk-lavender/45 hover:bg-white/10 hover:text-dusk-lavender lg:hidden"
                title="Open navigation"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </label>
              <BackButton />
              <div className="hidden h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-dusk-lavender sm:grid">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="hidden min-w-0 min-[560px]:block">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                  <span>Workspace</span>
                  <span className="text-stone-700">/</span>
                  <span className="text-dusk-amber">Finance</span>
                </div>
                <h2 className="truncate text-base font-semibold text-stone-100">
                  {activeLedgerName ?? "Personal Ledger"}
                </h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <UserProfilePopover
                avatar={userAvatar}
                email={userEmail}
                initials={initials}
                name={userName}
                status={userStatus}
                statusColor={statusColor}
                variant="avatar"
              />
            </div>
          </header>
          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto scrollbar-soft rounded-2xl">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
