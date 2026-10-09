"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOutsideClickDismiss } from "@/hooks/use-outside-click";
import { useLanguage } from "@/lib/i18n/language-context";

export interface DatePickerProps {
  value?: string | null;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  showShortcuts?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
}

export interface CalendarViewProps {
  value?: string | null;
  onChange?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  showShortcuts?: boolean;
  className?: string;
}

const MONTH_NAMES_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม"
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const WEEKDAY_NAMES = [
  { th: "อา", en: "Su" },
  { th: "จ", en: "Mo" },
  { th: "อ", en: "Tu" },
  { th: "พ", en: "We" },
  { th: "พฤ", en: "Th" },
  { th: "ศ", en: "Fr" },
  { th: "ส", en: "Sa" }
];

export function parseDateString(dateStr: string | null | undefined): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  // If ISO string with T, slice to YYYY-MM-DD
  const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = clean.split("-").map((p) => parseInt(p, 10));
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return null;
  }
  return { year: parts[0], month: parts[1] - 1, day: parts[2] };
}

export function formatDateToISO(year: number, month: number, day: number): string {
  const yyyy = year.toString();
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDisplayDateThai(dateStr: string | null | undefined): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return "";
  const thMonth = MONTH_NAMES_TH[parsed.month] || "";
  return `${parsed.day} ${thMonth} ${parsed.year}`;
}

export function formatDisplayDateShort(dateStr: string | null | undefined): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return "";
  const dd = String(parsed.day).padStart(2, "0");
  const mm = String(parsed.month + 1).padStart(2, "0");
  return `${dd}/${mm}/${parsed.year}`;
}

/**
 * Inline Custom Retro Calendar View
 */
