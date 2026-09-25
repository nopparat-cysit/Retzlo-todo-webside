"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SegmentedControlItem<TValue extends string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
}

export interface SegmentedControlProps<TValue extends string> {
  value: TValue;
  items: Array<SegmentedControlItem<TValue>>;
  onValueChange: (value: TValue) => void;
  "aria-label": string;
  className?: string;
}

export function SegmentedControl<TValue extends string>({
  value,
  items,
  onValueChange,
  className,
  "aria-label": ariaLabel
}: SegmentedControlProps<TValue>) {
  return (
    <div
      className={cn(
        "segmented-control inline-flex min-w-0 rounded-lg border border-stone-200/90 bg-stone-100/90 p-1 dark:border-white/10 dark:bg-ink-950/45",
        className
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const selected = item.value === value;

        return (
          <button
            key={item.value}
            className={cn(
              "motion-interactive inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-dusk-lavender/45",
              selected
                ? "bg-dusk-lavender text-stone-900 font-bold shadow-sm dark:bg-dusk-lavender dark:text-ink-950 dark:shadow-[0_10px_22px_rgba(169,162,255,0.18)]"
                : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-100"
            )}
            type="button"
            aria-pressed={selected}
            onClick={() => onValueChange(item.value)}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
