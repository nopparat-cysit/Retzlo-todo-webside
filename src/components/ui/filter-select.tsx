"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps<TValue extends string> {
  value: TValue;
  options: Array<FilterSelectOption & { value: TValue }>;
  onValueChange: (value: TValue) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function FilterSelect<TValue extends string>({
  value,
  options,
  onValueChange,
  label,
  placeholder,
  className,
  triggerClassName
}: FilterSelectProps<TValue>) {
  return (
    <label className={cn("block min-w-0 space-y-1.5", className)}>
      {label ? <span className="block text-xs uppercase tracking-[0.16em] text-stone-500">{label}</span> : null}
      <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue as TValue)}>
        <SelectTrigger className={cn("h-9 rounded-lg text-xs", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
