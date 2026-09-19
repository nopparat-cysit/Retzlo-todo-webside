import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

import { serializeCard } from "@/lib/kanban/serialize-card";

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

  let boardCondition: any = { projectId: params.id };

  if (membership.role !== "OWNER") {
    const accessibleBoards = await prisma.board.findMany({
      where: {
        projectId: params.id,
        OR: [
          { isPrivate: false },
          { members: { some: { userId } } }
        ]
      },
      select: { id: true }
    });
    const accessibleBoardIds = accessibleBoards.map((b) => b.id);
    boardCondition = { id: { in: accessibleBoardIds } };
  }

  const cards = await prisma.card.findMany({
    where: {
      dueDate: { not: null },
      column: {
        board: boardCondition
      }
    },
    include: {
      column: {
        select: {
          name: true,
          boardId: true
        }
      }
    },
    orderBy: [{ dueDate: "asc" }, { position: "asc" }]
  });

  return NextResponse.json(
    { cards: cards.map(serializeCard) },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0"
      }
    }
  );
}
