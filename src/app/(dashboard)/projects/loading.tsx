import { ProjectsDashboardSkeleton } from "@/components/ui/skeleton";

/**
 * Next.js streaming loading UI for the projects dashboard.
 * Shown automatically while the page fetches all projects from the DB.
 */
export default function ProjectsLoading() {
  return (
    <main className="min-h-screen w-screen overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Sidebar skeleton - displayed second on mobile, first on desktop */}
        <aside className="lofi-panel order-2 lg:order-1 flex flex-col rounded-2xl p-4 sm:p-5">
          {/* Logo/header */}
          <div className="flex items-center gap-3">
            <div className="skeleton-base h-10 w-10 rounded-md" />
            <div className="space-y-1.5">
              <div className="skeleton-base h-3 w-16 rounded" />
              <div className="skeleton-base h-5 w-28 rounded" />
            </div>
          </div>

          {/* Project selector */}
          <div className="mt-6 space-y-2">
            <div className="skeleton-base h-3 w-14 rounded" />
            <div className="skeleton-base h-10 w-full rounded-md" />
          </div>

          {/* Stat tiles */}
          <div className="mt-5 grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-base h-14 rounded-md" />
            ))}
          </div>

          {/* Calendar mini list */}
          <div className="mt-5 hidden sm:block lg:flex-1 rounded-xl border border-stone-200/80 bg-stone-50/80 p-4 dark:border-white/10 dark:bg-ink-950/35">
            <div className="skeleton-base mb-3 h-4 w-20 rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-base h-16 rounded-md" />
              ))}
            </div>
          </div>
        </aside>

        {/* Main content skeleton - displayed first on mobile, second on desktop */}
        <section className="order-1 lg:order-2 flex flex-col">
          {/* Header bar */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.035]">
            <div className="space-y-1.5 min-w-0">
              <div className="skeleton-base h-3 w-24 rounded" />
              <div className="skeleton-base h-7 sm:h-9 w-44 sm:w-56 rounded-md" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="skeleton-base h-9 w-full sm:w-56 rounded-xl" />
              <div className="skeleton-base h-9 w-32 rounded-xl shrink-0" />
            </div>
          </div>

          {/* Project cards grid */}
          <ProjectsDashboardSkeleton />
        </section>
      </div>
    </main>
  );
}
