"use client";

import { Calendar, CheckCircle2, Circle, Coins, Minus, Plus, Repeat, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  isDiaryChecklistItemCompletedOnDate,
  isDiaryChecklistItemDueOnDate,
  normalizeDiaryChecklist,
  hasDiaryRewardBeenClaimed,
  toggleDiaryChecklistCompletion,
  type DiaryChecklistItem,
  type DiaryRewardCoinType
} from "@/lib/diary/checklist";
import { cn } from "@/lib/utils";

interface DiaryChecklistEditorProps {
  defaultRepeatDays: number;
  defaultRepeatUnit?: "DAY" | "MONTH";
  defaultStartDate: string;
  onDefaultRepeatDaysChange: (days: number) => void;
  onDefaultRepeatUnitChange?: (unit: "DAY" | "MONTH") => void;
  onChange: (items: DiaryChecklistItem[]) => void;
  value: DiaryChecklistItem[];
}

export function getStartDayOfMonth(dateStr?: string): number {
  if (!dateStr) return 1;
  const parts = dateStr.slice(0, 10).split("-");
  return Number.parseInt(parts[2], 10) || 1;
}

const repeatPresets = [
  { label: "Daily (ทุกวัน)", days: 1, unit: "DAY" as const },
  { label: "3 days (3 วัน)", days: 3, unit: "DAY" as const },
  { label: "Weekly (สัปดาห์)", days: 7, unit: "DAY" as const },
  { label: "2 weeks (2 สัปดาห์)", days: 14, unit: "DAY" as const },
  { label: "Monthly (ทุกเดือน)", days: 1, unit: "MONTH" as const }
];

function toLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getOffsetLocalDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toLocalDateString(d);
}

const START_DATE_PRESETS = [
  { label: "วันนี้", offset: 0, title: "เริ่มตั้งแต่วันนี้" },
  { label: "+1 วัน", offset: 1, title: "เริ่มพรุ่งนี้ (+1 วัน)" },
  { label: "+3 วัน", offset: 3, title: "เริ่มในอีก 3 วัน" },
  { label: "+7 วัน", offset: 7, title: "เริ่มในอีก 1 สัปดาห์" }
];

const DUE_TIME_PRESETS = [
  { label: "09:00 เช้า", time: "09:00" },
  { label: "13:00 บ่าย", time: "13:00" },
  { label: "18:00 เย็น", time: "18:00" },
  { label: "21:00 ค่ำ", time: "21:00" }
];

const REPEAT_DAY_PRESETS = [
  { label: "ทุกวัน", days: 1, title: "ทำซ้ำทุกวัน (1 วัน)" },
  { label: "3 วัน", days: 3, title: "ทำซ้ำทุกๆ 3 วัน" },
  { label: "7 วัน (1 สัปดาห์)", days: 7, title: "ทำซ้ำทุก 7 วัน" },
  { label: "14 วัน (2 สัปดาห์)", days: 14, title: "ทำซ้ำทุก 14 วัน" },
  { label: "30 วัน", days: 30, title: "ทำซ้ำทุก 30 วัน" }
];

const REPEAT_MONTH_PRESETS = [
  { label: "ทุกเดือน", days: 1, title: "ทำซ้ำทุก 1 เดือน" },
  { label: "2 เดือน", days: 2, title: "ทำซ้ำทุก 2 เดือน" },
  { label: "3 เดือน (ไตรมาส)", days: 3, title: "ทำซ้ำทุก 3 เดือน" },
  { label: "6 เดือน (ครึ่งปี)", days: 6, title: "ทำซ้ำทุก 6 เดือน" },
  { label: "1 ปี (12 เดือน)", days: 12, title: "ทำซ้ำทุก 12 เดือน" }
];

