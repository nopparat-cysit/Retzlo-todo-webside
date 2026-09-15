import type { HTMLAttributes } from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CoinBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  amount: number;
  prefix?: string;
  suffix?: string;
  size?: "sm" | "md";
  variant?: "pill" | "chip" | "subtle";
  iconClassName?: string;
}

const variantStyles = {
  pill: "rounded-full border border-dusk-amber/30 bg-dusk-amber/15 text-dusk-amber shadow-xs",
  chip: "rounded-md border border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber",
  subtle: "rounded border border-dusk-amber/20 bg-dusk-amber/5 text-dusk-amber/90"
};

const sizeStyles = {
  sm: {
    container: "gap-1 px-1.5 py-0.5 text-[11px] font-semibold",
    icon: "h-3 w-3"
  },
  md: {
    container: "gap-1.5 px-2.5 py-0.5 text-xs font-semibold",
    icon: "h-3.5 w-3.5"
  }
};

export function CoinBadge({
  amount,
  prefix = "",
  suffix = "",
  size = "md",
  variant = "pill",
  className,
  iconClassName,
  ...props
}: CoinBadgeProps) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const currentSize = sizeStyles[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center select-none font-mono",
        variantStyles[variant],
        currentSize.container,
        className
      )}
      title={`${safeAmount} coins`}
      {...props}
    >
      <Coins className={cn(currentSize.icon, "shrink-0", iconClassName)} />
      <span>
        {prefix}
        {safeAmount}
        {suffix ? ` ${suffix}` : ""}
      </span>
    </span>
  );
}
