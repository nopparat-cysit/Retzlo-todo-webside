import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseCreateNotePayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canToggleHiddenItem, isOwnerRole, requireUserId } from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";

function toNoteResponse(
  note: {
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
    createdAt: Date;
    updatedAt: Date;
    author: { name: string | null; email: string };
  },
  context: {
    membership: { role: string };
    userId: string;
    allowMemberPrivateItems: boolean;
  }
) {
  const canManage = isOwnerRole(context.membership.role) || context.userId === note.authorId;

  return {
    ...note,
    color: normalizeCardColor(note.color),
    completedAt: note.completedAt ? note.completedAt.toISOString() : null,
    dueDate: note.dueDate ? note.dueDate.toISOString() : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    canManage,
    canToggleHidden: canToggleHiddenItem(
      context.membership,
      context.userId,
      note.authorId,
      context.allowMemberPrivateItems
    )
  };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const membership = await assertProjectMember(params.id, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { allowMemberPrivateItems: true }
  });

  if (!project) {
    return jsonError("Project not found.", 404);
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

  return NextResponse.json({
    notes: notes.map((note) =>
      toNoteResponse(note, {
        membership,
        userId,
        allowMemberPrivateItems: project.allowMemberPrivateItems
      })
    )
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const payload = parseCreateNotePayload(await request.json());
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { allowMemberPrivateItems: true }
    });

    if (!project) {
      return jsonError("Project not found.", 404);
    }

    if (payload.isHidden && !canToggleHiddenItem(membership, userId, userId, project.allowMemberPrivateItems)) {
      return jsonError("This project does not allow members to hide their own notes.", 403);
    }

    const note = await prisma.note.create({
      data: {
        title: payload.title,
        content: payload.content,
        emoji: payload.emoji,
        color: payload.color,
        isHidden: payload.isHidden,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        dueDateAllDay: payload.dueDateAllDay,
        projectId: params.id,
        authorId: userId
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        note: toNoteResponse(note, {
          membership,
          userId,
          allowMemberPrivateItems: project.allowMemberPrivateItems
        })
      },
      { status: 201 }
    );
  } catch (error) {
    return parseError(error);
  }
}
