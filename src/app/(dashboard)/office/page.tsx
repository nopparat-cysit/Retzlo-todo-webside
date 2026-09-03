import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { OfficeModule } from "@/components/office/office-module";
import { authOptions } from "@/lib/auth";
import { getDatabaseErrorMessage } from "@/lib/database-error";
import { getOfficePayload } from "@/lib/office/data";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Office - Retzlo",
  description: "A lightweight interactive office module for Retzlo workspaces."
};

export default async function OfficePage({
  searchParams
}: {
  searchParams?: { projectId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: session.user.id } }
      },
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
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const initialProjectId = projects.some((project) => project.id === searchParams?.projectId)
      ? searchParams?.projectId
      : undefined;

    const office = initialProjectId ? await getOfficePayload(initialProjectId) : null;

    return (
      <OfficeModule
        initialProjectId={initialProjectId}
        projects={projects.map((project) => ({
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
          }
        }))}
        office={office}
      />
    );
  } catch (error) {
    const databaseMessage = getDatabaseErrorMessage(error);

    return <OfficeModule projects={[]} office={null} databaseError={databaseMessage ?? "Office is waiting for the database."} />;
  }
}