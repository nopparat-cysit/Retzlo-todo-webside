import { redirect } from "next/navigation";

import { NotesPanel } from "@/components/notes/notes-panel";
import { prisma } from "@/lib/prisma";
import {
  canManageAuthoredItem,
  canToggleHiddenItem,
  getProjectMembership,
  isOwnerRole,
  requireUserId
} from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { ProjectNote } from "@/types/note";

function toProjectNotes(notes: Array<{
  id: string;
  title: string;
  content: string;
  color: string;
  isStarred: boolean;
  isHidden: boolean;
  dueDate: Date | null;
  dueDateAllDay: boolean;
  projectId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string | null;
    email: string;
  };
}>,
context: {
  membership: { role: string };
  userId: string;
  allowMemberPrivateItems: boolean;
}): ProjectNote[] {
  return notes.map((note) => ({
    ...note,
    color: normalizeCardColor(note.color),
    dueDate: note.dueDate ? note.dueDate.toISOString() : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    canManage: canManageAuthoredItem(context.membership, context.userId, note.authorId),
    canToggleHidden: canToggleHiddenItem(
      context.membership,
      context.userId,
      note.authorId,
      context.allowMemberPrivateItems
    )
  }));
}

export default async function NotesPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    redirect("/login");
  }

  const membership = await getProjectMembership(params.id, userId);

  if (!membership) {
    redirect("/projects");
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      allowMemberPrivateItems: true
    }
  });

  if (!project) {
    redirect("/projects");
  }

  const notes = await prisma.note.findMany({
    where: isOwnerRole(membership.role)
      ? { projectId: params.id }
      : {
          projectId: params.id,
          OR: [{ isHidden: false }, { authorId: userId }]
        },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <NotesPanel
      allowMemberPrivateItems={project.allowMemberPrivateItems}
      initialNotes={toProjectNotes(notes, {
        membership,
        userId,
        allowMemberPrivateItems: project.allowMemberPrivateItems
      })}
      isOwner={isOwnerRole(membership.role)}
      projectId={params.id}
    />
  );
}
