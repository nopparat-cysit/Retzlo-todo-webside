"use client";

import {
  Archive,
  BadgeCheck,
  BookOpen,
  Bug,
  CalendarDays,
  Clock3,
  Code2,
  Coffee,
  Coins,
  Flame,
  Gift,
  Heart,
  Inbox,
  KanbanSquare,
  ListChecks,
  Package,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  Wrench
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { columnIconOptions, getColumnIconOption, type ColumnIconId } from "@/lib/kanban/column-settings";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const columnIconMap: Record<ColumnIconId, IconComponent> = {
  archive: Archive,
  book: BookOpen,
  bug: Bug,
  calendar: CalendarDays,
  check: BadgeCheck,
  code: Code2,
  coffee: Coffee,
  coin: Coins,
  flame: Flame,
  gift: Gift,
  heart: Heart,
  inbox: Inbox,
  kanban: KanbanSquare,
  list: ListChecks,
  package: Package,
  palette: Palette,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  timer: Timer,
  clock: Clock3,
  wrench: Wrench
};

export function ColumnIconGlyph({
  className,
  icon
}: {
  className?: string;
  icon: string | null | undefined;
}) {
  const iconOption = getColumnIconOption(icon);
  const Icon = columnIconMap[iconOption.id];

  return <Icon aria-hidden="true" className={cn("h-4 w-4", className)} />;
}

export function ColumnIconPicker({
  onChange,
  value
}: {
  onChange: (value: ColumnIconId) => void;
  value: string | null | undefined;
}) {
  const selectedIcon = getColumnIconOption(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Icon</span>
        <span className="text-xs text-stone-600 dark:text-stone-500">{selectedIcon.label}</span>
      </div>
      <div className="scrollbar-soft grid max-h-44 grid-cols-6 gap-2 overflow-y-auto rounded-xl border border-stone-200/90 bg-stone-100/80 p-2 dark:border-white/10 dark:bg-ink-950/25">
        {columnIconOptions.map((option) => {
          const Icon = columnIconMap[option.id];
          const isSelected = option.id === selectedIcon.id;

          return (
            <button
              key={option.id}
              aria-label={`Use ${option.label} icon`}
              className={cn(
                "grid h-10 place-items-center rounded-lg border transition hover:-translate-y-0.5",
                isSelected
                  ? "border-dusk-amber bg-dusk-amber/15 text-dusk-amber shadow-[0_0_0_2px_rgba(249,199,132,0.25)]"
                  : "border-stone-200/80 bg-white text-stone-600 hover:border-dusk-lavender/40 hover:bg-stone-50 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-100"
              )}
              title={option.label}
              type="button"
              onClick={() => onChange(option.id)}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
