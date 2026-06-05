"use client";

import { cn } from "@/lib/utils";

// ─── Keyframes injected once ─────────────────────────────────────────────────

const shimmerStyle = `
@keyframes sk-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
`;

let shimmerInjected = false;
function injectShimmer() {
  if (shimmerInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = shimmerStyle;
  document.head.appendChild(tag);
  shimmerInjected = true;
}

// ─── Base Skeleton ────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  // Inject keyframes on first render (client only)
  if (typeof document !== "undefined") injectShimmer();

  return (
    <div
      aria-hidden="true"
      className={cn("rounded bg-dusk-lavender/5", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, rgba(169,162,255,0.08) 50%, transparent 100%)",
        backgroundSize: "800px 100%",
        backgroundRepeat: "no-repeat",
        animation: "sk-shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

// ─── Board Skeleton ───────────────────────────────────────────────────────────

function ColumnSkeleton() {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border border-white/[0.07] bg-ink-900/40 p-3">
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
          className="flex flex-col gap-2 rounded-md border border-white/[0.06] bg-ink-800/50 p-3"
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
      <Skeleton className="h-8 w-full rounded-md opacity-50" />
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
      className="flex h-[370px] flex-col gap-4 rounded-xl border border-white/[0.08] bg-ink-900/60 p-5 backdrop-blur-md"
      role="status"
      aria-label="Loading project…"
    >
      {/* Top accent bar */}
      <Skeleton className="h-1 w-full rounded-full opacity-40" />

      {/* Icon + title row */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>

      {/* Description lines */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/6" />
      </div>

      {/* Stats row */}
      <div className="mt-auto flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="ml-auto h-6 w-6 rounded-full" />
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-8" />
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <Skeleton className="h-full w-2/5 rounded-full" />
        </div>
      </div>

      {/* Member avatars + action */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-full ring-2 ring-ink-900" />
          ))}
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
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
