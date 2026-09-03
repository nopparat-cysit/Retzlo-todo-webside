import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { buildMockAssistantReply } from "@/lib/office/constants";
import { assertOfficeProjectAccess } from "@/lib/office/data";
import { createOfficeMessageSchema } from "@/lib/office/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

function titleFromMessage(content: string) {
  return content.trim().slice(0, 72) || "New Office thread";
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Please sign in to continue.", 401);
    const membership = await assertOfficeProjectAccess(params.projectId, userId);
    if (!membership) return jsonError("You do not have access to this project.", 403);

    const payload = createOfficeMessageSchema.parse(await request.json());
    const agent = await prisma.officeAgent.findFirst({ where: { id: payload.agentId, projectId: params.projectId } });
    if (!agent) return jsonError("Office agent not found.", 404);

    const result = await prisma.$transaction(async (tx) => {
      const thread = payload.threadId
        ? await tx.officeThread.findFirst({ where: { id: payload.threadId, projectId: params.projectId, agentId: payload.agentId } })
        : await tx.officeThread.create({ data: { projectId: params.projectId, agentId: payload.agentId, title: titleFromMessage(payload.content) } });

      if (!thread) throw new Error("Thread not found.");

      const userMessage = await tx.officeMessage.create({
        data: { projectId: params.projectId, threadId: thread.id, agentId: payload.agentId, authorType: "USER", authorId: userId, content: payload.content }
      });
      const assistantMessage = await tx.officeMessage.create({
        data: { projectId: params.projectId, threadId: thread.id, agentId: payload.agentId, authorType: "AGENT", content: buildMockAssistantReply(agent.name, payload.content) }
      });
      await tx.officeThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

      return { thread, messages: [userMessage, assistantMessage] };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Thread not found.") return jsonError("Thread not found.", 404);
    return parseError(error);
  }
}