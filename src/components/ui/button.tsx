import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "motion-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/55 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "border border-dusk-lavender/25 bg-dusk-lavender text-ink-950 hover:bg-dusk-amber",
        secondary:
          "border border-white/10 bg-white/[0.075] text-stone-100 hover:border-dusk-lavender/35 hover:bg-white/[0.11]",
        ghost:
          "border border-white/10 bg-white/[0.045] text-stone-100 hover:border-dusk-lavender/45 hover:bg-white/[0.09]",
        outline:
          "border border-white/14 bg-transparent text-stone-100 hover:border-dusk-lavender/45 hover:bg-white/[0.055]",
        danger:
          "border border-red-300/25 bg-red-400/90 text-ink-950 hover:bg-red-300",
        subtle:
          "border border-transparent bg-transparent text-stone-300 hover:bg-white/[0.06] hover:text-stone-100"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "h-9 w-9 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
