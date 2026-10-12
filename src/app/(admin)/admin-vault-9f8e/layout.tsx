import { notFound } from "next/navigation";

import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Retzlo Admin Portal",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminUser();

  if (!admin) {
    // Cloaking defense: return 404 so unauthorized visitors believe the page does not exist
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-400">
      {children}
    </div>
  );
}
