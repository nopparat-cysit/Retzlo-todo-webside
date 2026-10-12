import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";
import { recordDecoyHit } from "@/lib/admin-system-state";

export const dynamic = "force-dynamic";

/**
 * Route handler for /admin.
 * If user is authenticated as ADMIN, redirects seamlessly to the Super Admin Command Center (/admin-vault-9f8e).
 * Otherwise, acts as a Honeypot Decoy: records intrusion probe and renders 404 Not Found cloak.
 */
export default async function AdminDecoyPage() {
  const admin = await requireAdminUser();

  // If user is authenticated with ADMIN role, redirect to the real vault command center!
  if (admin) {
    redirect("/admin-vault-9f8e");
  }

  // Honeypot Decoy: capture bot/scanner probe telemetry and cloak with 404
  const headerList = headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "127.0.0.1");
  const userAgent = headerList.get("user-agent") || "unknown";

  recordDecoyHit(ip, userAgent);
  notFound();
}
