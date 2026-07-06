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
      className={cn("inline-flex min-w-0 rounded-lg border border-white/10 bg-ink-950/45 p-1", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const selected = item.value === value;

        return (
          <button
            key={item.value}
            className={cn(
              "motion-interactive inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold text-stone-400 outline-none transition focus-visible:ring-2 focus-visible:ring-dusk-lavender/45",
              selected
                ? "bg-dusk-lavender text-ink-950 shadow-[0_10px_22px_rgba(169,162,255,0.18)]"
                : "hover:bg-white/[0.06] hover:text-stone-100"
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
