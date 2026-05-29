import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseUpdateNotePayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, getProjectIdForNote, requireUserId } from "@/lib/project-auth";

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

    const payload = parseUpdateNotePayload(await request.json());
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

    return NextResponse.json({ note });
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

    await prisma.note.delete({
      where: { id: params.noteId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
