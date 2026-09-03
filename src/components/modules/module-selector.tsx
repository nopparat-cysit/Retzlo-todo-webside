"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Building2, CheckSquare, Dumbbell, Lock, Sparkles, Users, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  available: boolean;
  tag?: string;
}

const MODULES: Module[] = [
  {
    id: "todo",
    label: "TODO",
    description: "Project workspaces, Kanban boards, calendar, notes, and diary tracking.",
    icon: <CheckSquare className="h-8 w-8" />,
    href: "/projects",
    available: true,
    tag: "Active"
  },
  {
    id: "finance",
    label: "FINANCE",
    description: "Personal income, expenses, accounts, categories, and recurring bills.",
    icon: <WalletCards className="h-8 w-8" />,
    href: "/finance",
    available: true,
    tag: "Phase 1"
  },
  {
    id: "vital",
    label: "VITAL HUB",
    description: "Calorie tracking, macro logging, workout planner, weight progress, and calm recovery system.",
    icon: <Dumbbell className="h-8 w-8" />,
    href: "/hub",
    available: true,
    tag: "New"
  },
  {
    id: "office",
    label: "OFFICE",
    description: "A lightweight interactive room for work, notes, finance, rewards, and future AI helpers.",
    icon: <Building2 className="h-8 w-8" />,
    href: "/office",
    available: true,
    tag: "Beta"
  },
  {
    id: "hr",
    label: "HR",
    description: "Team management, leave tracking, and performance reviews.",
    icon: <Users className="h-8 w-8" />,
    href: "#",
    available: false,
    tag: "Coming soon"
  },
  {
    id: "analytics",
    label: "ANALYTICS",
    description: "Insights, dashboards, and performance metrics across all modules.",
    icon: <BarChart3 className="h-8 w-8" />,
    href: "#",
    available: false,
    tag: "Coming soon"
  }
];

export function ModuleSelector() {
  const router = useRouter();

  function handleSelect(mod: Module) {
    if (!mod.available) return;
    router.push(mod.href);
  }

  return (
    <div className="module-selector-container">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-dusk-lavender/20 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.28em] text-dusk-amber">
          <Sparkles className="h-3.5 w-3.5 text-dusk-lavender" />
          Module Hub
        </div>
        <h1 className="text-4xl font-semibold text-stone-100 sm:text-5xl">Select Module</h1>
        <p className="mt-3 text-stone-400">Choose a workspace module to enter.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <button
            key={mod.id}
            type="button"
            disabled={!mod.available}
            onClick={() => handleSelect(mod)}
            className={cn(
              "module-card group relative flex flex-col gap-4 rounded-2xl border p-6 text-left transition-all duration-300",
              mod.available
                ? "cursor-pointer border-white/10 bg-white/[0.04] hover:border-dusk-lavender/40 hover:bg-white/[0.07] hover:shadow-[0_0_32px_rgba(139,92,246,0.15)]"
                : "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
            )}
          >
            <span
              className={cn(
                "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest",
                mod.available
                  ? "bg-dusk-lavender/20 text-dusk-lavender"
                  : "bg-white/5 text-stone-600"
              )}
            >
              {mod.tag}
            </span>

            <div
              className={cn(
                "grid h-14 w-14 place-items-center rounded-2xl border",
                mod.available
                  ? "border-dusk-lavender/30 bg-gradient-to-br from-dusk-lavender/10 to-transparent text-dusk-lavender group-hover:border-dusk-lavender/60"
                  : "border-white/5 bg-white/[0.03] text-stone-600"
              )}
            >
              {mod.available ? mod.icon : <Lock className="h-6 w-6 text-stone-600" />}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-stone-100">{mod.label}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">{mod.description}</p>
            </div>

            {mod.available && (
              <div className="flex items-center gap-2 text-sm font-medium text-dusk-lavender opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Enter module
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}


