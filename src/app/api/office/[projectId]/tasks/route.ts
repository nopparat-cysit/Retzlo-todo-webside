import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertOfficeProjectAccess } from "@/lib/office/data";
import { createOfficeTaskSchema } from "@/lib/office/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Please sign in to continue.", 401);
    const membership = await assertOfficeProjectAccess(params.projectId, userId);
    if (!membership) return jsonError("You do not have access to this project.", 403);
    const payload = createOfficeTaskSchema.parse(await request.json());
    const agent = await prisma.officeAgent.findFirst({ where: { id: payload.agentId, projectId: params.projectId } });
    if (!agent) return jsonError("Office agent not found.", 404);

    const task = await prisma.officeTask.create({
      data: { projectId: params.projectId, agentId: payload.agentId, threadId: payload.threadId, title: payload.title, description: payload.description, status: payload.status, createdById: userId },
      include: { agent: { select: { id: true, name: true, key: true } } }
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}