"use client";

import { columnStatusOptions } from "@/lib/kanban/column-settings";
import { getStatusMeta } from "@/lib/kanban/status";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@/types/kanban";

export function ColumnStatusPicker({
  onChange,
  value
}: {
  onChange: (value: CardStatus) => void;
  value: CardStatus;
}) {
  const selectedMeta = getStatusMeta(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Card status</span>
        <span className={cn("rounded border px-2 py-0.5 text-[10px]", selectedMeta.badgeClass)}>
          {selectedMeta.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {columnStatusOptions.map((option) => {
          const meta = getStatusMeta(option.value);
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              aria-label={`Use ${option.label} as default card status`}
              className={cn(
                "rounded-lg border bg-white/[0.035] px-2 py-2 text-xs transition hover:-translate-y-0.5 hover:border-dusk-lavender/40",
                selected ? "border-dusk-amber shadow-[0_0_0_2px_rgba(249,199,132,0.16)]" : "border-white/10"
              )}
              title={option.label}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span className={cn("inline-flex rounded border px-2 py-0.5", meta.badgeClass)}>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}