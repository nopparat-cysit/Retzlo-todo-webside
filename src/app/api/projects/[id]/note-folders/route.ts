import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseCreateNoteFolderPayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const folders = await prisma.noteFolder.findMany({
      where: { projectId: params.id },
      include: {
        _count: {
          select: { notes: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(
      { folders },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0"
        }
      }
    );
  } catch (error) {
    return parseError(error);
  }
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

    const payload = parseCreateNoteFolderPayload(await request.json());

    const folder = await prisma.noteFolder.create({
      data: {
        name: payload.name,
        color: payload.color ?? "DEFAULT",
        icon: payload.icon ?? "📁",
        projectId: params.id,
        authorId: userId
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    triggerPusherEvent(
      [`retzlo-notes-${params.id}`, `retzlo-project-${params.id}`],
      "retzlo:sync",
      { action: "NOTE_FOLDER_CREATED", folderId: folder.id, senderId: userId }
    );

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