export function DiaryChecklistEditor({
  defaultRepeatDays,
  defaultRepeatUnit = "DAY",
  defaultStartDate,
  onDefaultRepeatDaysChange,
  onDefaultRepeatUnitChange,
  onChange,
  value
}: DiaryChecklistEditorProps) {
  const items = value.map((item) => ({ ...item, startDate: item.startDate || defaultStartDate }));

  function updateItem(itemId: string, patch: Partial<DiaryChecklistItem>) {
    onChange(items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  }

  function addItem() {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        label: "",
        description: "",
        intervalDays: defaultRepeatDays,
        repeatUnit: defaultRepeatUnit ?? "DAY",
        startDate: defaultStartDate,
        dueTime: null,
        completedDates: []
      }
    ]);
  }

  function removeItem(itemId: string) {
    onChange(items.filter((item) => item.id !== itemId));
  }

  return (
    <section data-diary-checklist-editor="routine-builder" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-950/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2.5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-dusk-lavender">Checklist</p>
          <p className="mt-1 text-xs text-stone-500">Each item can repeat on its own schedule.</p>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Item
        </Button>
      </div>

      <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-dusk-amber">Default repeat</p>
            <p className="mt-1 text-[11px] text-stone-500">Used for new checklist items and diary fallback.</p>
          </div>
          <div className="flex items-center rounded-lg border border-white/10 bg-ink-950/60 p-0.5 shadow-inner">
            <button
              type="button"
              aria-label="Decrease default interval"
              onClick={() => onDefaultRepeatDaysChange(Math.max(1, defaultRepeatDays - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-theme-muted transition hover:bg-theme-paper hover:text-theme-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              disabled={defaultRepeatDays <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={365}
              name="intervalDays"
              value={defaultRepeatDays}
              onChange={(event) => onDefaultRepeatDaysChange(Math.max(1, Number(event.target.value) || 1))}
              className="w-11 bg-transparent text-center font-mono text-sm font-semibold text-stone-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label="Increase default interval"
              onClick={() => onDefaultRepeatDaysChange(defaultRepeatDays + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-theme-muted transition hover:bg-theme-paper hover:text-theme-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {repeatPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={cn(
                "h-7 rounded-md border px-2.5 text-xs transition",
                defaultRepeatDays === preset.days && (defaultRepeatUnit ?? "DAY") === preset.unit
                  ? "border-dusk-amber bg-dusk-amber/15 text-dusk-amber font-semibold"
                  : "border-white/10 bg-white/5 text-stone-400 hover:border-dusk-amber/40"
              )}
              onClick={() => {
                onDefaultRepeatDaysChange(preset.days);
                onDefaultRepeatUnitChange?.(preset.unit);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-soft">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.025] p-5 text-center text-xs text-stone-500">
            No checklist items yet.
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-dusk-lavender/25 hover:bg-white/[0.05]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-dusk-lavender/20 bg-dusk-lavender/10 text-xs font-semibold text-dusk-lavender">
                    {index + 1}
                  </span>
                  <span className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Routine item</span>
                </div>
                <button
                  aria-label="Remove checklist item"
                  className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-stone-400 transition hover:border-theme-danger-border hover:bg-theme-danger-surface hover:text-theme-danger"
                  type="button"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-2.5">
                <Input
                  className="h-10"
                  placeholder="Checklist item name"
                  value={item.label}
                  onChange={(event) => updateItem(item.id, { label: event.target.value })}
                />
                <Textarea
                  className="min-h-16 resize-none"
                  placeholder="Details for this checklist item..."
                  value={item.description}
                  onChange={(event) => updateItem(item.id, { description: event.target.value })}
                />

                {/* Timing & Recurrence Settings Box */}
                <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3.5 space-y-3.5 shadow-sm">
                  {/* Top: Balanced 2-Column Schedule (Start Date + Due Time) */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Start Date */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-300">วันเริ่มต้น (Start date)</span>
                        {item.startDate ? (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-stone-400">
                            {item.startDate.slice(0, 10) === toLocalDateString()
                              ? "🟢 วันนี้"
                              : item.startDate.slice(0, 10) > toLocalDateString()
                                ? "⏳ ล่วงหน้า"
                                : "เริ่มแล้ว"}
                          </span>
                        ) : null}
                      </div>
                      <Input
                        className="h-9 font-mono text-xs sm:text-sm"
                        type="date"
                        value={(item.startDate || defaultStartDate).slice(0, 10)}
                        onChange={(event) => updateItem(item.id, { startDate: event.target.value })}
                        required
                      />
                      {/* Quick Presets row */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-stone-500">ปุ่มลัด:</span>
                        {START_DATE_PRESETS.map((preset) => {
                          const targetDate = getOffsetLocalDateString(preset.offset);
                          const currentVal = (item.startDate || defaultStartDate).slice(0, 10);
                          const isSelected = currentVal === targetDate;
                          return (
                            <button
                              key={preset.offset}
                              type="button"
                              title={preset.title}
                              onClick={() => updateItem(item.id, { startDate: targetDate })}
                              className={cn(
                                "rounded px-2 py-0.5 text-[11px] font-medium transition",
                                isSelected
                                  ? "border border-dusk-amber/45 bg-dusk-amber/20 text-dusk-amber font-semibold shadow-xs"
                                  : "border border-white/10 bg-white/5 text-stone-400 hover:border-white/20 hover:bg-white/10 hover:text-stone-200"
                              )}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Due Time */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-300">เวลาที่กำหนด (Due time)</span>
                        {item.dueTime ? (
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, { dueTime: null })}
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-theme-danger hover:bg-theme-danger-surface transition"
                            title="คลิกเพื่อล้างเวลาและกำหนดเป็นตลอดวัน"
                          >
                            <X className="h-3 w-3" />
                            <span>ล้างเวลา</span>
                          </button>
                        ) : (
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-stone-400">ตลอดวัน</span>
                        )}
                      </div>
                      <Input
                        className="h-9 font-mono text-xs sm:text-sm"
                        type="time"
                        value={item.dueTime ?? ""}
                        onChange={(event) => updateItem(item.id, { dueTime: event.target.value || null })}
                      />
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-stone-500">ปุ่มลัด:</span>
                        {DUE_TIME_PRESETS.map((preset) => {
                          const isSelected = item.dueTime === preset.time;
                          return (
                            <button
                              key={preset.time}
                              type="button"
                              onClick={() => updateItem(item.id, { dueTime: preset.time })}
                              className={cn(
                                "rounded px-2 py-0.5 text-[11px] font-medium transition",
                                isSelected
                                  ? "border border-dusk-lavender/45 bg-dusk-lavender/20 text-dusk-lavender font-semibold shadow-xs"
                                  : "border border-white/10 bg-white/5 text-stone-400 hover:border-white/20 hover:bg-white/10 hover:text-stone-200"
                              )}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Full-Width Recurrence Section */}
                  <div className="border-t border-white/8 pt-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
                        <Repeat className="h-3.5 w-3.5 text-dusk-cyan" />
                        <span>รอบการทำซ้ำ (Recurrence Schedule)</span>
                      </div>
                      {/* Segmented Switch for Unit */}
                      <div className="flex items-center rounded-lg border border-white/10 bg-black/20 p-0.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { repeatUnit: "DAY" })}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium transition",
                            (item.repeatUnit ?? "DAY") === "DAY"
                              ? "border border-dusk-cyan/35 bg-dusk-cyan/20 text-dusk-cyan font-semibold shadow-xs"
                              : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                          )}
                        >
                          ☀️ รายวัน (Days)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { repeatUnit: "MONTH", intervalDays: 1 })}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium transition",
                            item.repeatUnit === "MONTH"
                              ? "border border-dusk-cyan/35 bg-dusk-cyan/20 text-dusk-cyan font-semibold shadow-xs"
                              : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                          )}
                        >
                          🗓️ รายเดือน (Monthly)
                        </button>
                      </div>
                    </div>

                    {/* Stepper + Dynamic Presets Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
                      {/* Stepper Input */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">ทำซ้ำทุก:</span>
                        <div className="flex items-center rounded-lg border border-white/10 bg-ink-950/60 p-0.5 shadow-inner">
                          <button
                            type="button"
                            aria-label="Decrease interval"
                            onClick={() => updateItem(item.id, { intervalDays: Math.max(1, (item.intervalDays || 1) - 1) })}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-theme-muted transition hover:bg-theme-paper hover:text-theme-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                            disabled={item.intervalDays <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={item.intervalDays}
                            onChange={(e) => updateItem(item.id, { intervalDays: Math.max(1, Number(e.target.value) || 1) })}
                            className="w-11 bg-transparent text-center font-mono text-sm font-semibold text-stone-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            aria-label="Increase interval"
                            onClick={() => updateItem(item.id, { intervalDays: (item.intervalDays || 1) + 1 })}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-theme-muted transition hover:bg-theme-paper hover:text-theme-foreground"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-medium text-stone-300">
                          {item.repeatUnit === "MONTH" ? "เดือน (months)" : "วัน (days)"}
                        </span>
                      </div>

                      {/* Contextual Presets */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-stone-500">ปุ่มลัดรอบ:</span>
                        {(item.repeatUnit === "MONTH" ? REPEAT_MONTH_PRESETS : REPEAT_DAY_PRESETS).map((preset) => {
                          const isSelected = item.intervalDays === preset.days;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              title={preset.title}
                              onClick={() => updateItem(item.id, { intervalDays: preset.days })}
                              className={cn(
                                "rounded px-2.5 py-1 text-xs font-medium transition",
                                isSelected
                                  ? "border border-dusk-cyan/45 bg-dusk-cyan/20 text-dusk-cyan font-semibold shadow-xs"
                                  : "border border-white/10 bg-white/5 text-stone-400 hover:border-white/20 hover:bg-white/10 hover:text-stone-200"
                              )}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Monthly Recurrence Smart Hint */}
                    {item.repeatUnit === "MONTH" && (
                      <div className="flex items-center gap-2.5 rounded-lg border border-dusk-cyan/25 bg-dusk-cyan/10 px-3 py-2 text-xs text-dusk-cyan font-medium">
                        <Calendar className="h-4 w-4 shrink-0 text-dusk-cyan" />
                        <span>
                          ทำซ้ำทุกวันที่ <strong>{getStartDayOfMonth(item.startDate || defaultStartDate)}</strong> ของเดือน (อิงตาม Start Date — หากเดือนใดมีวันไม่ถึง จะปัดเป็นวันสิ้นเดือนโดยอัตโนมัติ)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

interface DiaryChecklistPreviewProps {
  canManage: boolean;
  onChange?: (items: DiaryChecklistItem[]) => void;
  rewardClaimedDates?: string[];
  rewardCoins?: number;
  rewardCoinType?: DiaryRewardCoinType;
  selectedDate: string;
  value: DiaryChecklistItem[];
}

export function DiaryChecklistPreview({
  canManage,
  onChange,
  rewardClaimedDates = [],
  rewardCoins = 0,
  rewardCoinType = "PROJECT",
  selectedDate,
  value
}: DiaryChecklistPreviewProps) {
  const normalized = normalizeDiaryChecklist(value, selectedDate);
  const sorted = [...normalized].sort((a, b) => {
    const aDue = isDiaryChecklistItemDueOnDate(a, selectedDate);
    const bDue = isDiaryChecklistItemDueOnDate(b, selectedDate);
    if (aDue !== bDue) return aDue ? -1 : 1;

    const aComp = isDiaryChecklistItemCompletedOnDate(a, selectedDate);
    const bComp = isDiaryChecklistItemCompletedOnDate(b, selectedDate);
    if (aComp !== bComp) return aComp ? 1 : -1;

    return a.label.localeCompare(b.label);
  });

  if (sorted.length === 0) {
    return null;
  }

  const dueItems = sorted.filter((item) => isDiaryChecklistItemDueOnDate(item, selectedDate));
  const completedDueCount = dueItems.filter((item) => isDiaryChecklistItemCompletedOnDate(item, selectedDate)).length;
  const progressLabel = dueItems.length > 0 ? `${completedDueCount}/${dueItems.length}` : `${sorted.length}`;
  const progressPercent = dueItems.length > 0 ? Math.round((completedDueCount / dueItems.length) * 100) : 0;
  const hasReward = rewardCoins > 0;
  const rewardClaimed = hasDiaryRewardBeenClaimed(rewardClaimedDates, selectedDate);
  const rewardReady = hasReward && dueItems.length > 0 && completedDueCount === dueItems.length && !rewardClaimed;

  return (
    <div data-diary-checklist-preview="routine-rows" className="mt-4 overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-100/60 dark:border-white/10 dark:bg-ink-950/40">
      <div className="border-b border-stone-200/80 bg-stone-100/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.035]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-700 dark:text-stone-300">Checklist</p>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">Tap due rows to finish the daily routine.</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {hasReward ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                  rewardReady
                    ? "border-theme-success-border bg-theme-success-surface text-theme-success font-medium"
                    : rewardClaimed
                      ? "border-amber-300/40 bg-amber-500/15 text-amber-800 dark:border-dusk-amber/25 dark:bg-dusk-amber/10 dark:text-dusk-amber font-medium"
                      : "border-amber-300/30 bg-amber-500/10 text-amber-800 dark:border-dusk-amber/20 dark:bg-dusk-amber/8 dark:text-dusk-amber font-medium"
                )}
              >
                <Coins className="h-3 w-3" />
                {rewardClaimed ? "Claimed" : `${rewardCoins} ${rewardCoinType === "GLOBAL" ? "global" : "project"}`}
              </span>
            ) : null}
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700 font-medium dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan">
              {dueItems.length > 0 ? `${progressLabel} today` : `${progressLabel} items`}
            </span>
          </div>
        </div>
        {dueItems.length > 0 ? (
          <ProgressBar value={progressPercent} className="mt-2 space-y-0" />
        ) : null}
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto p-2.5 scrollbar-soft">
        {sorted.map((item) => {
          const isDue = isDiaryChecklistItemDueOnDate(item, selectedDate);
          const isCompleted = isDiaryChecklistItemCompletedOnDate(item, selectedDate);

          return (
            <label
              key={item.id}
              className={cn(
                "group flex w-full items-start gap-3 rounded-xl border border-stone-200/80 bg-white/80 p-3 text-sm transition hover:border-indigo-300 hover:bg-white dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-dusk-lavender/22 dark:hover:bg-white/[0.055]",
                isDue && "border-indigo-300/60 bg-indigo-50/50 shadow-[0_4px_16px_rgba(99,102,241,0.06)] dark:border-dusk-lavender/20 dark:bg-dusk-lavender/[0.05] dark:shadow-[0_14px_32px_rgba(169,162,255,0.07)]",
                isCompleted && "border-emerald-300/40 bg-emerald-50/50 dark:border-emerald-300/20 dark:bg-emerald-300/[0.035]",
                !isDue && "opacity-55"
              )}
            >
              <button
                aria-label={isCompleted ? "Mark checklist incomplete" : "Mark checklist complete"}
                className={cn(
                  "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition",
                  isCompleted
                    ? "border-theme-success-border bg-theme-success-surface text-theme-success"
                    : "border-stone-300 bg-stone-100 text-stone-400 dark:border-white/15 dark:bg-ink-950/40 dark:text-stone-500",
                  canManage && isDue && "hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-dusk-cyan/45 dark:hover:text-dusk-cyan",
                  (!canManage || !isDue) && "cursor-default opacity-70"
                )}
                disabled={!canManage || !isDue}
                type="button"
                onClick={() => onChange?.(toggleDiaryChecklistCompletion(normalized, item.id, selectedDate, !isCompleted))}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </button>
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-start justify-between gap-2">
                  <span className={cn("block truncate font-semibold text-stone-900 dark:text-stone-100", isCompleted && "line-through opacity-70")}>
                    {item.label || "Untitled checklist item"}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px]",
                      isDue
                        ? "border-teal-200 bg-teal-50 text-teal-700 font-medium dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan"
                        : "border-stone-200 bg-stone-100 text-stone-500 dark:border-white/10 dark:bg-white/[0.045] dark:text-stone-500"
                    )}
                  >
                    {isDue ? "Today" : "Later"}
                  </span>
                </span>
                {item.description ? <span className="mt-1 line-clamp-2 block text-xs leading-5 text-stone-600 dark:text-stone-400">{item.description}</span> : null}
                <span className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-stone-600 dark:text-stone-400">
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/70 px-2 py-0.5 dark:bg-white/[0.055]">
                    <Repeat className="h-3 w-3" />
                    {item.repeatUnit === "MONTH"
                      ? (item.intervalDays || 1) > 1
                        ? `Every ${item.intervalDays} mo (${getStartDayOfMonth(item.startDate)}th)`
                        : `Monthly (${getStartDayOfMonth(item.startDate)}th)`
                      : item.intervalDays === 1
                        ? "Daily"
                        : `Every ${item.intervalDays}d`}
                  </span>
                  {item.startDate ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/70 px-2 py-0.5 dark:bg-white/[0.055]" title={`Start date: ${item.startDate}`}>
                      <Calendar className="h-3 w-3" />
                      Starts {item.startDate}
                    </span>
                  ) : null}
                  {item.dueTime ? <span className="rounded-full bg-stone-200/70 px-2 py-0.5 dark:bg-white/[0.055]">{item.dueTime}</span> : null}
                  {!isDue ? <span className="rounded-full bg-stone-200/70 px-2 py-0.5 dark:bg-white/[0.055]">Not due today</span> : null}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
