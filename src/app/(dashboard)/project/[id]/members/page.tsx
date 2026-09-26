import { redirect } from "next/navigation";

import { ProjectMembersView } from "@/components/project/project-members-view";
import { prisma } from "@/lib/prisma";
import { getProjectMembership, requireUserId } from "@/lib/project-auth";

export default async function MembersPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) {
    redirect("/login");
  }

  const membership = await getProjectMembership(params.id, userId);
  if (!membership) {
    redirect("/projects");
  }

  const [project, members, pendingInvitations] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, name: true }
    }),
    prisma.projectMember.findMany({
      where: { projectId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.invitation.findMany({
      where: { projectId: params.id, status: "PENDING" },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  if (!project) {
    redirect("/projects");
  }

  const serializedMembers = members.map((member) => ({
    id: member.id,
    userId: member.userId,
    role: member.role,
    createdAt: member.createdAt.toISOString(),
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar,
      status: member.user.status,
      createdAt: member.user.createdAt.toISOString()
    }
  }));

  const serializedPendingInvitations = pendingInvitations.map((inv) => ({
    id: inv.id,
    email: inv.email,
    token: inv.token,
    status: inv.status,
    expiresAt: inv.expiresAt.toISOString(),
    createdAt: inv.createdAt.toISOString(),
    inviter: {
      id: inv.inviter.id,
      name: inv.inviter.name,
      email: inv.inviter.email
    }
  }));

  return (
    <ProjectMembersView
      projectId={params.id}
      projectName={project.name}
      currentUserId={userId}
      currentUserRole={membership.role}
      initialMembers={serializedMembers}
      initialPendingInvitations={serializedPendingInvitations}
    />
  );
}

