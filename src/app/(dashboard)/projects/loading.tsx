import { ProjectsDashboardSkeleton } from "@/components/ui/skeleton";

/**
 * Next.js streaming loading UI for the projects dashboard.
 * Shown automatically while the page fetches all projects from the DB.
 */
export default function ProjectsLoading() {
  return (
    <main className="min-h-screen w-screen overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Sidebar skeleton */}
        <aside className="lofi-panel flex flex-col rounded-lg p-5">
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
          <div className="mt-5 grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-base h-14 rounded-md" />
            ))}
          </div>

          {/* Calendar mini list */}
          <div className="mt-5 flex-1 rounded-md border border-white/10 bg-ink-950/35 p-4">
            <div className="skeleton-base mb-3 h-4 w-20 rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-base h-16 rounded-md" />
              ))}
            </div>
          </div>
        </aside>

        {/* Main content skeleton */}
        <section>
          {/* Header bar */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="space-y-2">
              <div className="skeleton-base h-3 w-24 rounded" />
              <div className="skeleton-base h-9 w-56 rounded" />
            </div>
            <div className="skeleton-base h-10 w-32 rounded-md" />
          </div>

          {/* Project cards grid */}
          <ProjectsDashboardSkeleton />
        </section>
      </div>
    </main>
  );
}
