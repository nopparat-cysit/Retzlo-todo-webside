import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertOfficeProjectAccess } from "@/lib/office/data";
import { createOfficeKnowledgeSchema } from "@/lib/office/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Please sign in to continue.", 401);
    const membership = await assertOfficeProjectAccess(params.projectId, userId);
    if (!membership) return jsonError("You do not have access to this project.", 403);
    const payload = createOfficeKnowledgeSchema.parse(await request.json());
    const agent = await prisma.officeAgent.findFirst({ where: { id: payload.agentId, projectId: params.projectId } });
    if (!agent) return jsonError("Office agent not found.", 404);

    if (payload.kind === "DIARY") {
      const diaryEntry = await prisma.officeAgentDiaryEntry.create({
        data: { projectId: params.projectId, agentId: payload.agentId, threadId: payload.threadId, taskId: payload.taskId, entryDate: new Date(), content: payload.content, tags: payload.tags ?? [] },
        include: { agent: { select: { id: true, name: true, key: true } } }
      });
      return NextResponse.json({ diaryEntry }, { status: 201 });
    }

    if (payload.kind === "MEMORY") {
      const memory = await prisma.officeAgentMemory.create({
        data: { projectId: params.projectId, agentId: payload.agentId, kind: "PREFERENCE", title: payload.title, content: payload.content, approvedAt: new Date() },
        include: { agent: { select: { id: true, name: true, key: true } } }
      });
      return NextResponse.json({ memory }, { status: 201 });
    }

    const skill = await prisma.officeAgentSkill.create({
      data: { agentId: payload.agentId, name: payload.name, description: payload.description, trigger: payload.trigger, content: payload.content, approvedAt: new Date() }
    });
    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}