import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertProjectMember } from "@/lib/project-auth";
import { RewardsStore } from "@/components/project/rewards-store";

export default async function ProjectRewardsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await assertProjectMember(params.id, session.user.id);
  if (!membership) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true, coinName: true, coinSymbol: true },
  });

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
