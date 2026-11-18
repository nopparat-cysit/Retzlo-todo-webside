import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "motion-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "border border-theme-primary/25 bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary-hover",
        secondary:
          "border border-theme-border bg-theme-paper text-theme-foreground hover:border-theme-primary/35 hover:bg-theme-paper-strong",
        ghost:
          "border border-transparent bg-transparent text-theme-foreground hover:bg-theme-paper hover:text-theme-foreground",
        outline:
          "border border-theme-border bg-transparent text-theme-foreground hover:border-theme-primary/45 hover:bg-theme-paper",
        danger:
          "border border-theme-danger bg-theme-danger text-theme-danger-foreground hover:brightness-95",
        subtle:
          "border border-transparent bg-transparent text-theme-muted hover:bg-theme-paper hover:text-theme-foreground"
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
