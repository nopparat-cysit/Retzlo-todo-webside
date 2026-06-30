import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceShell } from "@/components/finance/finance-shell";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, avatar: true, status: true, email: true },
  });

  return (
    <Suspense fallback={
      <main className="soft-grid-bg min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6 flex items-center justify-center">
        <p className="text-stone-400">Loading Finance Workspace...</p>
      </main>
    }>
      <FinanceShell
        userName={userRecord?.name ?? session.user.name ?? ""}
        userEmail={userRecord?.email ?? session.user.email ?? ""}
        userAvatar={userRecord?.avatar}
        userStatus={userRecord?.status}
      >
        {children}
      </FinanceShell>
    </Suspense>
  );
}
