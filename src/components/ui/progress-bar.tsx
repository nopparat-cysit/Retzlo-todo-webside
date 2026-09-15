import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  barClassName?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3"
};

export function ProgressBar({
  value,
  label = "Progress",
  showLabel = false,
  size = "sm",
  animated = true,
  className,
  barClassName,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(Number.isFinite(value) ? value : 0)));

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <span>{label}</span>
          <span className="font-mono">{clampedValue}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn("overflow-hidden rounded-full bg-white/10", sizeClasses[size])}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-dusk-lavender via-dusk-cyan to-dusk-amber",
            animated && "transition-all duration-300 ease-out",
            barClassName
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
