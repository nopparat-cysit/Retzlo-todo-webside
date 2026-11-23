import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseUpdateNotePayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import {
  assertProjectMember,
  canAccessBoard,
  canManageAuthoredItem,
  canToggleHiddenItem,
  getProjectIdForNote,
  requireUserId
} from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

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
    boardId?: string | null;
    folderId?: string | null;
    projectId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: { name: string | null; email: string };
    board?: { id: string; name: string } | null;
    folder?: { id: string; name: string; color: string; icon: string } | null;
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
    boardId: note.boardId ?? null,
    board: note.board ? { id: note.board.id, name: note.board.name } : null,
    folderId: note.folderId ?? null,
    folder: note.folder ? { id: note.folder.id, name: note.folder.name, color: note.folder.color, icon: note.folder.icon } : null,
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
            allowMemberPrivateItems: true
          }
        }
      }
    });

    if (!existingNote) {
      return jsonError("Note not found.", 404);
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

    if (payload.boardId) {
      const board = await prisma.board.findUnique({
        where: { id: payload.boardId },
        select: { id: true, projectId: true, isPrivate: true, members: { select: { userId: true } } }
      });

      if (!board || board.projectId !== projectId) {
        return jsonError("Board does not belong to this project.", 400);
      }

      if (!canAccessBoard(board, userId, membership.role)) {
        return jsonError("You do not have access to this private board.", 403);
      }
    }

    if (payload.folderId) {
      const folder = await prisma.noteFolder.findFirst({
        where: { id: payload.folderId, projectId },
        select: { id: true }
      });

      if (!folder) {
        return jsonError("Folder does not belong to this project.", 400);
      }
    }

    const { isCompleted, ...notePayload } = payload;
    const completionData =
      typeof isCompleted === "boolean" ? { completedAt: isCompleted ? new Date() : null } : {};

    const note = await prisma.note.update({
      where: { id: params.noteId },
      data: {
        ...notePayload,
        ...completionData,
        dueDate: notePayload.dueDate ? new Date(notePayload.dueDate) : notePayload.dueDate
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
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    triggerPusherEvent(
      [`retzlo-notes-${projectId}`, `retzlo-project-${projectId}`],
      "retzlo:sync",
      { action: "NOTE_UPDATED", noteId: note.id, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/notes/${params.noteId}`,
      requestMethod: "PATCH",
      category: "PROJECT",
      action: "NOTE_UPDATED",
      severity: "INFO",
      status: "SUCCESS",
      targetType: "NOTE",
      targetId: note.id,
      targetName: note.title,
      summary: `Updated note "${note.title}"`,
      metadata: { title: note.title, folderId: note.folderId }
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

export async function DELETE(request: Request, { params }: { params: { noteId: string } }) {
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
        title: true,
        folderId: true
      }
    });

    if (!existingNote) {
      return jsonError("Note not found.", 404);
    }

    if (!canManageAuthoredItem(membership, userId, existingNote.authorId)) {
      return jsonError("You can only delete your own notes.", 403);
    }

    await prisma.note.delete({
      where: { id: params.noteId }
    });

    triggerPusherEvent(
      [`retzlo-notes-${projectId}`, `retzlo-project-${projectId}`],
      "retzlo:sync",
      { action: "NOTE_DELETED", noteId: params.noteId, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/notes/${params.noteId}`,
      requestMethod: "DELETE",
      category: "PROJECT",
      action: "NOTE_DELETED",
      severity: "WARNING",
      status: "SUCCESS",
      targetType: "NOTE",
      targetId: params.noteId,
      targetName: existingNote.title,
      summary: `Deleted note "${existingNote.title}"`,
      metadata: { title: existingNote.title, folderId: existingNote.folderId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
