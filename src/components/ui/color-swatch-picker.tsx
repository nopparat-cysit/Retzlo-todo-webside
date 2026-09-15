import type { HTMLAttributes } from "react";
import { cardColorOptions } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";

export interface ColorSwatchOption {
  value: string;
  label: string;
  swatchClass: string;
}

export interface ColorSwatchPickerProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: T;
  onChange: (value: T) => void;
  label?: string;
  showLabel?: boolean;
  options?: readonly ColorSwatchOption[];
  size?: "sm" | "md";
}

export function ColorSwatchPicker<T extends string = string>({
  value,
  onChange,
  label,
  showLabel = true,
  options = cardColorOptions,
  size = "md",
  className,
  ...props
}: ColorSwatchPickerProps<T>) {
  const currentOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.16em] text-stone-400">
            {label ?? "Color"}
          </span>
          {currentOption && (
            <span className="text-xs text-stone-500">{currentOption.label}</span>
          )}
        </div>
      )}

      <div
        className={cn(
          "grid gap-2",
          options.length <= 6
            ? "grid-cols-6"
            : "grid-cols-5 sm:grid-cols-10"
        )}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as T)}
              className={cn(
                "grid place-items-center rounded-lg border bg-white/[0.035] transition hover:-translate-y-0.5",
                size === "sm" ? "h-7" : "h-8 sm:h-9",
                isSelected
                  ? "border-dusk-amber shadow-[0_0_0_2px_rgba(249,199,132,0.16)]"
                  : "border-white/10 hover:border-white/20"
              )}
              title={option.label}
              aria-label={`Use ${option.label} color`}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  "rounded-full border shrink-0",
                  size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                  option.swatchClass
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
