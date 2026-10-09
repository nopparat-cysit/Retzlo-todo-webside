"use client";

import { useId, useRef, useState } from "react";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarView, formatDisplayDateShort } from "@/components/ui/date-picker";
import { TimeView, formatDisplayTime } from "@/components/ui/time-picker";
import { useOutsideClickDismiss } from "@/hooks/use-outside-click";
import { useLanguage } from "@/lib/i18n/language-context";

export interface DateTimePickerValue {
  date: string;
  time: string;
}

export interface DateTimePickerProps {
  value: DateTimePickerValue;
  onChange: (value: DateTimePickerValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  id?: string;
}

/**
 * Combined Date & Time Picker Popover Component
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  triggerClassName,
  align = "start",
  id
}: DateTimePickerProps) {
  const defaultPlaceholder = "Select date & time...";
  const resolvedPlaceholder = placeholder || defaultPlaceholder;

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");
  const generatedId = useId();
  const inputId = id || generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef);

  const dateString = value.date ? formatDisplayDateShort(value.date) : "";
  const timeString = value.time ? formatDisplayTime(value.time) : "";

  let displayLabel = "";
  if (dateString && timeString) {
    displayLabel = `${dateString} • ${timeString}`;
  } else if (dateString) {
    displayLabel = `${dateString} (All day)`;
  }

  const handleDateChange = (dateIso: string) => {
    onChange({ ...value, date: dateIso });
    if (dateIso && !value.time) {
      // Auto-switch to time tab if time not set yet
      setActiveTab("time");
    }
  };

  const handleTimeChange = (timeStr: string) => {
    onChange({ ...value, time: timeStr });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ date: "", time: "" });
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
              <CalendarIcon className="h-4 w-4 text-dusk-amber shrink-0" />
              {displayLabel ? (
                <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                  {displayLabel}
                </span>
              ) : (
                <span className="text-stone-400 dark:text-stone-500">{resolvedPlaceholder}</span>
              )}
            </div>

            {(value.date || value.time) && !disabled ? (
              <span
                onClick={handleClear}
                className="grid h-4 w-4 place-items-center rounded text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 transition cursor-pointer"
                title="Clear date & time"
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
          {/* ── Switcher Tabs: Date vs Time ── */}
          <div className="mb-2.5 flex items-center gap-1 rounded-xl border border-stone-200/80 bg-stone-100/80 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setActiveTab("date")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-semibold transition cursor-pointer",
                activeTab === "date"
                  ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5 text-dusk-amber" />
              <span>Date {value.date ? `(${formatDisplayDateShort(value.date)})` : ""}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("time")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-semibold transition cursor-pointer",
                activeTab === "time"
                  ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              <Clock className="h-3.5 w-3.5 text-dusk-lavender" />
              <span>Time {value.time ? `(${formatDisplayTime(value.time)})` : "(All day)"}</span>
            </button>
          </div>

          {activeTab === "date" ? (
            <CalendarView
              value={value.date}
              onChange={handleDateChange}
              showShortcuts
            />
          ) : (
            <TimeView
              value={value.time}
              onChange={handleTimeChange}
              onConfirm={() => setOpen(false)}
            />
          )}

          {/* ── Done Button ── */}
          <div className="mt-3 flex items-center justify-between border-t border-stone-200/80 pt-2.5 dark:border-white/10">
            <span className="text-[11px] text-stone-400">
              {value.date ? "Date selected" : "No date selected"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-dusk-lavender px-3 py-1 text-xs font-bold text-stone-950 transition hover:bg-dusk-lavender/90 cursor-pointer"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
