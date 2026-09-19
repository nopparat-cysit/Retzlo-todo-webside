import { notFound } from "next/navigation";

import { ProjectBoardsManager } from "@/components/project/project-boards-manager";
import { SettingsForm } from "@/components/project/settings-form";
import { SoundToggle } from "@/components/project/sound-toggle";
import { prisma } from "@/lib/prisma";
import { isOwnerRole, requireUserId } from "@/lib/project-auth";

export default async function SettingsPage({ params }: { params: { id: string } }) {
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
    <div className="scrollbar-soft h-full min-h-0 overflow-y-auto pr-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-8">
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-100">Project settings</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-500">
            Manage this workspace without digging through crowded panels.
          </p>
        </section>

        {/* Sub-projects & Boards Management */}
        <ProjectBoardsManager
          projectId={params.id}
          canManage={canManage}
          initialBoards={formattedBoards}
          projectMembers={projectMembers}
        />

        <SettingsForm project={project} canManagePrivacy={canManage} />

        <section className="lofi-panel rounded-2xl p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Personal preferences</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-100">Sound feedback</h2>
          <p className="mb-4 mt-1 text-sm leading-6 text-stone-500">
            These settings are stored in this browser only.
          </p>
          <SoundToggle />
        </section>
      </div>
    </div>
  );
}
