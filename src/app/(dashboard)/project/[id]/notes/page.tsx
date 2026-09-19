import { redirect } from "next/navigation";

import { NotesPanel } from "@/components/notes/notes-panel";
import { prisma } from "@/lib/prisma";
import {
  canAccessBoard,
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
  emoji: string;
  color: string;
  isStarred: boolean;
  isHidden: boolean;
  completedAt: Date | null;
  dueDate: Date | null;
  dueDateAllDay: boolean;
  projectId: string;
  authorId: string;
  boardId?: string | null;
  board?: { id: string; name: string } | null;
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
    boardId: note.boardId ?? null,
    board: note.board ? { id: note.board.id, name: note.board.name } : null,
    color: normalizeCardColor(note.color),
    completedAt: note.completedAt ? note.completedAt.toISOString() : null,
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

  const allBoards = await prisma.board.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: "asc" },
    include: {
      members: { select: { userId: true } }
    }
  });

  const accessibleBoards = allBoards
    .filter((b) => canAccessBoard(b, userId, membership.role))
    .map((b) => ({ id: b.id, name: b.name, isPrivate: b.isPrivate }));
  const accessibleBoardIds = accessibleBoards.map((b) => b.id);

  const notes = await prisma.note.findMany({
    where: isOwnerRole(membership.role)
      ? { projectId: params.id }
      : {
          projectId: params.id,
          OR: [
            { authorId: userId },
            {
              isHidden: false,
              OR: [
                { boardId: null },
                { boardId: { in: accessibleBoardIds } }
              ]
            }
          ]
        },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      },
      board: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <NotesPanel
      allowMemberPrivateItems={project.allowMemberPrivateItems}
      availableBoards={accessibleBoards}
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
