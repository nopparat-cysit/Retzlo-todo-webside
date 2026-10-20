"use client";

import { useEffect, useState, useMemo } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  getStoredStatuses,
  getStatusMeta,
  saveStoredStatuses,
  STATUS_COLOR_CONFIGS,
  type CustomStatusOption
} from "@/lib/kanban/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@/types/kanban";

const STATUS_COLOR_KEYS = ["indigo", "teal", "cyan", "amber", "emerald", "rose", "purple", "stone"] as const;

const STATUS_COLOR_SWATCHES: Array<{ key: string; label: string; bgClass: string; borderClass: string }> = [
  { key: "indigo", label: "Indigo", bgClass: "bg-indigo-500", borderClass: "border-indigo-600" },
  { key: "teal", label: "Teal", bgClass: "bg-teal-500", borderClass: "border-teal-600" },
  { key: "cyan", label: "Cyan", bgClass: "bg-cyan-500", borderClass: "border-cyan-600" },
  { key: "amber", label: "Amber", bgClass: "bg-amber-500", borderClass: "border-amber-600" },
  { key: "emerald", label: "Emerald", bgClass: "bg-emerald-500", borderClass: "border-emerald-600" },
  { key: "rose", label: "Rose", bgClass: "bg-rose-500", borderClass: "border-rose-600" },
  { key: "purple", label: "Purple", bgClass: "bg-purple-500", borderClass: "border-purple-600" },
  { key: "stone", label: "Slate", bgClass: "bg-stone-500", borderClass: "border-stone-600" }
];

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

  const selectedColorConfig =
    STATUS_COLOR_CONFIGS[selectedMeta.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
  const previewColorConfig =
    STATUS_COLOR_CONFIGS[newStatusColor] || STATUS_COLOR_CONFIGS.indigo;

  return (
    <div className="space-y-3">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-theme-foreground">
            Card Status
          </label>
          <button
            type="button"
            onClick={() => setIsAddingStatus((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold border transition cursor-pointer",
              isAddingStatus
                ? "border-theme-accent/40 bg-theme-accent/15 text-theme-accent shadow-2xs"
                : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-accent/50 hover:text-theme-foreground"
            )}
            title="Create Custom Status"
            aria-label="Add Status"
          >
            <Plus className="h-3 w-3" />
            <span>Add Status</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-theme-muted uppercase tracking-wider hidden sm:inline">
            Default:
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold shadow-2xs",
              selectedMeta.badgeClass
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                selectedColorConfig.dot
              )}
            />
            <span>{selectedMeta.label}</span>
          </span>
        </div>
      </div>

      {/* Quick Add Custom Status Inline Panel */}
      {isAddingStatus && (
        <div className="rounded-2xl border border-theme-border bg-theme-panel p-4 space-y-3.5 shadow-lg animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-theme-accent/15 text-theme-accent">
                <Plus className="h-3.5 w-3.5" />
              </span>
              <div>
                <h5 className="text-xs font-bold text-theme-foreground">
                  Create New Status
                </h5>
                <p className="text-[10px] text-theme-muted">
                  Add a custom workflow status for this board
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddingStatus(false);
                setNewStatusLabel("");
              }}
              className="text-theme-muted hover:text-theme-foreground hover:bg-theme-paper p-1 rounded-lg transition cursor-pointer"
              aria-label="Close add status"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section 1: Status Label & Live Badge Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="new-status-label-input" className="text-[11px] font-bold uppercase tracking-wider text-theme-foreground">
                Status Label <span className="text-theme-danger">*</span>
              </label>

              {/* Dynamic Real-time Live Badge Preview */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-theme-muted uppercase tracking-wider">
                  Preview:
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs transition-all",
                    previewColorConfig.badgeClass
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      previewColorConfig.dot
                    )}
                  />
                  <span className="truncate max-w-[140px]">
                    {newStatusLabel.trim() || "Status Name"}
                  </span>
                </span>
              </div>
            </div>

            <Input
              id="new-status-label-input"
              autoFocus
              placeholder="Status label, e.g. In Review, QA, Blocked..."
              value={newStatusLabel}
              onChange={(e) => setNewStatusLabel(e.target.value)}
              className="h-10 text-xs rounded-xl bg-theme-paper border-theme-border font-medium focus:border-theme-accent"
              maxLength={30}
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
          </div>

          {/* Section 2: Accent Color Swatches */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                Status Color
              </label>
              <span className="text-[10px] text-theme-muted capitalize font-medium">
                {newStatusColor}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-0.5" role="radiogroup" aria-label="Status color">
              {STATUS_COLOR_SWATCHES.map((swatch) => {
                const isSelected = newStatusColor === swatch.key;
                return (
                  <button
                    key={swatch.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setNewStatusColor(swatch.key)}
                    className={cn(
                      "group relative h-7 w-7 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs hover:scale-110",
                      swatch.bgClass,
                      swatch.borderClass,
                      isSelected
                        ? "ring-2 ring-theme-accent ring-offset-2 ring-offset-theme-paper scale-110 shadow-xs"
                        : "opacity-75 hover:opacity-100"
                    )}
                    title={swatch.label}
                  >
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-white stroke-[3] drop-shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-theme-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingStatus(false);
                setNewStatusLabel("");
              }}
              className="h-8 text-xs text-theme-muted hover:text-theme-foreground cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!newStatusLabel.trim()}
              onClick={handleQuickAddStatus}
              className="h-8 text-xs font-semibold px-3.5 shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Status</span>
            </Button>
          </div>
        </div>
      )}

      {/* Statuses Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {displayStatuses.map((option) => {
          const meta = getStatusMeta(option.value, displayStatuses);
          const selected = option.value.toUpperCase() === (value || "").toUpperCase();
          const colorConfig = STATUS_COLOR_CONFIGS[option.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;

          return (
            <button
              key={option.value}
              aria-label={`Use ${meta.label} as default card status`}
              className={cn(
                "group relative flex items-center justify-between gap-1.5 rounded-xl border p-2 text-xs font-medium transition cursor-pointer text-left",
                selected
                  ? "border-theme-accent bg-theme-paper-strong text-theme-foreground shadow-xs ring-1 ring-theme-accent/40"
                  : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-accent/60 hover:text-theme-foreground hover:bg-theme-paper-strong/30"
              )}
              title={meta.label}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold truncate max-w-full", meta.badgeClass)}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", colorConfig.dot)} />
                <span className="truncate">{meta.label}</span>
              </span>
              {selected ? (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-theme-accent text-white dark:text-stone-900 shrink-0">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Quick Add Button in Grid */}
        <button
          type="button"
          onClick={() => setIsAddingStatus(true)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border border-dashed p-2 text-xs font-semibold transition cursor-pointer text-center",
            isAddingStatus
              ? "border-theme-accent bg-theme-accent/10 text-theme-accent shadow-xs"
              : "border-theme-border bg-theme-paper/40 text-theme-muted hover:border-theme-accent/60 hover:text-theme-foreground hover:bg-theme-paper"
          )}
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