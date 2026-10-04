"use client";

import { useEffect, useState, useMemo } from "react";
import { getStoredStatuses, getStatusMeta, type CustomStatusOption } from "@/lib/kanban/status";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@/types/kanban";

export interface ColumnStatusPickerProps {
  value: CardStatus;
  onChange: (value: CardStatus) => void;
  boardId?: string;
  customStatuses?: CustomStatusOption[];
}

export function ColumnStatusPicker({
  onChange,
  value,
  boardId,
  customStatuses
}: ColumnStatusPickerProps) {
  const [statuses, setStatuses] = useState<CustomStatusOption[]>(() => {
    if (customStatuses && customStatuses.length > 0) return customStatuses;
    return getStoredStatuses(boardId);
  });

  useEffect(() => {
    if (customStatuses && customStatuses.length > 0) {
      setStatuses(customStatuses);
    } else {
      setStatuses(getStoredStatuses(boardId));
    }
  }, [customStatuses, boardId]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.boardId || detail.boardId === boardId) {
        if (detail?.statuses && Array.isArray(detail.statuses)) {
          setStatuses(detail.statuses);
        } else {
          setStatuses(getStoredStatuses(boardId));
        }
      }
    };
    window.addEventListener("retzlo:statuses-updated", handleUpdate);
    return () => window.removeEventListener("retzlo:statuses-updated", handleUpdate);
  }, [boardId]);

  // Combine statuses, ensuring current value is represented if not in list
  const displayStatuses = useMemo(() => {
    const list = [...statuses];
    const exists = list.some((s) => s.value.toUpperCase() === (value || "").toUpperCase());
    if (!exists && value) {
      list.push({
        value,
        label: value,
        color: "indigo"
      });
    }
    return list;
  }, [statuses, value]);

  const selectedMeta = getStatusMeta(value, displayStatuses);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Card status</span>
        <span className={cn("rounded border px-2 py-0.5 text-[10px]", selectedMeta.badgeClass)}>
          {selectedMeta.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {displayStatuses.map((option) => {
          const meta = getStatusMeta(option.value, displayStatuses);
          const selected = option.value.toUpperCase() === (value || "").toUpperCase();

          return (
            <button
              key={option.value}
              aria-label={`Use ${meta.label} as default card status`}
              className={cn(
                "rounded-lg border px-2 py-2 text-xs transition hover:-translate-y-0.5 hover:border-dusk-lavender/40 cursor-pointer text-center",
                selected
                  ? "border-dusk-amber bg-dusk-amber/15 shadow-[0_0_0_2px_rgba(249,199,132,0.25)]"
                  : "border-stone-200/80 bg-white text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-300"
              )}
              title={meta.label}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span className={cn("inline-flex rounded border px-2 py-0.5 text-xs font-medium truncate max-w-full", meta.badgeClass)}>
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}