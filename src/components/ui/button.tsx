import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-55",
        size === "md" && "h-10 px-4 text-sm",
        size === "sm" && "h-7 px-3 text-xs",
        variant === "primary" &&
          "bg-gradient-to-r from-dusk-lavender to-dusk-rose text-ink-950 shadow-[0_12px_30px_rgba(169,162,255,0.22)] hover:from-dusk-amber hover:to-dusk-rose hover:-translate-y-0.5",
        variant === "ghost" &&
          "border border-white/10 bg-white/5 text-stone-100 hover:border-dusk-lavender/50 hover:bg-white/10",
        variant === "danger" && "bg-red-400/90 text-ink-950 hover:bg-red-300",
        className
      )}
      {...props}
    />
  );
}
