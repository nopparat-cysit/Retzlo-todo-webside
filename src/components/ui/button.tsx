import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-dusk-lavender text-ink-950 shadow-glow hover:bg-dusk-amber",
        variant === "ghost" &&
          "border border-white/10 bg-white/5 text-stone-100 hover:border-dusk-lavender/50 hover:bg-white/10",
        variant === "danger" && "bg-red-400/90 text-ink-950 hover:bg-red-300",
        className
      )}
      {...props}
    />
  );
}