export function CalendarView({
  value,
  onChange,
  minDate,
  maxDate,
  showShortcuts = true,
  className
}: CalendarViewProps) {
  const { isEn } = useLanguage();
  const parsedValue = useMemo(() => parseDateString(value), [value]);

  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate()
    };
  }, []);

  const [viewYear, setViewYear] = useState<number>(() => parsedValue?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState<number>(() => parsedValue?.month ?? today.month);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    setViewYear(today.year);
    setViewMonth(today.month);
    onChange?.(formatDateToISO(today.year, today.month, today.day));
  };

  // Generate 42 calendar grid cells (6 rows x 7 columns)
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      year: number;
      month: number;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      iso: string;
      disabled: boolean;
    }> = [];

    // Previous month filler
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = daysInPrevMonth - i;
      const pMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const pYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const iso = formatDateToISO(pYear, pMonth, pDay);
      days.push({
        year: pYear,
        month: pMonth,
        day: pDay,
        isCurrentMonth: false,
        isToday: pYear === today.year && pMonth === today.month && pDay === today.day,
        isSelected: Boolean(parsedValue && pYear === parsedValue.year && pMonth === parsedValue.month && pDay === parsedValue.day),
        iso,
        disabled: Boolean((minDate && iso < minDate) || (maxDate && iso > maxDate))
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const iso = formatDateToISO(viewYear, viewMonth, day);
      days.push({
        year: viewYear,
        month: viewMonth,
        day,
        isCurrentMonth: true,
        isToday: viewYear === today.year && viewMonth === today.month && day === today.day,
        isSelected: Boolean(parsedValue && viewYear === parsedValue.year && viewMonth === parsedValue.month && day === parsedValue.day),
        iso,
        disabled: Boolean((minDate && iso < minDate) || (maxDate && iso > maxDate))
      });
    }

    // Next month filler
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const iso = formatDateToISO(nYear, nMonth, day);
      days.push({
        year: nYear,
        month: nMonth,
        day,
        isCurrentMonth: false,
        isToday: nYear === today.year && nMonth === today.month && day === today.day,
        isSelected: Boolean(parsedValue && nYear === parsedValue.year && nMonth === parsedValue.month && day === parsedValue.day),
        iso,
        disabled: Boolean((minDate && iso < minDate) || (maxDate && iso > maxDate))
      });
    }

    return days;
  }, [viewYear, viewMonth, parsedValue, today, minDate, maxDate]);

  const selectDay = (dayIso: string, disabled: boolean) => {
    if (disabled) return;
    onChange?.(dayIso);
  };

  const handleApplyShortcut = (type: "today" | "tomorrow" | "next-week" | "clear") => {
    if (type === "clear") {
      onChange?.("");
      return;
    }

    const d = new Date();
    if (type === "tomorrow") {
      d.setDate(d.getDate() + 1);
    } else if (type === "next-week") {
      d.setDate(d.getDate() + 7);
    }

    const iso = formatDateToISO(d.getFullYear(), d.getMonth(), d.getDate());
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    onChange?.(iso);
  };

  return (
    <div className={cn("w-[280px] select-none p-1 text-xs", className)}>
      {/* ── Calendar Navigation Header ── */}
      <div className="flex items-center justify-between pb-2.5 pt-1">
        <button
          type="button"
          onClick={prevMonth}
          className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-white text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100 cursor-pointer"
          title="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-stone-800 dark:text-stone-100">
            {(isEn ? MONTH_NAMES_EN : MONTH_NAMES_TH)[viewMonth]}
          </span>
          <span className="font-mono text-stone-500 dark:text-stone-400">
            {viewYear}
          </span>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-white text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100 cursor-pointer"
          title="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── Weekday Headers ── */}
      <div className="grid grid-cols-7 gap-1 py-1 text-center font-mono text-[10px] font-semibold text-stone-400 dark:text-stone-500">
        {WEEKDAY_NAMES.map((w, idx) => (
          <div key={idx} className={cn(idx === 0 && "text-red-500/80 dark:text-red-400/80")}>
            {isEn ? w.en : w.th}
          </div>
        ))}
      </div>

      {/* ── Days Grid (6 weeks x 7 days) ── */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {calendarDays.map((d, index) => {
          return (
            <button
              key={index}
              type="button"
              disabled={d.disabled}
              onClick={() => selectDay(d.iso, d.disabled)}
              className={cn(
                "group relative grid h-8 w-8 place-items-center rounded-lg text-center font-mono text-xs transition cursor-pointer",
                !d.isCurrentMonth && "text-stone-400 opacity-40 hover:opacity-80 dark:text-stone-600",
                d.isCurrentMonth && "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/10",
                d.isToday &&
                  !d.isSelected &&
                  "border border-dusk-amber/70 font-bold text-dusk-amber dark:border-dusk-amber/70 dark:text-dusk-amber",
                d.isSelected &&
                  "border border-indigo-500/40 bg-dusk-lavender font-bold text-stone-950 shadow-xs hover:bg-dusk-lavender/90 dark:border-indigo-400/40 dark:bg-dusk-lavender dark:text-ink-950",
                d.disabled && "cursor-not-allowed opacity-20 hover:bg-transparent"
              )}
            >
              <span>{d.day}</span>
              {d.isToday && !d.isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-dusk-amber" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Shortcuts Row ── */}
      {showShortcuts && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-stone-200/80 pt-2.5 dark:border-white/10">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleApplyShortcut("today")}
              className="rounded-md border border-stone-200/80 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/10 cursor-pointer"
            >
              {isEn ? "Today" : "วันนี้"}
            </button>
            <button
              type="button"
              onClick={() => handleApplyShortcut("tomorrow")}
              className="rounded-md border border-stone-200/80 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/10 cursor-pointer"
            >
              {isEn ? "Tomorrow" : "พรุ่งนี้"}
            </button>
            <button
              type="button"
              onClick={() => handleApplyShortcut("next-week")}
              className="rounded-md border border-stone-200/80 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/10 cursor-pointer"
            >
              {isEn ? "Next Week" : "สัปดาห์หน้า"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleApplyShortcut("clear")}
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-stone-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
          >
            {isEn ? "Clear" : "ล้าง"}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Global Custom Retro DatePicker Component (Trigger + Popover)
 */
export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  minDate,
  maxDate,
  className,
  triggerClassName,
  align = "start",
  showShortcuts = true,
  id,
  name,
  required
}: DatePickerProps) {
  const { isEn } = useLanguage();
  const defaultPlaceholder = isEn ? "Select date..." : "เลือกวันที่...";
  const resolvedPlaceholder = placeholder || defaultPlaceholder;

  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef);

  const displayString = value ? formatDisplayDateShort(value) : "";

  const handleSelectDate = (dateIso: string) => {
    onChange?.(dateIso);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <div className={cn("relative inline-block w-full", className)}>
      {name ? <input type="hidden" name={name} value={value ?? ""} required={required} /> : null}
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
              <CalendarIcon className="h-4 w-4 text-dusk-amber shrink-0" />
              {displayString ? (
                <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                  {displayString}
                </span>
              ) : (
                <span className="text-stone-400 dark:text-stone-500">{resolvedPlaceholder}</span>
              )}
            </div>

            {value && !disabled ? (
              <span
                onClick={handleClear}
                className="grid h-4 w-4 place-items-center rounded text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
                title="Clear date"
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
          <CalendarView
            value={value}
            onChange={handleSelectDate}
            minDate={minDate}
            maxDate={maxDate}
            showShortcuts={showShortcuts}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
