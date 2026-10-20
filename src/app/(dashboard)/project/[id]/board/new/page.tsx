import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProjectMembership, requireUserId } from "@/lib/project-auth";
import { CreateBoardPageView } from "@/components/kanban/create-board-page-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CreateBoardPageProps {
  params: { id: string };
}

export default async function CreateBoardPage({ params }: CreateBoardPageProps) {
  const userId = await requireUserId();
  if (!userId) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/project/${params.id}/board/new`)}`);
  }

  const membership = await getProjectMembership(params.id, userId);
  if (!membership) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      members: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const projectMembers = project.members.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatar: m.user.avatar,
    role: m.role
  }));

  return (
    <CreateBoardPageView
      projectId={project.id}
      projectName={project.name}
      projectMembers={projectMembers}
    />
  );
}
