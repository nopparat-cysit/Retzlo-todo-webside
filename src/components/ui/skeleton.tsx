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
