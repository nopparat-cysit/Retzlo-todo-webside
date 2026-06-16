import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StickerSurfaceProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  selected?: boolean;
}

export function StickerSurface({ children, className, selected = false, ...props }: StickerSurfaceProps) {
  return (
    <span
      className={cn(
        "inline-grid h-11 w-11 place-items-center rounded-xl border bg-white/[0.06] text-stone-100 transition",
        selected
          ? "border-dusk-amber/75 bg-dusk-amber/12 ring-2 ring-dusk-amber/30"
          : "border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface StickerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  selected?: boolean;
}

export function StickerButton({ children, className, selected = false, type = "button", ...props }: StickerButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-grid h-11 w-11 place-items-center rounded-xl border bg-white/[0.06] text-stone-100 transition hover:border-dusk-lavender/45 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/55 disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-dusk-amber/75 bg-dusk-amber/12 ring-2 ring-dusk-amber/30"
          : "border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
