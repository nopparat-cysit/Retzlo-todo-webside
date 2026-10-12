import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { recordDecoyHit } from "@/lib/admin-system-state";

export const dynamic = "force-dynamic";

/**
 * Decoy route for /admin.
 * Logs reconnaissance attempt to honeypot telemetry and renders 404 Not Found.
 */
export default function AdminDecoyPage() {
  const headerList = headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "127.0.0.1");
  const userAgent = headerList.get("user-agent") || "unknown";

  recordDecoyHit(ip, userAgent);
  notFound();
}
