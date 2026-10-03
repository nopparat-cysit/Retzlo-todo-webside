"use client";

import { useId, useMemo, useState } from "react";
import { Clock, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface TimePickerProps {
  value?: string | null;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  id?: string;
}

export interface TimeViewProps {
  value?: string | null;
  onChange?: (time: string) => void;
  className?: string;
}

const PRESET_TIMES = [
  { label: "09:00 เช้า", value: "09:00" },
  { label: "12:00 เที่ยง", value: "12:00" },
  { label: "13:30 บ่าย", value: "13:30" },
  { label: "17:00 เลิกงาน", value: "17:00" },
  { label: "20:00 ค่ำ", value: "20:00" }
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export function parseTimeString(timeStr: string | null | undefined): { hour: string; minute: string } | null {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return {
    hour: String(h).padStart(2, "0"),
    minute: String(m).padStart(2, "0")
  };
}

export function formatDisplayTime(timeStr: string | null | undefined): string {
  const parsed = parseTimeString(timeStr);
  if (!parsed) return "";
  return `${parsed.hour}:${parsed.minute} น.`;
}

/**
 * Inline Custom Retro Time View
 */
export function TimeView({ value, onChange, className }: TimeViewProps) {
  const parsed = useMemo(() => parseTimeString(value), [value]);

  const [selectedHour, setSelectedHour] = useState<string>(() => parsed?.hour ?? "09");
  const [selectedMinute, setSelectedMinute] = useState<string>(() => parsed?.minute ?? "00");

  const handleSelectHour = (h: string) => {
    setSelectedHour(h);
    onChange?.(`${h}:${selectedMinute}`);
  };

  const handleSelectMinute = (m: string) => {
    setSelectedMinute(m);
    onChange?.(`${selectedHour}:${m}`);
  };

  const handleSelectPreset = (preset: string) => {
    const p = parseTimeString(preset);
    if (p) {
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      onChange?.(preset);
    }
  };

  const handleClear = () => {
    onChange?.("");
  };

  return (
    <div className={cn("w-[260px] select-none p-1 text-xs", className)}>
      {/* ── Retro Digital Clock Display ── */}
      <div className="flex items-center justify-center gap-2 rounded-xl border border-stone-200/80 bg-stone-100/70 py-2 font-mono text-base font-bold shadow-inner dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center gap-1">
          <span className="rounded bg-white px-2 py-0.5 text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100">
            {selectedHour}
          </span>
          <span className="text-stone-400 animate-pulse">:</span>
          <span className="rounded bg-white px-2 py-0.5 text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100">
            {selectedMinute}
          </span>
        </div>
        <span className="text-xs font-normal text-stone-400">น.</span>
      </div>

      {/* ── Hour & Minute Pickers ── */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Hour Column */}
        <div>
          <div className="mb-1 text-center font-mono text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            ชั่วโมง (Hr)
          </div>
          <div className="scrollbar-soft max-h-36 overflow-y-auto rounded-lg border border-stone-200/70 bg-white/50 p-1 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-1">
              {HOURS.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectHour(h)}
                    className={cn(
                      "h-6 rounded text-center font-mono text-[11px] transition cursor-pointer",
                      isSelected
                        ? "bg-dusk-lavender font-bold text-stone-950 shadow-2xs dark:bg-dusk-lavender dark:text-ink-950"
                        : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Minute Column */}
        <div>
          <div className="mb-1 text-center font-mono text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            นาที (Min)
          </div>
          <div className="scrollbar-soft max-h-36 overflow-y-auto rounded-lg border border-stone-200/70 bg-white/50 p-1 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-1">
              {MINUTES.map((m) => {
                const isSelected = selectedMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMinute(m)}
                    className={cn(
                      "h-6 rounded text-center font-mono text-[11px] transition cursor-pointer",
                      isSelected
                        ? "bg-dusk-lavender font-bold text-stone-950 shadow-2xs dark:bg-dusk-lavender dark:text-ink-950"
                        : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Presets & Clear ── */}
      <div className="mt-3 border-t border-stone-200/80 pt-2.5 dark:border-white/10">
        <div className="mb-1.5 text-[10px] font-medium text-stone-400">เวลายอดนิยม:</div>
        <div className="flex flex-wrap gap-1">
          {PRESET_TIMES.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleSelectPreset(preset.value)}
              className="rounded-md border border-stone-200/80 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/10 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-stone-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
          >
            ตลอดวัน / ล้าง
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Custom Retro TimePicker Component (Trigger + Popover)
 */
export function TimePicker({
  value,
  onChange,
  placeholder = "เลือกเวลา...",
  disabled = false,
  className,
  triggerClassName,
  align = "start",
  id
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;

  const displayString = value ? formatDisplayTime(value) : "";

  const handleSelectTime = (time: string) => {
    onChange?.(time);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <div className={cn("relative inline-block w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={inputId}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-left text-xs font-medium text-stone-900 shadow-2xs transition",
              "hover:border-stone-300 hover:bg-stone-50/50",
              "focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
              "dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-100 dark:hover:border-white/20 dark:hover:bg-white/[0.08]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              open && "border-indigo-400 ring-2 ring-indigo-500/20 dark:border-indigo-400/50",
              triggerClassName
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Clock className="h-4 w-4 text-dusk-lavender shrink-0" />
              {displayString ? (
                <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                  {displayString}
                </span>
              ) : (
                <span className="text-stone-400 dark:text-stone-500">{placeholder}</span>
              )}
            </div>

            {value && !disabled ? (
              <span
                onClick={handleClear}
                className="grid h-4 w-4 place-items-center rounded text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
                title="Clear time"
              >
                <X className="h-3 w-3" />
              </span>
            ) : null}
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          sideOffset={6}
          className="w-auto p-3 shadow-xl backdrop-blur-xl border border-stone-200/90 bg-[#faf7f2]/95 dark:border-white/12 dark:bg-[#0e1025]/95 rounded-2xl z-[1200]"
        >
          <TimeView value={value} onChange={handleSelectTime} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
