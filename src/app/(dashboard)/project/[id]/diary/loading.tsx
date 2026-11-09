import { DiarySkeleton } from "@/components/ui/skeleton";

/**
 * Next.js streaming loading UI for the diary ritual page.
 * Shown automatically while the page fetches diary logs and tasks from the DB.
 */
export default function DiaryLoading() {
  return <DiarySkeleton />;
}
