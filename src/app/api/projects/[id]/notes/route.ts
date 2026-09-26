import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseCreateNotePayload } from "@/lib/notes/validation";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canToggleHiddenItem, isOwnerRole, requireUserId } from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import { triggerPusherEvent } from "@/lib/pusher/server";

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
    projectId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: { name: string | null; email: string };
    board?: { id: string; name: string } | null;
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
    boardId: note.boardId ?? null,
    board: note.board ? { id: note.board.id, name: note.board.name } : null,
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

  const { searchParams } = new URL(request.url);
  const boardIdFilter = searchParams.get("boardId");

  const isOwner = isOwnerRole(membership.role);

  // User visibility filter:
  // - Owners see all project notes (optionally filtered by boardId)
  // - Regular members see:
  //   1) Their own notes (whether hidden or not)
  //   2) Public notes where:
  //      - boardId is null (general team notes), OR
  //      - board is public, OR
  //      - member has access to the board
  const includeGeneral = searchParams.get("includeGeneral") === "true";
  const conditions: any[] = [{ projectId: params.id }];

  if (boardIdFilter) {
    if (boardIdFilter === "null" || boardIdFilter === "none") {
      conditions.push({ boardId: null });
    } else if (includeGeneral) {
      conditions.push({
        OR: [{ boardId: boardIdFilter }, { boardId: null }]
      });
    } else {
      conditions.push({ boardId: boardIdFilter });
    }
  }

  if (!isOwner) {
    conditions.push({
      OR: [
        { authorId: userId },
        {
          isHidden: false,
          OR: [
            { boardId: null },
            { board: { isPrivate: false } },
            { board: { members: { some: { userId } } } }
          ]
        }
      ]
    });
  }

  const whereClause = conditions.length === 1 ? conditions[0] : { AND: conditions };

  const notes = await prisma.note.findMany({
    where: whereClause,
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

  return NextResponse.json(
    {
      notes: notes.map((note) =>
        toNoteResponse(note, {
          membership,
          userId,
          allowMemberPrivateItems: project.allowMemberPrivateItems
        })
      )
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0"
      }
    }
  );
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
        boardId: payload.boardId ?? null,
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
        },
        board: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    triggerPusherEvent(
      [`retzlo-notes-${params.id}`, `retzlo-project-${params.id}`],
      "retzlo:sync",
      { action: "NOTE_CREATED", noteId: note.id, senderId: userId }
    );

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
