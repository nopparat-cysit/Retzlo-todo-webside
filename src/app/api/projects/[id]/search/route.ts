import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);
    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ cards: [], notes: [], boards: [] });
    }

    // Boards accessible to user
    const accessibleBoards = await prisma.board.findMany({
      where: {
        projectId: params.id,
        ...(membership.role !== "OWNER"
          ? {
              OR: [
                { isPrivate: false },
                { members: { some: { userId } } }
              ]
            }
          : {})
      },
      select: {
        id: true,
        name: true,
        isPrivate: true
      }
    });

    const accessibleBoardIds = accessibleBoards.map((b) => b.id);

    // 1. Search Cards
    const cards = await prisma.card.findMany({
      where: {
        column: {
          boardId: { in: accessibleBoardIds }
        },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        column: {
          select: {
            name: true,
            boardId: true,
            board: {
              select: { name: true }
            }
          }
        }
      },
      take: 8
    });

    // 2. Search Notes
    const notes = await prisma.note.findMany({
      where: {
        projectId: params.id,
        OR: [
          { authorId: userId },
          {
            isHidden: false,
            OR: [
              { boardId: null },
              { boardId: { in: accessibleBoardIds } }
            ]
          }
        ],
        AND: [
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        color: true,
        boardId: true
      },
      take: 6
    });

    // 3. Search Boards
    const matchingBoards = accessibleBoards.filter((b) =>
      b.name.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      cards,
      notes,
      boards: matchingBoards
    });
  } catch (error) {
    return parseError(error);
  }
}
