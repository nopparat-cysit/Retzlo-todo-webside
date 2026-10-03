"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOutsideClickDismiss } from "@/hooks/use-outside-click";

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
  onConfirm?: () => void;
  className?: string;
}

export const PRESET_TIMES = [
  { label: "09:00 เช้า", time: "09:00", value: "09:00", icon: "🌅" },
  { label: "12:00 เที่ยง", time: "12:00", value: "12:00", icon: "☀️" },
  { label: "13:30 บ่าย", time: "13:30", value: "13:30", icon: "☕" },
  { label: "17:00 เลิกงาน", time: "17:00", value: "17:00", icon: "💼" },
  { label: "20:00 ค่ำ", time: "20:00", value: "20:00", icon: "🌙" }
];

export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
export const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

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
 * Intuitive, Streamlined Retro Time View
 * Features:
 * - Direct typeable hour & minute inputs with auto-advance and keyboard arrow steppers
 * - Clean single-column vertical scroll lists (no confusing zigzag grids)
 * - Auto-scroll to selected hour and minute
 * - Quick presets with visual icons
 * - Clear action and explicit Done/Confirm button
 */
export function TimeView({ value, onChange, onConfirm, className }: TimeViewProps) {
  const parsed = useMemo(() => parseTimeString(value), [value]);

  const [selectedHour, setSelectedHour] = useState<string>(() => parsed?.hour ?? "09");
  const [selectedMinute, setSelectedMinute] = useState<string>(() => parsed?.minute ?? "00");

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  // Sync state if value prop changes
  useEffect(() => {
    if (parsed) {
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
    }
  }, [value, parsed]);

  // Combined minutes including any custom minute typed by user
  const allMinutes = useMemo(() => {
    if (MINUTES.includes(selectedMinute)) return MINUTES;
    return [...MINUTES, selectedMinute].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [selectedMinute]);

  // Auto-scroll selected hour into view
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = hourListRef.current?.querySelector(`[data-hour="${selectedHour}"]`);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [selectedHour]);

  // Auto-scroll selected minute into view
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = minuteListRef.current?.querySelector(`[data-minute="${selectedMinute}"]`);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [selectedMinute]);

  const handleSelectHour = (h: string) => {
    setSelectedHour(h);
    onChange?.(`${h}:${selectedMinute || "00"}`);
  };

  const handleSelectMinute = (m: string) => {
    setSelectedMinute(m);
    onChange?.(`${selectedHour || "09"}:${m}`);
  };

  const stepHour = (delta: number) => {
    const cur = parseInt(selectedHour, 10) || 0;
    const next = (cur + delta + 24) % 24;
    const formatted = String(next).padStart(2, "0");
    setSelectedHour(formatted);
    onChange?.(`${formatted}:${selectedMinute || "00"}`);
  };

  const stepMinute = (delta: number) => {
    const cur = parseInt(selectedMinute, 10) || 0;
    const next = (cur + delta + 60) % 60;
    const formatted = String(next).padStart(2, "0");
    setSelectedMinute(formatted);
    onChange?.(`${selectedHour || "09"}:${formatted}`);
  };

  const handleHourInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setSelectedHour("");
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;

    if (raw.length >= 2 || num >= 3) {
      const clamped = Math.min(23, num);
      const formatted = String(clamped).padStart(2, "0");
      setSelectedHour(formatted);
      onChange?.(`${formatted}:${selectedMinute || "00"}`);
      minuteInputRef.current?.focus();
      minuteInputRef.current?.select();
    } else {
      setSelectedHour(raw);
    }
  };

  const handleHourInputBlur = () => {
    if (!selectedHour) {
      setSelectedHour("09");
      onChange?.(`09:${selectedMinute || "00"}`);
    } else {
      const num = Math.min(23, Math.max(0, parseInt(selectedHour, 10) || 0));
      const formatted = String(num).padStart(2, "0");
      setSelectedHour(formatted);
      onChange?.(`${formatted}:${selectedMinute || "00"}`);
    }
  };

  const handleMinuteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setSelectedMinute("");
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;

    if (raw.length >= 2 || num >= 6) {
      const clamped = Math.min(59, num);
      const formatted = String(clamped).padStart(2, "0");
      setSelectedMinute(formatted);
      onChange?.(`${selectedHour || "09"}:${formatted}`);
    } else {
      setSelectedMinute(raw);
    }
  };

  const handleMinuteInputBlur = () => {
    if (!selectedMinute) {
      setSelectedMinute("00");
      onChange?.(`${selectedHour || "09"}:00`);
    } else {
      const num = Math.min(59, Math.max(0, parseInt(selectedMinute, 10) || 0));
      const formatted = String(num).padStart(2, "0");
      setSelectedMinute(formatted);
      onChange?.(`${selectedHour || "09"}:${formatted}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isHour: boolean) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isHour) stepHour(1);
      else stepMinute(isHour ? 1 : 5);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isHour) stepHour(-1);
      else stepMinute(isHour ? -1 : -5);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onConfirm?.();
    }
  };

  const handleSelectPreset = (presetValue: string) => {
    const p = parseTimeString(presetValue);
    if (p) {
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      onChange?.(presetValue);
    }
  };

  const handleClear = () => {
    onChange?.("");
  };

  return (
    <div className={cn("w-[270px] select-none p-1 text-xs", className)}>
      {/* ── Typeable Digital Time Header ── */}
      <div className="flex items-center justify-center gap-2 rounded-xl border border-stone-200/90 bg-stone-100/80 p-2 shadow-inner dark:border-white/10 dark:bg-white/[0.04]">
        {/* Hour Input + Steppers */}
        <div className="flex items-center gap-1">
          <input
            ref={hourInputRef}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={selectedHour}
            onChange={handleHourInputChange}
            onBlur={handleHourInputBlur}
            onKeyDown={(e) => handleKeyDown(e, true)}
            onFocus={(e) => e.target.select()}
            title="พิมพ์หรือกดลูกศรเพื่อเปลี่ยนชั่วโมง"
            className="h-10 w-12 rounded-lg border border-stone-300/80 bg-white text-center font-mono text-xl font-bold text-stone-900 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-indigo-400"
          />
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => stepHour(1)}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-800 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
              title="เพิ่มชั่วโมง (+1)"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => stepHour(-1)}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-800 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
              title="ลดชั่วโมง (-1)"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>

        <span className="font-mono text-xl font-bold text-stone-400 animate-pulse">:</span>

        {/* Minute Input + Steppers */}
        <div className="flex items-center gap-1">
          <input
            ref={minuteInputRef}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={selectedMinute}
            onChange={handleMinuteInputChange}
            onBlur={handleMinuteInputBlur}
            onKeyDown={(e) => handleKeyDown(e, false)}
            onFocus={(e) => e.target.select()}
            title="พิมพ์หรือกดลูกศรเพื่อเปลี่ยนนาที"
            className="h-10 w-12 rounded-lg border border-stone-300/80 bg-white text-center font-mono text-xl font-bold text-stone-900 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/10 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-indigo-400"
          />
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => stepMinute(5)}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-800 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
              title="เพิ่มนาที (+5)"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => stepMinute(-5)}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-800 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
              title="ลดนาที (-5)"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>

        <span className="font-mono text-xs font-semibold text-stone-400">น.</span>
      </div>

      {/* ── Single-Column Wheel Scrollers (Clear, Linear, Intuitive) ── */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Hour Single Column */}
        <div>
          <div className="mb-1 text-center font-mono text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            ชั่วโมง (HR)
          </div>
          <div
            ref={hourListRef}
            className="scrollbar-soft h-40 overflow-y-auto rounded-xl border border-stone-200/90 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <div className="flex flex-col gap-0.5">
              {HOURS.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    data-hour={h}
                    onClick={() => handleSelectHour(h)}
                    className={cn(
                      "h-7 w-full rounded-lg font-mono text-xs font-medium transition cursor-pointer flex items-center justify-center",
                      isSelected
                        ? "bg-indigo-600 text-white font-bold shadow-xs dark:bg-dusk-lavender dark:text-ink-950"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100"
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Minute Single Column */}
        <div>
          <div className="mb-1 text-center font-mono text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            นาที (MIN)
          </div>
          <div
            ref={minuteListRef}
            className="scrollbar-soft h-40 overflow-y-auto rounded-xl border border-stone-200/90 bg-white/70 p-1 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <div className="flex flex-col gap-0.5">
              {allMinutes.map((m) => {
                const isSelected = selectedMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    data-minute={m}
                    onClick={() => handleSelectMinute(m)}
                    className={cn(
                      "h-7 w-full rounded-lg font-mono text-xs font-medium transition cursor-pointer flex items-center justify-center",
                      isSelected
                        ? "bg-indigo-600 text-white font-bold shadow-xs dark:bg-dusk-lavender dark:text-ink-950"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100"
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

      {/* ── Presets Grid ── */}
      <div className="mt-3 border-t border-stone-200/80 pt-2.5 dark:border-white/10">
        <div className="mb-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          เวลายอดนิยม:
        </div>
        <div className="grid grid-cols-3 gap-1">
          {PRESET_TIMES.map((preset) => {
            const isSelected = `${selectedHour}:${selectedMinute}` === preset.time;
            return (
              <button
                key={preset.time}
                type="button"
                onClick={() => handleSelectPreset(preset.time)}
                className={cn(
                  "flex items-center justify-center gap-1 rounded-lg border px-1 py-1 text-[10px] font-medium transition cursor-pointer",
                  isSelected
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-semibold dark:border-dusk-lavender/50 dark:bg-dusk-lavender/15 dark:text-dusk-lavender"
                    : "border-stone-200/80 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/10"
                )}
              >
                <span>{preset.icon}</span>
                <span>{preset.time}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Action Bar: Clear & Confirm ── */}
      <div className="mt-3 flex items-center justify-between border-t border-stone-200/80 pt-2.5 dark:border-white/10">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg px-2 py-1 text-[11px] font-medium text-stone-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:text-red-400 transition cursor-pointer"
        >
          ตลอดวัน / ล้าง
        </button>

        <button
          type="button"
          onClick={() => onConfirm?.()}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 transition cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" />
          <span>ตกลง</span>
        </button>
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef);

  const displayString = value ? formatDisplayTime(value) : "";

  const handleSelectTime = (time: string) => {
    onChange?.(time);
  };

  const handleConfirm = () => {
    setOpen(false);
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
            ref={triggerRef}
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
          ref={contentRef}
          align={align}
          sideOffset={6}
          className="w-auto p-3 shadow-xl backdrop-blur-xl border border-stone-200/90 bg-[#faf7f2]/95 dark:border-white/12 dark:bg-[#0e1025]/95 rounded-2xl z-[1200]"
        >
          <TimeView value={value} onChange={handleSelectTime} onConfirm={handleConfirm} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
