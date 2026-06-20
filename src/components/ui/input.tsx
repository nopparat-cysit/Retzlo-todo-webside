import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const isDateLike = type === "date" || type === "datetime-local";
  const isTimeLike = type === "time";
  const Icon = isDateLike ? CalendarDays : isTimeLike ? Clock3 : null;
  const input = (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-lg border border-white/10 bg-white/[0.065] px-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-400 focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-dusk-lavender/25 disabled:cursor-not-allowed disabled:opacity-55",
        Icon && "pr-10 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
        className
      )}
      {...props}
    />
  );

  if (Icon) {
    return (
      <span className="relative block w-full">
        {input}
        <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dusk-amber/80" />
      </span>
    );
  }

  return (
    input
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-white/10 bg-white/[0.065] px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-400 focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-dusk-lavender/25 disabled:cursor-not-allowed disabled:opacity-55",
        className
      )}
      {...props}
    />
  );
}
