import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, isOwnerRole, requireUserId } from "@/lib/project-auth";

const createBoardSchema = z.object({
  name: z.string().trim().min(1, "Board name is required").max(80, "Board name is too long"),
  isPrivate: z.boolean().optional().default(false),
  memberUserIds: z.array(z.string()).optional().default([])
});

const defaultColumns = [
  { name: "Backlog", defaultCardStatus: "TODO", color: "default", icon: "kanban" },
  { name: "In Progress", defaultCardStatus: "DOING", color: "lavender", icon: "sparkles" },
  { name: "Done", defaultCardStatus: "DONE", color: "amber", icon: "check-circle" }
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const membership = await assertProjectMember(params.id, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  const isOwner = isOwnerRole(membership.role);

  const boards = await prisma.board.findMany({
    where: isOwner
      ? { projectId: params.id }
      : {
          projectId: params.id,
          OR: [{ isPrivate: false }, { members: { some: { userId } } }]
        },
    orderBy: { createdAt: "asc" },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      },
      columns: {
        select: {
          id: true,
          _count: {
            select: { cards: true }
          }
        }
      }
    }
  });

  const formattedBoards = boards.map((b) => {
    const cardCount = b.columns.reduce((sum, col) => sum + col._count.cards, 0);
    return {
      id: b.id,
      name: b.name,
      projectId: b.projectId,
      isPrivate: b.isPrivate,
      createdAt: b.createdAt.toISOString(),
      memberUserIds: b.members.map((m) => m.userId),
      members: b.members.map((m) => ({
        userId: m.userId,
        user: m.user
      })),
      cardCount
    };
  });

  return NextResponse.json({ boards: formattedBoards });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const membership = await assertProjectMember(params.id, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  if (!isOwnerRole(membership.role)) {
    return jsonError("Only project owners and admins can create sub-projects/boards.", 403);
  }

  try {
    const body = await request.json();
    const payload = createBoardSchema.parse(body);

    const uniqueUserIds = Array.from(
      new Set(payload.isPrivate ? [...payload.memberUserIds, userId] : payload.memberUserIds)
    );

    const board = await prisma.board.create({
      data: {
        name: payload.name,
        projectId: params.id,
        isPrivate: payload.isPrivate,
        columns: {
          create: defaultColumns.map((col, position) => ({
            name: col.name,
            defaultCardStatus: col.defaultCardStatus,
            color: col.color,
            icon: col.icon,
            position
          }))
        },
        members: payload.isPrivate
          ? {
              create: uniqueUserIds.map((uid) => ({
                userId: uid
              }))
            }
          : undefined
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(
      {
        board: {
          id: board.id,
          name: board.name,
          projectId: board.projectId,
          isPrivate: board.isPrivate,
          createdAt: board.createdAt.toISOString(),
          memberUserIds: board.members.map((m) => m.userId),
          members: board.members.map((m) => ({
            userId: m.userId,
            user: m.user
          })),
          cardCount: 0
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return parseError(error);
  }
}
