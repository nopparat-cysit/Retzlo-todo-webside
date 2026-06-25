import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { NotesHubPanel } from "@/components/hub/notes-hub-panel";
import { FabHub } from "@/components/hub/fab-hub";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";

export const metadata = {
  title: "Notes Hub — Retzlo",
  description: "All notes across every project."
};

export default async function NotesHubPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: {
      projectId: true,
      role: true,
      project: { select: { id: true, name: true, allowMemberPrivateItems: true } }
    }
  });

  const projectIds = memberships.map((m) => m.projectId);
  const membershipMap = new Map(memberships.map((m) => [m.projectId, m]));

  const notes = await prisma.note.findMany({
    where: {
      projectId: { in: projectIds },
      OR: [{ isHidden: false }, { authorId: userId }]
    },
    include: {
      author: { select: { name: true, email: true } },
      project: { select: { id: true, name: true } }
    },
    orderBy: [{ updatedAt: "desc" }]
  });

  const normalizedNotes = notes.map((note) => {
    const membership = membershipMap.get(note.projectId);
    const isOwner = membership?.role === "OWNER";
    const allowMemberPrivateItems = membership?.project.allowMemberPrivateItems ?? false;
    const canManage = isOwner || note.authorId === userId;
    const canToggleHidden = isOwner || (note.authorId === userId && allowMemberPrivateItems);

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      emoji: note.emoji,
      color: normalizeCardColor(note.color),
      isStarred: note.isStarred,
      isHidden: note.isHidden,
      completedAt: note.completedAt?.toISOString() ?? null,
      dueDate: note.dueDate?.toISOString() ?? null,
      dueDateAllDay: note.dueDateAllDay,
      projectId: note.projectId,
      authorId: note.authorId,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      projectName: note.project.name,
      author: note.author,
      canManage,
      canToggleHidden
    };
  });

  const projects = memberships.map((m) => ({ id: m.project.id, name: m.project.name }));

  return (
    <main className="soft-grid-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <NotesHubPanel initialNotes={normalizedNotes} projects={projects} />
      </div>
      <FabHub />
    </main>
  );
}
