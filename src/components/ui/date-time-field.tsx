"use client";

import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyDueShortcut, type DueShortcut } from "@/lib/kanban/due-date";
import { cn } from "@/lib/utils";

export interface DateTimeFieldValue {
  date: string;
  time: string;
}

export interface DateTimeFieldProps {
  value: DateTimeFieldValue;
  onChange: (value: DateTimeFieldValue) => void;
  shortcuts?: DueShortcut[];
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

const defaultShortcuts: DueShortcut[] = ["today", "tomorrow", "next-week", "clear"];

const shortcutLabels: Record<DueShortcut, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  "next-week": "Next week",
  clear: "Clear"
};

export function DateTimeField({
  value,
  onChange,
  shortcuts = defaultShortcuts,
  disabled,
  label = "Due date",
  description = "No time means all day.",
  className
}: DateTimeFieldProps) {
  function update(patch: Partial<DateTimeFieldValue>) {
    onChange({ ...value, ...patch });
  }

  return (
    <section className={cn("rounded-lg border border-white/10 bg-white/[0.035] p-3", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-200">
        <CalendarClock className="h-4 w-4 text-dusk-amber" />
        {label}
      </div>
      {shortcuts.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {shortcuts.map((shortcut) => (
            <Button
              className="h-8 px-3"
              key={shortcut}
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                const nextDate = applyDueShortcut(shortcut);
                onChange({
                  date: nextDate,
                  time: shortcut === "clear" ? "" : value.time
                });
              }}
            >
              {shortcutLabels[shortcut]}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          disabled={disabled}
          type="date"
          value={value.date}
          onChange={(event) => update({ date: event.target.value })}
        />
        <Input
          disabled={disabled}
          type="time"
          value={value.time}
          onChange={(event) => update({ time: event.target.value })}
        />
      </div>
      {description ? <p className="mt-2 text-xs text-stone-500">{description}</p> : null}
    </section>
  );
}
