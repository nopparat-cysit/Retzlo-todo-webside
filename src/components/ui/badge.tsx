import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
  {
    variants: {
      variant: {
        default: "border-dusk-lavender/25 bg-dusk-lavender/12 text-dusk-lavender",
        amber: "border-dusk-amber/25 bg-dusk-amber/12 text-dusk-amber",
        rose: "border-dusk-rose/25 bg-dusk-rose/12 text-dusk-rose",
        cyan: "border-dusk-cyan/25 bg-dusk-cyan/12 text-dusk-cyan",
        muted: "border-white/10 bg-white/[0.045] text-stone-300",
        danger: "border-red-300/25 bg-red-400/10 text-red-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
