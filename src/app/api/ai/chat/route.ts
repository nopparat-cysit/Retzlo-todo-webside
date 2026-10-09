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
  content: z.string().trim().min(1, "Message content must not be empty")
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
  projectId: z.string().min(1).max(191).optional(),
  boardId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in before using AI Assistant", 401);
    }

    const body = await request.json().catch(() => ({}));
    const payload = chatRequestSchema.parse(body);

    // 1. Quota check
    const quota = await getUserAiQuota(userId);
    if (!quota.unlimited && quota.credits < AI_CREDIT_COSTS.CHAT) {
      return jsonError(
        `Insufficient AI credits (${quota.credits} remaining)`,
        402
      );
    }

    // 2. Fetch project context if available
    let projectContext: string | undefined;
    let proposalContext: Parameters<typeof extractAiCreateCardProposal>[1] = null;
    if (payload.projectId) {
      const membership = await assertProjectMember(payload.projectId, userId);
      if (!membership) {
        return jsonError("You do not have permission to access this project", 403);
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
        return jsonError("Project not found", 404);
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
        return jsonError("You do not have permission to access this board", 403);
      }

      if (!activeBoard) {
        projectContext = `Project Name: "${project.name}"\nNo boards accessible to the user. Do not propose creating cards, and recommend opening a board first.`;
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

        projectContext = `Project Name: "${project.name}"
Current Board: "${activeBoard.name}"
Available columns for creating cards (exact column names):
${activeBoard.columns.map((column) => `- ${column.name} (default status: ${column.defaultCardStatus})`).join("\n") || "No columns"}
Board cards overview (${cards.length} cards): TODO: ${todoCount}, DOING: ${doingCount}, WAITING: ${waitingCount}, DONE: ${doneCount}
Sample cards on the board:
${sampleCards || "No cards created yet"}`;

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
      return jsonError("Invalid message payload", 422);
    }
    const message =
      error instanceof Error ? error.message : "Error processing AI chat";
    return jsonError(message, 500);
  }
}
