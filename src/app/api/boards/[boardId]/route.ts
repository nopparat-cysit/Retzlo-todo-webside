import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, getProjectIdForBoard, requireUserId } from "@/lib/project-auth";

export async function GET(_request: Request, { params }: { params: { boardId: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const projectId = await getProjectIdForBoard(params.boardId);

  if (!projectId) {
    return jsonError("Board not found.", 404);
  }

  const membership = await assertProjectMember(projectId, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  return NextResponse.json({ board });
}
