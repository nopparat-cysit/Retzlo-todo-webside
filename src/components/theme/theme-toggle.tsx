"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "settings";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (variant === "settings") {
      return <div className="h-10 w-full skeleton-base rounded-xl" />;
    }
    if (variant === "dropdown") {
      return <div className="h-12 w-full skeleton-base rounded-lg" />;
    }
    return (
      <div
        className={cn(
          "h-9 w-9 skeleton-base rounded-xl border border-stone-200/80 dark:border-white/10",
          className
        )}
      />
    );
  }

  if (variant === "settings") {
    const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
      { value: "light", label: "Light", icon: Sun },
      { value: "dark", label: "Dark", icon: Moon },
      { value: "system", label: "System", icon: Laptop }
    ];

    return (
      <div className={cn("grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200/90 bg-stone-100/80 p-1 dark:border-white/10 dark:bg-white/[0.04]", className)}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition select-none cursor-pointer",
                isSelected
                  ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-indigo-600 dark:text-dusk-lavender" : "text-stone-400")} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "dropdown") {
    const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
      { value: "light", label: "Light", icon: Sun },
      { value: "dark", label: "Dark", icon: Moon },
      { value: "system", label: "System", icon: Laptop }
    ];

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="flex items-center justify-between px-0.5 text-[11px] font-medium text-stone-400">
          <span>Theme</span>
          <span className="font-mono text-[10px] uppercase text-stone-500">{theme}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-stone-200/90 bg-stone-100/80 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTheme(opt.value);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition select-none cursor-pointer",
                  isSelected
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title={`Switch to ${opt.label} theme`}
              >
                <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-indigo-600 dark:text-dusk-lavender" : "text-stone-400")} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default "icon" variant
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-xl border transition-all duration-300 select-none cursor-pointer",
        isDark
          ? "border-white/10 bg-white/[0.045] text-stone-300 hover:border-dusk-amber/50 hover:bg-dusk-amber/15 hover:text-dusk-amber"
          : "border-stone-300/80 bg-white text-stone-700 hover:border-dusk-lavender hover:bg-dusk-lavender/10 hover:text-dusk-lavender shadow-xs",
        className
      )}
      title={isDark ? "Switch to Light mode (Warm Paper)" : "Switch to Dark mode (Retro Lofi)"}
      aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
