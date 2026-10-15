import type { HTMLAttributes } from "react";
import { Check, Palette } from "lucide-react";
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
  size?: "sm" | "md" | "lg";
  layout?: "grid" | "wrap";
  columns?: number;
}

export function ColorSwatchPicker<T extends string = string>({
  value,
  onChange,
  label,
  showLabel = true,
  options = cardColorOptions,
  size = "md",
  layout = "grid",
  columns,
  className,
  ...props
}: ColorSwatchPickerProps<T>) {
  const currentOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("space-y-2.5", className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
              {label ?? "Color"}
            </span>
          </div>
          {currentOption && (
            <span className="flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-100/80 px-2.5 py-0.5 text-[11px] font-medium text-stone-700 dark:border-white/10 dark:bg-ink-950/40 dark:text-stone-300">
              <span className={cn("h-2 w-2 rounded-full border shadow-2xs shrink-0", currentOption.swatchClass)} />
              <span>{currentOption.label}</span>
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          layout === "wrap"
            ? "flex flex-wrap items-center gap-2"
            : columns
            ? `grid grid-cols-${columns} gap-2`
            : cn(
                "grid gap-2",
                options.length <= 6
                  ? "grid-cols-6"
                  : "grid-cols-5 sm:grid-cols-10"
              )
        )}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          const isDefaultOrLight =
            option.value === "DEFAULT" ||
            option.value === "default" ||
            option.label.toLowerCase() === "default";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as T)}
              className={cn(
                "group relative flex aspect-square w-full items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer select-none",
                size === "sm"
                  ? "h-8 max-w-[34px]"
                  : size === "lg"
                  ? "h-11 max-w-[48px]"
                  : "h-9 sm:h-10 max-w-[44px]",
                "mx-auto",
                isSelected
                  ? "border-dusk-amber bg-dusk-amber/10 shadow-[0_0_0_2px_rgba(249,199,132,0.16)] ring-2 ring-dusk-amber ring-offset-2 ring-offset-white dark:ring-offset-ink-950 scale-105 z-10"
                  : "border-stone-200/80 bg-stone-100/50 hover:border-stone-300 hover:bg-stone-200/40 hover:scale-105 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
              )}
              title={option.label}
              aria-label={`Use ${option.label} color`}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  "rounded-full border shadow-xs transition-transform duration-150 flex items-center justify-center shrink-0",
                  size === "sm"
                    ? "h-4 w-4"
                    : size === "lg"
                    ? "h-6 w-6"
                    : "h-5 w-5 sm:h-5.5 sm:w-5.5",
                  option.swatchClass,
                  isSelected && "scale-105"
                )}
              >
                {isSelected && (
                  <Check
                    className={cn(
                      "stroke-[3] drop-shadow-xs",
                      size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3",
                      isDefaultOrLight
                        ? "text-stone-700 dark:text-stone-200"
                        : "text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.65)]"
                    )}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
