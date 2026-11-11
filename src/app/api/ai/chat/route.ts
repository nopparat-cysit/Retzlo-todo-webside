import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { canAccessBoard, requireUserId, assertProjectMember } from "@/lib/project-auth";
import { AI_CREDIT_COSTS, deductUserAiCredit, getUserAiQuota } from "@/lib/ai/credits";
import { chatWithAssistant, AiChatMessage } from "@/lib/ai/engine";
import { extractAiCreateCardProposal } from "@/lib/ai/chat-actions";
import {
  checkPublicRateLimit,
  validatePublicInput,
  prunePublicMessageHistory
} from "@/lib/ai/guardrails";

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
  boardId: z.string().uuid().optional(),
  tier: z.enum(["public", "workspace"]).optional()
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = chatRequestSchema.parse(body);

    const clientApiKey =
      request.headers.get("x-ai-api-key")?.trim() ||
      request.headers.get("x-deepseek-api-key")?.trim() ||
      undefined;
    const clientModel = request.headers.get("x-ai-model")?.trim() || undefined;

    const userId = await requireUserId();

    // 1. Unauthenticated Visitor Flow (Strict Public Tier)
    if (!userId) {
      if (payload.tier === "workspace" || payload.projectId) {
        return jsonError("Please sign in before using Workspace AI Assistant", 401);
      }

      const ip = getClientIp(request);
      const rateCheck = checkPublicRateLimit(ip);
      if (!rateCheck.allowed) {
        return jsonError(rateCheck.error || "Rate limit reached", 429);
      }

      const lastUserMsg = [...payload.messages].reverse().find((m) => m.role === "user");
      const contentToValidate = lastUserMsg?.content || payload.messages[payload.messages.length - 1].content;
      const validation = validatePublicInput(contentToValidate);
      if (!validation.isValid) {
        return jsonError(validation.error || "Invalid message content", 400);
      }

      const prunedMessages = prunePublicMessageHistory(payload.messages as AiChatMessage[]);

      const reply = await chatWithAssistant({
        messages: prunedMessages,
        tier: "public",
        apiKey: clientApiKey,
        model: clientModel
      });

      return NextResponse.json({
        ok: true,
        reply,
        tier: "public"
      });
    }

    // 2. Authenticated User without Project (Public Guide with generous limits)
    if (!payload.projectId && payload.tier === "public") {
      const lastUserMsg = [...payload.messages].reverse().find((m) => m.role === "user");
      const contentToValidate = lastUserMsg?.content || payload.messages[payload.messages.length - 1].content;
      const validation = validatePublicInput(contentToValidate, 1200);
      if (!validation.isValid) {
        return jsonError(validation.error || "Invalid message content", 400);
      }

      const prunedMessages = prunePublicMessageHistory(payload.messages as AiChatMessage[], 8);

      const reply = await chatWithAssistant({
        messages: prunedMessages,
        tier: "public",
        apiKey: clientApiKey,
        model: clientModel
      });

      return NextResponse.json({
        ok: true,
        reply,
        tier: "public"
      });
    }

    // 3. Authenticated User with Workspace / Project Context
    if (payload.projectId) {
      const quota = await getUserAiQuota(userId);
      if (!quota.unlimited && quota.credits < AI_CREDIT_COSTS.CHAT) {
        return jsonError(
          `Insufficient AI credits (${quota.credits} remaining)`,
          402
        );
      }

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

      let projectContext: string | undefined;
      let proposalContext: Parameters<typeof extractAiCreateCardProposal>[1] = null;

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

      const reply = await chatWithAssistant({
        messages: payload.messages as AiChatMessage[],
        projectContext,
        tier: "workspace",
        apiKey: clientApiKey,
        model: clientModel
      });

      const chatResult = extractAiCreateCardProposal(reply, proposalContext);

      const creditResult = await deductUserAiCredit(
        userId,
        AI_CREDIT_COSTS.CHAT,
        "CHAT"
      );

      return NextResponse.json({
        ok: true,
        reply: chatResult.reply,
        createProposal: chatResult.proposal,
        remainingCredits: creditResult.remainingCredits,
        tier: "workspace"
      });
    }

    // 4. Default fallback for signed-in users on non-project pages
    const prunedMessages = prunePublicMessageHistory(payload.messages as AiChatMessage[], 8);
    const reply = await chatWithAssistant({
      messages: prunedMessages,
      tier: "public",
      apiKey: clientApiKey,
      model: clientModel
    });

    return NextResponse.json({
      ok: true,
      reply,
      tier: "public"
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
