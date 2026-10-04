"use client";

import { cn } from "@/lib/utils";

// ─── Base Skeleton ────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-base rounded", className)}
    />
  );
}

// ─── Board Skeleton ───────────────────────────────────────────────────────────

function ColumnSkeleton() {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-stone-200/90 bg-stone-100/70 p-3 dark:border-white/[0.07] dark:bg-ink-900/40">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 pb-1">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="ml-auto h-5 w-5 rounded-full" />
      </div>

      {/* Card skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-stone-200/80 bg-white p-3 shadow-sm dark:border-white/[0.06] dark:bg-ink-800/50"
        >
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="mt-1 flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="ml-auto h-4 w-4 rounded-full" />
          </div>
        </div>
      ))}

      {/* Add card button placeholder */}
      <Skeleton className="h-8 w-full rounded-md opacity-60" />
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      role="status"
      aria-label="Loading board…"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <ColumnSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Project Card Skeleton ────────────────────────────────────────────────────

export function ProjectCardSkeleton() {
  return (
    <div
      className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-ink-900/60"
      role="status"
      aria-label="Loading project…"
    >
      {/* Top cover skeleton */}
      <div className="relative h-44 sm:h-48 w-full bg-stone-100 dark:bg-white/[0.04]">
        <div className="absolute left-3.5 top-3">
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="absolute right-3.5 top-3 flex gap-1.5">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
        <div className="absolute bottom-3 left-4">
          <Skeleton className="h-6 w-44 rounded-md" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 gap-3">
        {/* Description lines */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>

        {/* Progress bar skeleton */}
        <div className="mt-1 rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 space-y-2 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>

        {/* 4 Stat Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-stone-200/70 bg-stone-50/80 py-2 px-1 flex flex-col items-center gap-1 dark:border-white/5 dark:bg-white/[0.03]">
              <Skeleton className="h-3 w-4" />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>

        {/* Launch action bar */}
        <div className="mt-auto pt-3 border-t border-stone-200/80 dark:border-white/10 flex items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Projects Dashboard Skeleton ──────────────────────────────────────────────

export function ProjectsDashboardSkeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading projects…"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Calendar Skeleton ────────────────────────────────────────────────────────

export function CalendarSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3 p-1 overflow-hidden"
      role="status"
      aria-label="Loading calendar…"
    >
      {/* Calendar Header Toolbar */}
      <div className="lofi-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 sm:px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-stone-200/80 bg-stone-100/70 dark:border-white/10 dark:bg-white/[0.04]">
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="hidden h-5 w-28 rounded-full opacity-60 sm:block" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="hidden h-8 w-20 rounded-lg sm:block" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Calendar Main Grid Panel */}
      <div className="lofi-panel flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200/90 dark:border-white/10">
        {/* Weekday Names Header Bar */}
        <div className="grid grid-cols-7 border-b border-stone-200/80 bg-stone-50/80 dark:border-white/10 dark:bg-white/[0.02] py-2.5 text-center shrink-0">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div key={day} className="flex justify-center">
              <span className="text-[11px] font-semibold tracking-wider text-stone-400 dark:text-stone-500">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* 5 Rows x 7 Columns Month Grid */}
        <div className="grid flex-1 grid-cols-7 grid-rows-5 divide-x divide-y divide-stone-200/70 border-stone-200/70 dark:divide-white/[0.06] dark:border-white/[0.06] overflow-hidden min-h-0">
          {Array.from({ length: 35 }).map((_, i) => {
            const isToday = i === 7;
            const hasTask1 = i === 4 || i === 8 || i === 15 || i === 22;
            const hasTask2 = i === 4 || i === 15;
            const hasDiary = i >= 0 && i <= 8;

            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col p-2 min-h-0 gap-1.5 transition-colors overflow-hidden",
                  i < 4 ? "bg-stone-50/40 dark:bg-white/[0.01]" : "bg-white/40 dark:bg-transparent"
                )}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded text-xs",
                      isToday
                        ? "rounded-full bg-dusk-amber/20 font-bold text-dusk-amber"
                        : "text-stone-400 dark:text-stone-500"
                    )}
                  >
                    <Skeleton className="h-3 w-3 rounded" />
                  </div>
                </div>

                {/* Shimmering Item Bars */}
                <div className="flex flex-col gap-1 overflow-hidden mt-0.5">
                  {hasTask1 && (
                    <div className="flex h-5 w-full items-center gap-1.5 rounded-md border border-stone-200/80 bg-stone-100/80 px-1.5 dark:border-white/10 dark:bg-white/[0.04]">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-2.5 w-3/4 rounded" />
                    </div>
                  )}
                  {hasDiary && (
                    <div className="flex h-5 w-full items-center justify-between rounded-md border border-stone-200/60 bg-stone-50/90 px-1.5 dark:border-white/5 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-2 w-2 rounded-sm" />
                        <Skeleton className="h-2.5 w-14 rounded" />
                      </div>
                      <Skeleton className="h-2 w-5 rounded" />
                    </div>
                  )}
                  {hasTask2 && (
                    <div className="hidden sm:flex h-5 w-full items-center gap-1.5 rounded-md border border-stone-200/80 bg-stone-100/80 px-1.5 dark:border-white/10 dark:bg-white/[0.04]">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-2.5 w-1/2 rounded" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

