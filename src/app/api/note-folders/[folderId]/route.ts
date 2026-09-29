import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseUpdateNoteFolderPayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import {
  assertProjectMember,
  canManageAuthoredItem,
  getProjectIdForNoteFolder,
  requireUserId
} from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";

export async function PATCH(request: Request, { params }: { params: { folderId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const projectId = await getProjectIdForNoteFolder(params.folderId);

    if (!projectId) {
      return jsonError("Folder not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const existingFolder = await prisma.noteFolder.findUnique({
      where: { id: params.folderId },
      select: { authorId: true }
    });

    if (!existingFolder) {
      return jsonError("Folder not found.", 404);
    }

    if (!canManageAuthoredItem(membership, userId, existingFolder.authorId)) {
      return jsonError("You can only update your own folders or must be project owner.", 403);
    }

    const payload = parseUpdateNoteFolderPayload(await request.json());

    const folder = await prisma.noteFolder.update({
      where: { id: params.folderId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.color !== undefined ? { color: payload.color } : {}),
        ...(payload.icon !== undefined ? { icon: payload.icon } : {})
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    triggerPusherEvent(
      [`retzlo-notes-${projectId}`, `retzlo-project-${projectId}`],
      "retzlo:sync",
      { action: "NOTE_FOLDER_UPDATED", folderId: folder.id, senderId: userId }
    );

    return NextResponse.json({ folder });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { folderId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const projectId = await getProjectIdForNoteFolder(params.folderId);

    if (!projectId) {
      return jsonError("Folder not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const existingFolder = await prisma.noteFolder.findUnique({
      where: { id: params.folderId },
      select: { authorId: true }
    });

    if (!existingFolder) {
      return jsonError("Folder not found.", 404);
    }

    if (!canManageAuthoredItem(membership, userId, existingFolder.authorId)) {
      return jsonError("You can only delete your own folders or must be project owner.", 403);
    }

    await prisma.noteFolder.delete({
      where: { id: params.folderId }
    });

    triggerPusherEvent(
      [`retzlo-notes-${projectId}`, `retzlo-project-${projectId}`],
      "retzlo:sync",
      { action: "NOTE_FOLDER_DELETED", folderId: params.folderId, senderId: userId }
    );

    return NextResponse.json({ success: true, folderId: params.folderId });
  } catch (error) {
    return parseError(error);
  }
}
