import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertProjectMember } from "@/lib/project-auth";
import { RewardsStore } from "@/components/project/rewards-store";
import { ErrorState } from "@/components/ui/state";
import { getDatabaseErrorMessage } from "@/lib/safe-db";

export default async function ProjectRewardsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  let membership;
  try {
    membership = await assertProjectMember(params.id, session.user.id);
  } catch (error) {
    return <ErrorState title="Rewards could not load" message={getDatabaseErrorMessage(error)} />;
  }

  if (!membership) {
    notFound();
  }

  let project;
  try {
    project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { name: true, coinName: true, coinSymbol: true },
    });
  } catch (error) {
    return <ErrorState title="Rewards could not load" message={getDatabaseErrorMessage(error)} />;
  }

  if (!project) {
    notFound();
  }

  const isProjectAdmin = ["OWNER", "ADMIN"].includes(membership.role);

  return (
    <div className="h-full overflow-y-auto pr-1 scrollbar-soft">
      <RewardsStore
        projectId={params.id}
        projectName={project.name}
        projectCoinName={project.coinName}
        projectCoinSymbol={project.coinSymbol}
        isProjectAdmin={isProjectAdmin}
      />
    </div>
  );
}
