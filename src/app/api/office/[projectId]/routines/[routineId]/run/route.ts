import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertOfficeProjectAccess } from "@/lib/office/data";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function POST(_request: Request, { params }: { params: { projectId: string; routineId: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Please sign in to continue.", 401);
    const membership = await assertOfficeProjectAccess(params.projectId, userId);
    if (!membership) return jsonError("You do not have access to this project.", 403);

    const routine = await prisma.officeRoutine.findFirst({
      where: { id: params.routineId, projectId: params.projectId },
      include: { agent: { select: { id: true, name: true, key: true } } }
    });
    if (!routine) return jsonError("Routine not found.", 404);

    const report = await prisma.$transaction(async (tx) => {
      await tx.officeRoutine.update({ where: { id: routine.id }, data: { lastRunAt: new Date() } });
      return tx.officeReport.create({
        data: {
          projectId: params.projectId,
          agentId: routine.agentId,
          title: `${routine.title} run`,
          summary: `Manual run completed for ${routine.title}.`,
          content: `# ${routine.title}\n\nPrompt\n${routine.prompt}\n\nResult\nThis V1 routine run created a report inside Office. External tools and background automation are intentionally disabled.`
        },
        include: { agent: { select: { id: true, name: true, key: true } } }
      });
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}