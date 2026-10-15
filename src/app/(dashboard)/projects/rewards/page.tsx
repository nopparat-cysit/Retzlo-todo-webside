import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RewardsStore } from "@/components/project/rewards-store";
import { ErrorState } from "@/components/ui/state";
import { getDatabaseErrorMessage } from "@/lib/safe-db";

export const metadata = {
  title: "Rewards Shop · Retzlo",
};

export default async function GlobalRewardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const [user, memberships] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          globalRole: true,
        },
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

    const userProfile = {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: (user.status ?? "ONLINE") as "ONLINE" | "BUSY" | "OFFLINE",
      isAdmin: user.globalRole === "SUPER_ADMIN" || user.globalRole === "ADMIN",
    };

    return (
      <main className="soft-grid-bg min-h-[100dvh] w-full overflow-y-auto p-3 sm:p-5 lg:p-6">
        <div className="max-w-[1720px] mx-auto space-y-5">
          <RewardsStore userProjects={userProjects} userProfile={userProfile} />
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="soft-grid-bg min-h-[100dvh] w-full overflow-y-auto p-3 sm:p-5 lg:p-6">
        <div className="mx-auto mb-5 max-w-7xl">
          <BackToProjectsLink />
        </div>
        <div className="mx-auto max-w-3xl">
          <ErrorState title="Rewards could not load" message={getDatabaseErrorMessage(error)} />
        </div>
      </main>
    );
  }
}

function BackToProjectsLink() {
  return (
    <Link
      href="/projects"
      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-dusk-amber transition-opacity hover:opacity-70"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to projects
    </Link>
  );
}
