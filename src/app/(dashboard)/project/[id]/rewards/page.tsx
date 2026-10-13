import { redirect } from "next/navigation";
import { RewardsStore } from "@/components/project/rewards-store";
import { ErrorState } from "@/components/ui/state";
import { prisma } from "@/lib/prisma";
import { getProjectMembership, requireUserId } from "@/lib/project-auth";
import { getDatabaseErrorMessage } from "@/lib/safe-db";

export const metadata = {
  title: "Rewards Shop · Retzlo",
};

export default async function ProjectRewardsPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) {
    redirect("/login");
  }

  const membership = await getProjectMembership(params.id, userId);
  if (!membership) {
    redirect("/projects");
  }

  try {
    const [project, memberships] = await Promise.all([
      prisma.project.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          coinName: true,
          coinSymbol: true,
        },
      }),
      prisma.projectMember.findMany({
        where: { userId },
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

    if (!project) {
      redirect("/projects");
    }

    const userProjects = memberships.map((m) => ({
      id: m.project.id,
      name: m.project.name,
      coinName: m.project.coinName,
      coinSymbol: m.project.coinSymbol,
      isProjectAdmin: ["OWNER", "ADMIN"].includes(m.role),
    }));

    const isProjectAdmin = ["OWNER", "ADMIN"].includes(membership.role);

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <RewardsStore
          projectId={project.id}
          projectName={project.name}
          projectCoinName={project.coinName ?? undefined}
          projectCoinSymbol={project.coinSymbol ?? undefined}
          isProjectAdmin={isProjectAdmin}
          userProjects={userProjects}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <ErrorState title="Rewards could not load" message={getDatabaseErrorMessage(error)} />
      </div>
    );
  }
}
