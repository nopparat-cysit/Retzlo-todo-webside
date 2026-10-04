import { CalendarSkeleton } from "@/components/ui/skeleton";

/**
 * Next.js streaming loading UI for the project calendar page.
 * Displayed automatically while the server fetches cards, notes, and diary data.
 */
export default function CalendarLoading() {
  return <CalendarSkeleton />;
}
