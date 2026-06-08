import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-white/[0.065] px-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-dusk-lavender/20",
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
        "min-h-24 w-full rounded-xl border border-white/10 bg-white/[0.065] px-3 py-2 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-dusk-lavender/20",
        className
      )}
      {...props}
    />
  );
}
