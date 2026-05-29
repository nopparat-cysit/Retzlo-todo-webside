import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, getProjectIdForBoard, requireUserId } from "@/lib/project-auth";

const reorderColumnsSchema = z.object({
  boardId: z.string().uuid(),
  columnIds: z.array(z.string().uuid()).min(1)
});

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = reorderColumnsSchema.parse(await request.json());
    const projectId = await getProjectIdForBoard(payload.boardId);

    if (!projectId) {
      return jsonError("Board not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    await prisma.$transaction(
      payload.columnIds.map((id, position) =>
        prisma.column.update({
          where: { id, boardId: payload.boardId },
          data: { position }
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
