import { notFound } from "next/navigation";

import { ProjectSettingsClient } from "@/components/project/project-settings-client";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { prisma } from "@/lib/prisma";
import { isOwnerRole, requireUserId } from "@/lib/project-auth";

export default async function SettingsPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { tab?: string; boardId?: string };
}) {
  const userId = await requireUserId();
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      coverImage: true,
      themeColor: true,
      sticker: true,
      allowMemberPrivateItems: true,
      notesEnabled: true,
      members: {
        where: { userId: userId ?? "" },
        select: { role: true },
        take: 1
      }
    }
  });

  if (!project) {
    notFound();
  }

  const [boards, projectMembers] = await Promise.all([
    prisma.board.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        columns: {
          select: {
            id: true,
            _count: { select: { cards: true } }
          }
        }
      }
    }),
    prisma.projectMember.findMany({
      where: { projectId: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const canManage = isOwnerRole(project.members[0]?.role);

  const formattedBoards = boards.map((b) => ({
    id: b.id,
    name: b.name,
    projectId: b.projectId,
    isPrivate: b.isPrivate,
    createdAt: b.createdAt.toISOString(),
    memberUserIds: b.members.map((m) => m.userId),
    members: b.members.map((m) => ({
      userId: m.userId,
      user: m.user
    })),
    cardCount: b.columns.reduce((sum, col) => sum + col._count.cards, 0)
  }));

  return (
    <ProjectSettingsClient
      projectId={params.id}
      project={project}
      formattedBoards={formattedBoards}
      projectMembers={projectMembers}
      canManage={canManage}
      initialTab={searchParams?.tab}
      themeToggleSlot={<ThemeToggle variant="settings" />}
    />
  );
}
