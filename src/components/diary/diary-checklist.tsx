"use client";

import { Calendar, CheckCircle2, Circle, Coins, Plus, Repeat, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
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
  defaultStartDate: string;
  onDefaultRepeatDaysChange: (days: number) => void;
  onChange: (items: DiaryChecklistItem[]) => void;
  value: DiaryChecklistItem[];
}

const repeatPresets = [
  { label: "Daily", days: 1 },
  { label: "3 days", days: 3 },
  { label: "Weekly", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "Monthly", days: 30 }
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
  { label: "+1d", offset: 1, title: "เริ่มพรุ่งนี้ (+1 วัน)" },
  { label: "+3d", offset: 3, title: "เริ่มในอีก 3 วัน" },
  { label: "+7d", offset: 7, title: "เริ่มในอีก 1 สัปดาห์" }
];

const REPEAT_DAYS_PRESETS = [
  { label: "ทุกวัน", days: 1 },
  { label: "7 วัน", days: 7 },
  { label: "14 วัน", days: 14 },
  { label: "30 วัน", days: 30 }
];

export function DiaryChecklistEditor({
  defaultRepeatDays,
  defaultStartDate,
  onDefaultRepeatDaysChange,
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
          <Input
            className="h-8 w-20 text-center"
            max={365}
            min={1}
            name="intervalDays"
            type="number"
            value={defaultRepeatDays}
            onChange={(event) => onDefaultRepeatDaysChange(Number(event.target.value))}
            required
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {repeatPresets.map((preset) => (
            <button
              key={preset.days}
              type="button"
              className={cn(
                "h-7 rounded-md border px-2.5 text-xs transition",
                defaultRepeatDays === preset.days
                  ? "border-dusk-amber bg-dusk-amber/15 text-dusk-amber"
                  : "border-white/10 bg-white/5 text-stone-400 hover:border-dusk-amber/40"
              )}
              onClick={() => onDefaultRepeatDaysChange(preset.days)}
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
                  className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-stone-400 transition hover:border-red-300/35 hover:text-red-300"
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
                <div className="rounded-xl border border-white/10 bg-ink-950/35 p-3.5 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Start Date Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-300">Start date (วันเริ่มต้น)</span>
                        {item.startDate ? (
                          <span className="text-[11px] text-stone-400 font-mono">
                            {item.startDate.slice(0, 10) === toLocalDateString()
                              ? "🟢 วันนี้"
                              : item.startDate.slice(0, 10) > toLocalDateString()
                                ? "⏳ เริ่มในอนาคต"
                                : "เริ่มแล้ว"}
                          </span>
                        ) : null}
                      </div>
                      <Input
                        className="h-9 font-mono text-sm"
                        type="date"
                        value={(item.startDate || defaultStartDate).slice(0, 10)}
                        onChange={(event) => updateItem(item.id, { startDate: event.target.value })}
                        required
                      />
                      {/* Quick Presets row placed cleanly under input */}
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

                    {/* Repeat Interval Field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-stone-300">
                        Repeat every (ทำซ้ำทุก)
                      </label>
                      <div className="relative">
                        <Input
                          className="h-9 pr-16 font-mono text-sm"
                          max={365}
                          min={1}
                          type="number"
                          value={item.intervalDays}
                          onChange={(event) =>
                            updateItem(item.id, { intervalDays: Math.max(1, Number(event.target.value) || 1) })
                          }
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                          วัน (days)
                        </span>
                      </div>
                      {/* Quick rhythm presets under input */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-stone-500">รอบ:</span>
                        {REPEAT_DAYS_PRESETS.map((rhythm) => (
                          <button
                            key={rhythm.days}
                            type="button"
                            onClick={() => updateItem(item.id, { intervalDays: rhythm.days })}
                            className={cn(
                              "rounded px-2 py-0.5 text-[11px] font-medium transition",
                              item.intervalDays === rhythm.days
                                ? "border border-dusk-cyan/45 bg-dusk-cyan/20 text-dusk-cyan font-semibold shadow-xs"
                                : "border border-white/10 bg-white/5 text-stone-400 hover:border-white/20 hover:bg-white/10 hover:text-stone-200"
                            )}
                          >
                            {rhythm.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Due Time */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-300">Due time (เวลาที่กำหนด)</span>
                      <span className="text-[10px] text-stone-500">
                        รีเซ็ตทุกเที่ยงคืนเมื่อถึงรอบที่ต้องทำ
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-9 w-40 font-mono text-xs"
                        type="time"
                        value={item.dueTime ?? ""}
                        onChange={(event) => updateItem(item.id, { dueTime: event.target.value || null })}
                      />
                      {item.dueTime ? (
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { dueTime: null })}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-stone-300 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 transition whitespace-nowrap"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>ล้างเวลา (ตลอดวัน)</span>
                        </button>
                      ) : (
                        <span className="text-xs text-stone-500">ไม่ระบุ = ตลอดวัน</span>
                      )}
                    </div>
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
    <div data-diary-checklist-preview="routine-rows" className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-ink-950/20">
      <div className="border-b border-white/10 bg-white/[0.035] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-300">Checklist</p>
            <p className="mt-0.5 text-[11px] text-stone-500">Tap due rows to finish the daily routine.</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {hasReward ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                  rewardReady
                    ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-300"
                    : rewardClaimed
                      ? "border-dusk-amber/25 bg-dusk-amber/10 text-dusk-amber"
                      : "border-dusk-amber/20 bg-dusk-amber/8 text-dusk-amber"
                )}
              >
                <Coins className="h-3 w-3" />
                {rewardClaimed ? "Claimed" : `${rewardCoins} ${rewardCoinType === "GLOBAL" ? "global" : "project"}`}
              </span>
            ) : null}
            <span className="rounded-full border border-dusk-cyan/20 bg-dusk-cyan/10 px-2 py-0.5 text-[10px] text-dusk-cyan">
              {dueItems.length > 0 ? `${progressLabel} today` : `${progressLabel} items`}
            </span>
          </div>
        </div>
        {dueItems.length > 0 ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-dusk-cyan to-dusk-lavender transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
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
                "group flex w-full items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm transition hover:border-dusk-lavender/22 hover:bg-white/[0.055]",
                isDue && "border-dusk-lavender/20 bg-dusk-lavender/[0.05] shadow-[0_14px_32px_rgba(169,162,255,0.07)]",
                isCompleted && "border-emerald-300/20 bg-emerald-300/[0.035]",
                !isDue && "opacity-45"
              )}
            >
              <button
                aria-label={isCompleted ? "Mark checklist incomplete" : "Mark checklist complete"}
                className={cn(
                  "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition",
                  isCompleted
                    ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-300"
                    : "border-white/15 bg-ink-950/40 text-stone-500",
                  canManage && isDue && "hover:border-dusk-cyan/45 hover:text-dusk-cyan",
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
                  <span className={cn("block truncate font-semibold text-stone-100", isCompleted && "line-through opacity-70")}>
                    {item.label || "Untitled checklist item"}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px]",
                      isDue
                        ? "border-dusk-cyan/20 bg-dusk-cyan/10 text-dusk-cyan"
                        : "border-white/10 bg-white/[0.045] text-stone-500"
                    )}
                  >
                    {isDue ? "Today" : "Later"}
                  </span>
                </span>
                {item.description ? <span className="mt-1 line-clamp-2 block text-xs leading-5 text-stone-500">{item.description}</span> : null}
                <span className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-stone-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.055] px-2 py-0.5">
                    <Repeat className="h-3 w-3" />
                    Every {item.intervalDays}d
                  </span>
                  {item.startDate ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.055] px-2 py-0.5" title={`Start date: ${item.startDate}`}>
                      <Calendar className="h-3 w-3" />
                      Starts {item.startDate}
                    </span>
                  ) : null}
                  {item.dueTime ? <span className="rounded-full bg-white/[0.055] px-2 py-0.5">{item.dueTime}</span> : null}
                  {!isDue ? <span className="rounded-full bg-white/[0.055] px-2 py-0.5">Not due today</span> : null}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
