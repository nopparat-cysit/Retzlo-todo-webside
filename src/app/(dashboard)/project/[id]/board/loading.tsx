import { BoardSkeleton } from "@/components/ui/skeleton";

/**
 * Next.js streaming loading UI for the board page.
 * Shown automatically while the page fetches board data from the DB.
 */
export default function BoardLoading() {
  return (
    <div className="grid h-[calc(100vh-1.5rem)] min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Board skeleton fills the main column */}
      <div className="flex min-h-0 flex-col gap-4 overflow-hidden p-1">
        {/* Header bar skeleton */}
        <div className="lofi-panel flex items-center justify-between gap-3 rounded-lg p-4">
          <div className="space-y-2">
            <div className="skeleton-base h-6 w-40 rounded" />
            <div className="skeleton-base h-3.5 w-64 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton-base h-10 w-32 rounded-md" />
            <div className="skeleton-base h-10 w-24 rounded-md" />
          </div>
        </div>
        <BoardSkeleton />
      </div>

      {/* Notes rail skeleton */}
      <div className="lofi-panel flex min-h-0 flex-col rounded-lg p-4">
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
