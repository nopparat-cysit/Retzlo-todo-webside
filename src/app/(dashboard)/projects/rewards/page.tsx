import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RewardsStore } from "@/components/project/rewards-store";

export const metadata = {
  title: "Rewards Shop · RETROD",
};

export default async function GlobalRewardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, memberships] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    }),
    prisma.projectMember.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            coinName: true,
            coinSymbol: true,
          },
        },
      },
    }),
  ]);

  if (!user) redirect("/login");

  const userProjects = memberships.map((m) => ({
    id: m.project.id,
    name: m.project.name,
    coinName: m.project.coinName,
    coinSymbol: m.project.coinSymbol,
    isProjectAdmin: ["OWNER", "ADMIN"].includes(m.role),
  }));

  return (
    <main className="min-h-screen w-screen overflow-x-hidden px-4 py-6 sm:px-6">
      <div className="mx-auto mb-5 max-w-7xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-dusk-amber transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to projects
        </Link>
      </div>

      <div className="mx-auto max-w-7xl">
        <RewardsStore userProjects={userProjects} />
      </div>
    </main>
  );
}
