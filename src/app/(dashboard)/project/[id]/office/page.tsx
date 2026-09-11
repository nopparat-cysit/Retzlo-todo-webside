import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { OfficeModule, type OfficeProject } from "@/components/office/office-module";
import { authOptions } from "@/lib/auth";
import { getDatabaseErrorMessage } from "@/lib/database-error";
import { getOfficePayload } from "@/lib/office/data";
import { prisma } from "@/lib/prisma";
import { getProjectMembership } from "@/lib/project-auth";
import { ErrorState } from "@/components/ui/state";

export const metadata = {
  title: "Office - Retzlo",
  description: "A lightweight interactive office module for Retzlo workspaces."
};

export default async function ProjectOfficePage({
  params
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const membership = await getProjectMembership(params.id, session.user.id);
    if (!membership) {
      notFound();
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        updatedAt: true,
        _count: {
          select: {
            boards: true,
            members: true,
            notes: true
          }
        },
        boards: {
          take: 1,
          orderBy: { createdAt: "asc" },
          select: { id: true }
        },
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      notFound();
    }

    const office = await getOfficePayload(project.id);

    const projectData: OfficeProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      updatedAt: project.updatedAt.toISOString(),
      boardId: project.boards[0]?.id ?? null,
      counts: {
        boards: project._count.boards,
        members: project._count.members,
        notes: project._count.notes
      },
      members: project.members.map((m) => ({
        id: m.user.id,
        name: m.user.name || m.user.email.split("@")[0],
        role: m.role,
        status: m.user.status || "ONLINE",
        isCurrentUser: m.user.id === session.user.id
      }))
    };

    return (
      <div className="h-full overflow-y-auto pr-1 scrollbar-soft">
        <OfficeModule
          initialProjectId={project.id}
          projects={[projectData]}
          office={office}
          isProjectScoped={true}
        />
      </div>
    );
  } catch (error) {
    const databaseMessage = getDatabaseErrorMessage(error);
    return (
      <div className="p-4">
        <ErrorState
          title="Office is waiting for the database"
          message={databaseMessage ?? "We encountered an issue loading the project office workspace."}
        />
      </div>
    );
  }
}
