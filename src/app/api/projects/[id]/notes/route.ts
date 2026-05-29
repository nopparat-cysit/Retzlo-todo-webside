import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseCreateNotePayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const membership = await assertProjectMember(params.id, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  const notes = await prisma.note.findMany({
    where: { projectId: params.id },
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

  return NextResponse.json({ notes });
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
    const note = await prisma.note.create({
      data: {
        title: payload.title,
        content: payload.content,
        color: payload.color,
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

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
