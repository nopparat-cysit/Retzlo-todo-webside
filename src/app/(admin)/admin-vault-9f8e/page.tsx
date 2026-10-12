import { notFound } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminVaultPage() {
  const admin = await requireAdminUser();

  if (!admin) {
    notFound();
  }

  return (
    <AdminDashboardClient
      currentAdminEmail={admin.email}
      currentAdminName={admin.name || admin.username || "Super Admin"}
    />
  );
}
