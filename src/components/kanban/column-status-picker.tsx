"use client";

import { useEffect, useState, useMemo } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  getStoredStatuses,
  getStatusMeta,
  saveStoredStatuses,
  type CustomStatusOption
} from "@/lib/kanban/status";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@/types/kanban";

const STATUS_COLOR_KEYS = ["indigo", "teal", "cyan", "amber", "emerald", "rose", "purple", "stone"] as const;

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
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<CustomStatusOption[]>(() => {
    if (customStatuses && customStatuses.length > 0) return customStatuses;
    return getStoredStatuses(boardId);
  });

  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState<string>("indigo");

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

  const handleQuickAddStatus = () => {
    const trimmed = newStatusLabel.trim();
    if (!trimmed) return;

    // Generate unique uppercase slug value
    const baseValue =
      trimmed
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "") || `STATUS_${Date.now()}`;

    let statusValue = baseValue;
    let counter = 1;
    while (statuses.some((s) => s.value.toUpperCase() === statusValue.toUpperCase())) {
      statusValue = `${baseValue}_${counter}`;
      counter++;
    }

    const newStatus: CustomStatusOption = {
      value: statusValue,
      label: trimmed,
      color: newStatusColor
    };

    const next = [...statuses, newStatus];
    setStatuses(next);
    saveStoredStatuses(next, boardId);
    onChange(newStatus.value);
    setIsAddingStatus(false);
    setNewStatusLabel("");
    toast({ message: `Status "${newStatus.label}" added successfully`, type: "success" });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Card status</span>
          <button
            type="button"
            onClick={() => setIsAddingStatus((prev) => !prev)}
            className="grid h-5 w-5 place-items-center rounded-md text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
            title="Add Status"
            aria-label="Add Status"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className={cn("rounded border px-2 py-0.5 text-[10px]", selectedMeta.badgeClass)}>
          {selectedMeta.label}
        </span>
      </div>

      {/* Quick Add Custom Status Inline Panel */}
      {isAddingStatus && (
        <div className="rounded-xl border border-stone-200/90 bg-stone-50/90 p-3 space-y-2.5 dark:border-white/10 dark:bg-white/[0.04] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
              <span>Add Status</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAddingStatus(false);
                setNewStatusLabel("");
              }}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 rounded cursor-pointer"
              aria-label="Close add status"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              autoFocus
              placeholder="Status label, e.g. In Review, QA, Blocked..."
              value={newStatusLabel}
              onChange={(e) => setNewStatusLabel(e.target.value)}
              className="h-8 text-xs flex-1 bg-white dark:bg-stone-900"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleQuickAddStatus();
                }
                if (e.key === "Escape") {
                  setIsAddingStatus(false);
                }
              }}
            />
            <div className="flex items-center gap-1 shrink-0 justify-center py-0.5">
              {STATUS_COLOR_KEYS.map((colKey) => (
                <button
                  key={colKey}
                  type="button"
                  onClick={() => setNewStatusColor(colKey)}
                  className={cn(
                    "h-5 w-5 rounded-full border transition cursor-pointer flex items-center justify-center shrink-0",
                    newStatusColor === colKey
                      ? "ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-xs"
                      : "opacity-70 hover:opacity-100",
                    colKey === "indigo" && "bg-indigo-500 border-indigo-600",
                    colKey === "teal" && "bg-teal-500 border-teal-600",
                    colKey === "cyan" && "bg-cyan-500 border-cyan-600",
                    colKey === "amber" && "bg-amber-500 border-amber-600",
                    colKey === "emerald" && "bg-emerald-500 border-emerald-600",
                    colKey === "rose" && "bg-rose-500 border-rose-600",
                    colKey === "purple" && "bg-purple-500 border-purple-600",
                    colKey === "stone" && "bg-stone-500 border-stone-600"
                  )}
                  title={colKey}
                >
                  {newStatusColor === colKey && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setIsAddingStatus(false);
                setNewStatusLabel("");
              }}
              className="rounded-lg px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-200/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!newStatusLabel.trim()}
              onClick={handleQuickAddStatus}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-40 dark:bg-dusk-lavender dark:text-stone-950 dark:hover:bg-dusk-lavender/90 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Status</span>
            </button>
          </div>
        </div>
      )}

      {/* Statuses Grid */}
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

        {/* Quick Add Button in Grid */}
        <button
          type="button"
          onClick={() => setIsAddingStatus(true)}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300/80 p-2 text-xs font-semibold text-stone-500 transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-white/15 dark:text-stone-400 dark:hover:border-dusk-lavender/50 dark:hover:bg-dusk-lavender/10 dark:hover:text-dusk-lavender cursor-pointer text-center"
          title="Add Status"
          aria-label="Add custom status"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Status</span>
        </button>
      </div>
    </div>
  );
}