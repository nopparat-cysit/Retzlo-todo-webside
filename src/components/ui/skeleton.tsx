"use client";

import { cn } from "@/lib/utils";

// Base Skeleton

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

// Board Skeleton

function ColumnSkeleton() {
  return (
    <div className="flex w-[calc(100vw-2.5rem)] max-w-[360px] sm:w-80 shrink-0 flex-col gap-3 rounded-xl border border-stone-200/90 bg-stone-100/70 p-3 dark:border-white/[0.07] dark:bg-ink-900/40">
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
      className="flex flex-col min-h-0 flex-1 overflow-hidden"
      role="status"
      aria-label="Loading board…"
    >
      {/* Mobile quick column jump navigation skeleton */}
      <div className="sm:hidden flex flex-wrap items-center gap-1.5 pb-1 mb-2 shrink-0">
        <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
        <Skeleton className="h-7 w-24 rounded-lg shrink-0" />
        <Skeleton className="h-7 w-16 rounded-lg shrink-0" />
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory flex-1 min-h-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <ColumnSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Project Card Skeleton

export function ProjectCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-ink-900/60"
      role="status"
      aria-label="Loading project…"
    >
      {/* Top cover skeleton */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden border-b border-white/10 bg-stone-100 dark:bg-white/[0.04]">
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
        <div className="mt-auto pt-2.5 border-t border-stone-200/80 dark:border-white/10 flex items-center gap-1.5 flex-nowrap">
          <Skeleton className="h-8.5 flex-1 rounded-lg" />
          <Skeleton className="h-8.5 w-8.5 shrink-0 rounded-lg" />
          <Skeleton className="h-8.5 w-8.5 shrink-0 rounded-lg" />
          <Skeleton className="h-8.5 w-8.5 shrink-0 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Projects Dashboard Skeleton

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

// Calendar Skeleton

export function CalendarSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3 p-1 overflow-hidden"
      role="status"
      aria-label="Loading calendar…"
    >
      {/* Calendar Header Toolbar */}
      <div className="lofi-panel flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-2xl p-3 sm:p-4 shrink-0">
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

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 sm:overflow-visible sm:flex-wrap">
          <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
          <Skeleton className="hidden h-8 w-20 rounded-lg sm:block shrink-0" />
          <Skeleton className="h-8 w-28 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Calendar Main Grid Panel */}
      <div className="lofi-panel flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200/90 dark:border-white/10">
        {/* Weekday Names Header Bar */}
        <div className="grid grid-cols-7 border-b border-stone-200/80 bg-stone-50/80 dark:border-white/10 dark:bg-white/[0.02] py-2.5 text-center shrink-0">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div key={day} className="flex justify-center">
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-400 dark:text-stone-500">
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
                  "flex flex-col p-1 sm:p-2 min-h-[52px] sm:min-h-[120px] overflow-hidden transition-colors",
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

                {/* Mobile compact dot indicator strip (< sm) */}
                <div className="flex sm:hidden items-center justify-center gap-1 mt-auto pt-1">
                  {(hasTask1 || hasDiary) && <Skeleton className="h-1.5 w-1.5 rounded-full shrink-0" />}
                  {hasTask2 && <Skeleton className="h-1.5 w-1.5 rounded-full shrink-0" />}
                </div>

                {/* Desktop task bars (sm+) */}
                <div className="hidden sm:flex flex-col gap-1 overflow-hidden mt-0.5">
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
                    <div className="flex h-5 w-full items-center gap-1.5 rounded-md border border-stone-200/80 bg-stone-100/80 px-1.5 dark:border-white/10 dark:bg-white/[0.04]">
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

// Project Members Skeleton

export function MembersSkeleton() {
  return (
    <div
      className="scrollbar-soft h-full min-h-0 overflow-y-auto pr-1"
      role="status"
      aria-label="Loading members…"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-5 pb-12">
        {/* Header Banner Skeleton */}
        <div className="lofi-panel rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-48 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72 max-w-full rounded" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton className="h-9 w-full sm:w-28 rounded-xl" />
              <Skeleton className="h-9 w-full sm:w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 5 Metric Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-200/90 bg-white/80 p-3.5 sm:p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="mt-3 h-7 w-12 rounded" />
              <Skeleton className="mt-1 h-3 w-24 rounded" />
            </div>
          ))}
        </div>

        {/* Tabs and Content Skeleton */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.035] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
              <Skeleton className="h-9 w-28 shrink-0 rounded-xl" />
              <Skeleton className="h-9 w-32 shrink-0 rounded-xl" />
              <Skeleton className="h-9 w-36 shrink-0 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-32 shrink-0 rounded-xl hidden sm:block" />
          </div>

          <Skeleton className="h-10 w-full rounded-xl" />

          {/* Member Row Skeletons */}
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-stone-200/80 p-3 sm:p-3.5 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-48 max-w-full rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Diary Skeleton

export function DiarySkeleton() {
  return (
    <div
      className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] gap-2.5 sm:gap-3"
      role="status"
      aria-label="Loading diary…"
    >
      {/* Hero panel */}
      <div className="lofi-panel rounded-2xl p-2.5 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-7 w-36 rounded-md" />
              {/* Date nav controls */}
              <div className="flex items-center gap-1 rounded-xl border border-stone-200/80 p-0.5 dark:border-white/10">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-7 w-14 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-32 rounded-lg" />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
            {/* Metrics pills (Due, Done, Starred) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="h-8 w-16 rounded-xl" />
              <Skeleton className="h-8 w-16 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden rounded-xl border border-white/10 bg-ink-950/40 p-1 gap-1 shrink-0">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>

      {/* Main split: Sidebar Shelf + Checklist */}
      <div className="grid min-h-0 flex-1 gap-2.5 sm:gap-3 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Shelf (desktop only) */}
        <div className="lofi-panel hidden lg:flex min-h-0 flex-1 flex-col rounded-2xl p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5 dark:border-white/10">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <div className="space-y-2 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-stone-200/70 p-2.5 dark:border-white/5">
                <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist Container */}
        <div className="lofi-panel flex min-h-0 flex-1 flex-col rounded-2xl p-3 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 dark:border-white/10">
            <div className="space-y-1">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>

          <div className="space-y-2.5 flex-1 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-stone-200/70 p-3 dark:border-white/5">
                <div className="flex items-center gap-2.5 flex-1">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-3.5 w-3/5 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Notes Skeleton

export function NotesSkeleton() {
  return (
    <div
      className="grid h-full min-h-0 grid-rows-[max-content_minmax(0,1fr)] gap-3"
      role="status"
      aria-label="Loading notes…"
    >
      {/* Header banner */}
      <div className="lofi-panel rounded-2xl px-4 py-3 border border-stone-200/90 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <Skeleton className="h-6 w-52 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-36 sm:w-48 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main notes layout: Sidebar (desktop) + Notes cards grid */}
      <div className="grid min-h-0 gap-3 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Sidebar Folders: hidden on mobile, visible on desktop */}
        <div className="lofi-panel hidden lg:flex min-h-0 flex-col rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-white/10">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <div className="space-y-2 flex-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-stone-200/60 p-2.5 dark:border-white/5">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-3.5 flex-1 rounded" />
                <Skeleton className="h-4 w-6 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Notes Grid / Cards */}
        <div className="lofi-panel flex min-h-0 flex-1 flex-col rounded-2xl p-3.5 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 flex-1 overflow-hidden pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-stone-200/80 p-4 space-y-2.5 dark:border-white/5 bg-stone-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <Skeleton className="h-2.5 w-16 rounded" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
