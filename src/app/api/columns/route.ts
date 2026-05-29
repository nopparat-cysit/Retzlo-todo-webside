import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, getProjectIdForBoard, requireUserId } from "@/lib/project-auth";

const createColumnSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().trim().min(1).max(80)
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createColumnSchema.parse(await request.json());
    const projectId = await getProjectIdForBoard(payload.boardId);

    if (!projectId) {
      return jsonError("Board not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const position = await prisma.column.count({
      where: { boardId: payload.boardId }
    });
    const column = await prisma.column.create({
      data: {
        boardId: payload.boardId,
        name: payload.name,
        position
      },
      include: { cards: true }
    });

    return NextResponse.json({ column }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
