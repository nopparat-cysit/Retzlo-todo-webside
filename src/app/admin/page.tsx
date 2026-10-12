import { notFound } from "next/navigation";

/**
 * Decoy route for /admin.
 * Always renders 404 Not Found to prevent bot scanning and reconnaissance.
 */
export default function AdminDecoyPage() {
  notFound();
}
