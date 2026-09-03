import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { assertOfficeProjectAccess } from "@/lib/office/data";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const updateRoutineSchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request, { params }: { params: { projectId: string; routineId: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Please sign in to continue.", 401);
    const membership = await assertOfficeProjectAccess(params.projectId, userId);
    if (!membership) return jsonError("You do not have access to this project.", 403);
    const payload = updateRoutineSchema.parse(await request.json());

    const routine = await prisma.officeRoutine.update({
      where: { id: params.routineId, projectId: params.projectId },
      data: { enabled: payload.enabled },
      include: { agent: { select: { id: true, name: true, key: true } } }
    });

    return NextResponse.json({ routine });
  } catch (error) {
    return parseError(error);
  }
}