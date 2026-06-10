import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ModuleSelector } from "@/components/modules/module-selector";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Select Module — RETROD",
  description: "Choose a workspace module to enter."
};

export default async function SelectModulePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Only SuperAdmin can access this page
  if (session.user.globalRole !== "SUPERADMIN") {
    redirect("/projects");
  }

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <ModuleSelector />
      </div>
    </main>
  );
}
