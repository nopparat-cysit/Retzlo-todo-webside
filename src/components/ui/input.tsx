import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-ink-950/50 px-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-dusk-lavender/70 focus:ring-2 focus:ring-dusk-lavender/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-white/10 bg-ink-950/50 px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-dusk-lavender/70 focus:ring-2 focus:ring-dusk-lavender/20",
        className
      )}
      {...props}
    />
  );
}
