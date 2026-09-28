import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { AI_CREDIT_COSTS, deductUserAiCredit, getUserAiQuota } from "@/lib/ai/credits";
import { generateProjectSummary } from "@/lib/ai/deepseek";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const summarySchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  boardId: z.string().uuid("Invalid board ID").optional()
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("กรุณาเข้าสู่ระบบก่อนใช้งาน AI Assistant", 401);
    }

    const body = await request.json().catch(() => ({}));
    const payload = summarySchema.parse(body);

    const membership = await assertProjectMember(payload.projectId, userId);
    if (!membership) {
      return jsonError("คุณไม่มีสิทธิ์เข้าถึงโปรเจกต์นี้", 403);
    }

    const project = await prisma.project.findUnique({
      where: { id: payload.projectId },
      select: { id: true, name: true }
    });

    if (!project) {
      return jsonError("ไม่พบโปรเจกต์ที่ระบุ", 404);
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
      return jsonError(`โควตา AI Credits ไม่เพียงพอ (คงเหลือ ${quota.credits} เครดิต)`, 402);
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

    // 3. Call DeepSeek
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
      doneCards: doneCards.map((c) => ({ title: c.title }))
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
    return parseError(error);
  }
}
