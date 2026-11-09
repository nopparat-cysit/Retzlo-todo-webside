import { NotesSkeleton } from "@/components/ui/skeleton";

/**
 * Next.js streaming loading UI for the notes page.
 * Shown automatically while the page fetches notes and categories from the DB.
 */
export default function NotesLoading() {
  return <NotesSkeleton />;
}
