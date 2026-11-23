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
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

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

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/note-folders/${params.folderId}`,
      requestMethod: "PATCH",
      category: "PROJECT",
      action: "NOTE_FOLDER_UPDATED",
      severity: "INFO",
      status: "SUCCESS",
      targetType: "NOTE_FOLDER",
      targetId: folder.id,
      targetName: folder.name,
      summary: `Updated note folder "${folder.name}"`,
      afterState: { id: folder.id, name: folder.name, color: folder.color, icon: folder.icon }
    });

    return NextResponse.json({ folder });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: { folderId: string } }) {
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
      select: { authorId: true, name: true }
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

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/note-folders/${params.folderId}`,
      requestMethod: "DELETE",
      category: "PROJECT",
      action: "NOTE_FOLDER_DELETED",
      severity: "WARNING",
      status: "SUCCESS",
      targetType: "NOTE_FOLDER",
      targetId: params.folderId,
      targetName: existingFolder.name,
      summary: `Deleted note folder "${existingFolder.name}"`
    });

    return NextResponse.json({ success: true, folderId: params.folderId });
  } catch (error) {
    return parseError(error);
  }
}
