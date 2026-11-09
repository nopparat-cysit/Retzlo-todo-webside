import { BoardSkeleton } from "@/components/ui/skeleton";

/**
 * Next.js streaming loading UI for the board page.
 * Shown automatically while the page fetches board data from the DB.
 */
export default function BoardLoading() {
  return (
    <div className="grid h-[calc(100vh-1.5rem)] min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Board skeleton fills the main column */}
      <div className="flex min-h-0 flex-col gap-3 sm:gap-4 overflow-hidden p-1">
        {/* Header bar skeleton */}
        <div className="lofi-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-3 sm:p-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="skeleton-base h-5 sm:h-6 w-36 sm:w-44 rounded-md" />
            <div className="skeleton-base h-3 w-56 max-w-full rounded" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="skeleton-base h-8.5 sm:h-9 w-24 sm:w-28 rounded-xl" />
            <div className="skeleton-base h-8.5 sm:h-9 w-20 sm:w-24 rounded-xl" />
          </div>
        </div>
        <BoardSkeleton />
      </div>

      {/* Notes rail skeleton (hidden on mobile/tablet, visible on xl) */}
      <div className="lofi-panel hidden xl:flex min-h-0 flex-col rounded-2xl p-4">
        <div className="skeleton-base mb-4 h-5 w-24 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-base h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
