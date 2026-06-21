import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseUpdateNotePayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import {
  assertProjectMember,
  canManageAuthoredItem,
  canToggleHiddenItem,
  getProjectIdForNote,
  requireUserId
} from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";

function toNoteResponse(
  note: {
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
    author: { name: string | null; email: string };
  },
  context: {
    membership: { role: string };
    userId: string;
    allowMemberPrivateItems: boolean;
  }
) {
  return {
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
  };
}

export async function PATCH(request: Request, { params }: { params: { noteId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const projectId = await getProjectIdForNote(params.noteId);

    if (!projectId) {
      return jsonError("Note not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const existingNote = await prisma.note.findUnique({
      where: { id: params.noteId },
      select: {
        authorId: true,
        project: {
          select: {
            allowMemberPrivateItems: true,
            notesEnabled: true
          }
        }
      }
    });

    if (!existingNote) {
      return jsonError("Note not found.", 404);
    }

    if (!existingNote.project.notesEnabled) {
      return jsonError("Notes are disabled for this project.", 403);
    }

    if (!canManageAuthoredItem(membership, userId, existingNote.authorId)) {
      return jsonError("You can only update your own notes.", 403);
    }

    const payload = parseUpdateNotePayload(await request.json());

    if (
      typeof payload.isHidden === "boolean" &&
      !canToggleHiddenItem(membership, userId, existingNote.authorId, existingNote.project.allowMemberPrivateItems)
    ) {
      return jsonError("This project does not allow members to hide their own notes.", 403);
    }

    const note = await prisma.note.update({
      where: { id: params.noteId },
      data: {
        ...payload,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate
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

    return NextResponse.json({
      note: toNoteResponse(note, {
        membership,
        userId,
        allowMemberPrivateItems: existingNote.project.allowMemberPrivateItems
      })
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { noteId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const projectId = await getProjectIdForNote(params.noteId);

    if (!projectId) {
      return jsonError("Note not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const existingNote = await prisma.note.findUnique({
      where: { id: params.noteId },
      select: {
        authorId: true,
        project: {
          select: {
            notesEnabled: true
          }
        }
      }
    });

    if (!existingNote) {
      return jsonError("Note not found.", 404);
    }

    if (!existingNote.project.notesEnabled) {
      return jsonError("Notes are disabled for this project.", 403);
    }

    if (!canManageAuthoredItem(membership, userId, existingNote.authorId)) {
      return jsonError("You can only delete your own notes.", 403);
    }

    await prisma.note.delete({
      where: { id: params.noteId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
