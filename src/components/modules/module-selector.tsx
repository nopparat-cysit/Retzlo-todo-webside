"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Building2, CheckSquare, Dumbbell, Lock, Sparkles, Star, Users, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { getDefaultModule, setDefaultModule } from "@/lib/modules/default-module";

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
  const { toast } = useToast();
  const [defaultMod, setDefaultMod] = useState<string | null>(null);

  useEffect(() => {
    setDefaultMod(getDefaultModule());
  }, []);

  function handleSelect(mod: Module) {
    if (!mod.available) return;
    router.push(mod.href);
  }

  function handleToggleStar(e: React.MouseEvent, mod: Module) {
    e.stopPropagation();
    if (!mod.available) return;

    if (defaultMod === mod.id) {
      setDefaultModule(null);
      setDefaultMod(null);
      toast({ message: `Removed "${mod.label}" as default startup module`, type: "info" });
    } else {
      setDefaultModule(mod.id);
      setDefaultMod(mod.id);
      toast({ message: `"${mod.label}" set as default startup module!`, type: "success" });
    }
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
        <p className="mt-1 font-mono text-xs text-stone-500">
          Tip: Click the <span className="text-dusk-amber">★</span> on any module to set it as your default startup page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => {
          const isDefault = defaultMod === mod.id;

          return (
            <button
              key={mod.id}
              type="button"
              disabled={!mod.available}
              onClick={() => handleSelect(mod)}
              className={cn(
                "module-card group relative flex flex-col gap-4 rounded-2xl border p-6 text-left transition-all duration-300",
                mod.available
                  ? isDefault
                    ? "cursor-pointer border-dusk-amber/50 bg-dusk-amber/[0.04] shadow-[0_0_32px_rgba(229,189,114,0.12)] hover:border-dusk-amber/70 hover:bg-dusk-amber/[0.07]"
                    : "cursor-pointer border-white/10 bg-white/[0.04] hover:border-dusk-lavender/40 hover:bg-white/[0.07] hover:shadow-[0_0_32px_rgba(139,92,246,0.15)]"
                  : "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
              )}
            >
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors",
                    mod.available
                      ? isDefault
                        ? "border border-dusk-amber/40 bg-dusk-amber/20 font-semibold text-dusk-amber shadow-[0_0_12px_rgba(229,189,114,0.25)]"
                        : "bg-dusk-lavender/20 text-dusk-lavender"
                      : "bg-white/5 text-stone-600"
                  )}
                >
                  {isDefault ? "★ Default" : mod.tag}
                </span>

                {mod.available && (
                  <button
                    type="button"
                    aria-label={
                      isDefault
                        ? `Remove ${mod.label} as default module`
                        : `Set ${mod.label} as default startup module`
                    }
                    title={
                      isDefault
                        ? "Default startup module (Click to remove)"
                        : "Set as default startup module"
                    }
                    onClick={(e) => handleToggleStar(e, mod)}
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-lg border transition-all duration-200",
                      isDefault
                        ? "border-dusk-amber/60 bg-dusk-amber/25 text-dusk-amber shadow-[0_0_14px_rgba(229,189,114,0.35)] hover:scale-110"
                        : "border-white/10 bg-ink-950/40 text-stone-500 hover:border-dusk-amber/40 hover:text-dusk-amber hover:scale-110"
                    )}
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        isDefault ? "fill-dusk-amber text-dusk-amber" : "text-stone-400"
                      )}
                    />
                  </button>
                )}
              </div>

              <div
                className={cn(
                  "grid h-14 w-14 place-items-center rounded-2xl border transition-colors",
                  mod.available
                    ? isDefault
                      ? "border-dusk-amber/40 bg-gradient-to-br from-dusk-amber/15 to-transparent text-dusk-amber group-hover:border-dusk-amber/60"
                      : "border-dusk-lavender/30 bg-gradient-to-br from-dusk-lavender/10 to-transparent text-dusk-lavender group-hover:border-dusk-lavender/60"
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
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-opacity duration-200",
                    isDefault ? "text-dusk-amber" : "text-dusk-lavender",
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  Enter module
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}



