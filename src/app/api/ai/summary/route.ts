import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { AI_CREDIT_COSTS, deductUserAiCredit, getUserAiQuota } from "@/lib/ai/credits";
import { generateProjectSummary } from "@/lib/ai/engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const summarySchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  boardId: z.string().uuid("Invalid board ID").optional()
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in before using AI Assistant", 401);
    }

    const body = await request.json().catch(() => ({}));
    const payload = summarySchema.parse(body);

    const membership = await assertProjectMember(payload.projectId, userId);
    if (!membership) {
      return jsonError("You do not have permission to access this project", 403);
    }

    const project = await prisma.project.findUnique({
      where: { id: payload.projectId },
      select: { id: true, name: true }
    });

    if (!project) {
      return jsonError("Specified project not found", 404);
    }

    let boardName = "Overview";
    if (payload.boardId) {
      const board = await prisma.board.findUnique({
        where: { id: payload.boardId },
        select: { name: true }
      });
      if (board) boardName = board.name;
    }

    // 1. Verify quota before expensive AI analysis
    const quota = await getUserAiQuota(userId);
    if (!quota.unlimited && quota.credits < AI_CREDIT_COSTS.SUMMARY) {
      return jsonError(`Insufficient AI credits (${quota.credits} remaining)`, 402);
    }

    // 2. Fetch cards snapshot
    const cards = await prisma.card.findMany({
      where: {
        column: payload.boardId
          ? { boardId: payload.boardId }
          : { board: { projectId: payload.projectId } }
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true
      }
    });

    const now = new Date();
    const todoCount = cards.filter((c) => c.status === "TODO").length;
    const doingCards = cards.filter((c) => c.status === "DOING");
    const waitingCount = cards.filter((c) => c.status === "WAITING").length;
    const doneCards = cards.filter((c) => c.status === "DONE");

    const overdueCards = cards
      .filter((c) => c.dueDate && new Date(c.dueDate) < now && c.status !== "DONE")
      .map((c) => ({
        title: c.title,
        priority: c.priority,
        dueDate: c.dueDate ? new Date(c.dueDate).toLocaleDateString() : null
      }));

    const clientApiKey =
      request.headers.get("x-ai-api-key")?.trim() ||
      request.headers.get("x-deepseek-api-key")?.trim() ||
      undefined;

    const clientModel = request.headers.get("x-ai-model")?.trim() || undefined;

    // 3. Call AI Engine
    const summary = await generateProjectSummary({
      projectName: project.name,
      boardName,
      totalCards: cards.length,
      todoCount,
      doingCount: doingCards.length,
      waitingCount,
      doneCount: doneCards.length,
      inProgressCards: doingCards.map((c) => ({ title: c.title, priority: c.priority })),
      overdueCards,
      doneCards: doneCards.map((c) => ({ title: c.title })),
      apiKey: clientApiKey,
      model: clientModel
    });

    // 4. Deduct credit on successful generation
    const creditResult = await deductUserAiCredit(
      userId,
      AI_CREDIT_COSTS.SUMMARY,
      "SUMMARY"
    );

    return NextResponse.json({
      ok: true,
      summary,
      remainingCredits: creditResult.remainingCredits
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Invalid request data", 422);
    }
    const message =
      error instanceof Error ? error.message : "Error generating AI project summary";
    return jsonError(message, 500);
  }
}
