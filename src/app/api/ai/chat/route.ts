import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId, assertProjectMember } from "@/lib/project-auth";
import { AI_CREDIT_COSTS, deductUserAiCredit, getUserAiQuota } from "@/lib/ai/credits";
import { chatWithAssistant, AiChatMessage } from "@/lib/ai/engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().trim().min(1, "ข้อความต้องไม่ว่างเปล่า")
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "ต้องมีข้อความอย่างน้อย 1 ข้อความ"),
  projectId: z.string().optional(),
  boardId: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("กรุณาเข้าสู่ระบบก่อนใช้งาน AI Assistant", 401);
    }

    const body = await request.json().catch(() => ({}));
    const payload = chatRequestSchema.parse(body);

    // 1. Quota check
    const quota = await getUserAiQuota(userId);
    if (!quota.unlimited && quota.credits < AI_CREDIT_COSTS.CHAT) {
      return jsonError(
        `โควตา AI Credits ไม่เพียงพอ (คงเหลือ ${quota.credits} เครดิต)`,
        402
      );
    }

    // 2. Fetch project context if available
    let projectContext: string | undefined;
    if (payload.projectId) {
      const membership = await assertProjectMember(payload.projectId, userId);
      if (membership) {
        const project = await prisma.project.findUnique({
          where: { id: payload.projectId },
          select: {
            name: true,
            boards: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        if (project) {
          const cards = await prisma.card.findMany({
            where: {
              column: {
                board: {
                  projectId: payload.projectId
                }
              }
            },
            select: {
              title: true,
              status: true,
              priority: true,
              dueDate: true
            },
            take: 30
          });

          const total = cards.length;
          const todoCount = cards.filter((c) => c.status === "TODO").length;
          const doingCount = cards.filter((c) => c.status === "DOING").length;
          const waitingCount = cards.filter((c) => c.status === "WAITING").length;
          const doneCount = cards.filter((c) => c.status === "DONE").length;
          const sampleCards = cards
            .slice(0, 10)
            .map((c) => `- [${c.status} | ${c.priority}] ${c.title}`)
            .join("\n");

          projectContext = `ชื่อโปรเจกต์: "${project.name}"
ภาพรวมการ์ดงาน (${total} ใบ): TODO: ${todoCount}, กำลังทำ (DOING): ${doingCount}, รอตรวจสอบ (WAITING): ${waitingCount}, เสร็จแล้ว (DONE): ${doneCount}
ตัวอย่างการ์ดในระบบ:
${sampleCards || "ยังไม่มีการ์ดงาน"}`;
        }
      }
    }

    // 3. Client override key & model
    const clientApiKey =
      request.headers.get("x-ai-api-key")?.trim() ||
      request.headers.get("x-deepseek-api-key")?.trim() ||
      undefined;

    const clientModel = request.headers.get("x-ai-model")?.trim() || undefined;

    // 4. Call chat engine
    const reply = await chatWithAssistant({
      messages: payload.messages as AiChatMessage[],
      projectContext,
      apiKey: clientApiKey,
      model: clientModel
    });

    // 5. Deduct 1 credit on success
    const creditResult = await deductUserAiCredit(
      userId,
      AI_CREDIT_COSTS.CHAT,
      "CHAT"
    );

    return NextResponse.json({
      ok: true,
      reply,
      remainingCredits: creditResult.remainingCredits
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("ข้อมูลข้อความไม่ถูกต้อง", 422);
    }
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการประมวลผลแชท";
    return jsonError(message, 500);
  }
}
