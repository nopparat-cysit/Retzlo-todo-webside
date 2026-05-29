import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session.user.id;
}

export async function getProjectMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    }
  });
}

export async function assertProjectMember(projectId: string, userId: string) {
  const membership = await getProjectMembership(projectId, userId);

  if (!membership) {
    return null;
  }

  return membership;
}

export async function getProjectIdForBoard(boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { projectId: true }
  });

  return board?.projectId ?? null;
}

export async function getProjectIdForColumn(columnId: string) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { board: { select: { projectId: true } } }
  });

  return column?.board.projectId ?? null;
}

export async function getProjectIdForCard(cardId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { column: { select: { board: { select: { projectId: true } } } } }
  });

  return card?.column.board.projectId ?? null;
}

export async function getProjectIdForNote(noteId: string) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { projectId: true }
  });

  return note?.projectId ?? null;
}
