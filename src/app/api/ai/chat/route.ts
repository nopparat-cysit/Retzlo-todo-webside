import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { canAccessBoard, requireUserId, assertProjectMember } from "@/lib/project-auth";
import { AI_CREDIT_COSTS, deductUserAiCredit, getUserAiQuota } from "@/lib/ai/credits";
import { chatWithAssistant, AiChatMessage } from "@/lib/ai/engine";
import { extractAiCreateCardProposal } from "@/lib/ai/chat-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().trim().min(1, "ข้อความต้องไม่ว่างเปล่า")
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "ต้องมีข้อความอย่างน้อย 1 ข้อความ"),
  projectId: z.string().min(1).max(191).optional(),
  boardId: z.string().uuid().optional()
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
    let proposalContext: Parameters<typeof extractAiCreateCardProposal>[1] = null;
    if (payload.projectId) {
      const membership = await assertProjectMember(payload.projectId, userId);
      if (!membership) {
        return jsonError("คุณไม่มีสิทธิ์เข้าถึงโปรเจกต์นี้", 403);
      }

      const project = await prisma.project.findUnique({
        where: { id: payload.projectId },
        select: {
          name: true,
          boards: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              name: true,
              isPrivate: true,
              members: { select: { userId: true } },
              columns: {
                orderBy: { position: "asc" },
                select: { id: true, name: true, defaultCardStatus: true }
              }
            }
          }
        }
      });

      if (!project) {
        return jsonError("ไม่พบโปรเจกต์นี้", 404);
      }

      const accessibleBoards = project.boards.filter((board) =>
        canAccessBoard(board, userId, membership.role)
      );
      const savedBoardId = cookies().get(`project_${payload.projectId}_last_board`)?.value;
      const requestedBoardId = payload.boardId || savedBoardId;
      const activeBoard = requestedBoardId
        ? accessibleBoards.find((board) => board.id === requestedBoardId) ??
          (payload.boardId ? undefined : accessibleBoards[0])
        : accessibleBoards[0];

      if (payload.boardId && !activeBoard) {
        return jsonError("คุณไม่มีสิทธิ์เข้าถึงบอร์ดนี้", 403);
      }

      if (!activeBoard) {
        projectContext = `ชื่อโปรเจกต์: "${project.name}"\nไม่มีบอร์ดที่ผู้ใช้เข้าถึงได้ ห้ามส่งข้อเสนอสร้างการ์ด และให้แนะนำผู้ใช้เปิดบอร์ดก่อน`;
      } else {
        const cards = await prisma.card.findMany({
          where: { column: { board: { id: activeBoard.id } } },
          select: {
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            column: { select: { name: true } }
          },
          orderBy: { position: "asc" },
          take: 30
        });
        const todoCount = cards.filter((card) => card.status === "TODO").length;
        const doingCount = cards.filter((card) => card.status === "DOING").length;
        const waitingCount = cards.filter((card) => card.status === "WAITING").length;
        const doneCount = cards.filter((card) => card.status === "DONE").length;
        const sampleCards = cards
          .slice(0, 10)
          .map((card) => `- [${card.column.name} | ${card.status} | ${card.priority}] ${card.title}`)
          .join("\n");

        projectContext = `ชื่อโปรเจกต์: "${project.name}"
บอร์ดปัจจุบัน: "${activeBoard.name}"
คอลัมน์ที่ใช้สร้างการ์ดได้ (ชื่อคอลัมน์ต้องตรงตามรายการ):
${activeBoard.columns.map((column) => `- ${column.name} (สถานะเริ่มต้น ${column.defaultCardStatus})`).join("\n") || "ไม่มีคอลัมน์"}
ภาพรวมการ์ดในบอร์ด (${cards.length} ใบ): TODO: ${todoCount}, กำลังทำ (DOING): ${doingCount}, รอตรวจสอบ (WAITING): ${waitingCount}, เสร็จแล้ว (DONE): ${doneCount}
ตัวอย่างการ์ดในบอร์ด:
${sampleCards || "ยังไม่มีการ์ดงาน"}`;

        proposalContext = {
          projectId: payload.projectId,
          boardId: activeBoard.id,
          boardName: activeBoard.name,
          columns: activeBoard.columns
        };
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

    const chatResult = extractAiCreateCardProposal(reply, proposalContext);

    // 5. Deduct 1 credit on success
    const creditResult = await deductUserAiCredit(
      userId,
      AI_CREDIT_COSTS.CHAT,
      "CHAT"
    );

    return NextResponse.json({
      ok: true,
      reply: chatResult.reply,
      createProposal: chatResult.proposal,
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
