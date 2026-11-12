import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canAccessBoard, requireUserId } from "@/lib/project-auth";
import { extractAssigneeIds } from "@/lib/kanban/assignees";
import { triggerPusherEvent } from "@/lib/pusher/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const chatAttachmentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  size: z.number().optional(),
  type: z.string().optional(),
  isImage: z.boolean().optional()
});

const createCommentSchema = z
  .object({
    content: z
      .string()
      .trim()
      .max(2000, "Comment is too long (max 2000 characters).")
      .optional()
      .default(""),
    attachments: z.array(chatAttachmentSchema).optional()
  })
  .refine(
    (data) => (data.content && data.content.length > 0) || (data.attachments && data.attachments.length > 0),
    {
      message: "Comment must have either content or attachments."
    }
  );

async function getCardWithAccess(cardId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: {
          board: {
            include: {
              members: { select: { userId: true } }
            }
          }
        }
      }
    }
  });

  if (!card) {
    return { ok: false as const, error: "Card not found.", status: 404 };
  }

  const projectId = card.column.board.projectId;
  const membership = await assertProjectMember(projectId, userId);

  if (!membership) {
    return { ok: false as const, error: "You do not have access to this project.", status: 403 };
  }

  if (!canAccessBoard(card.column.board, userId, membership.role)) {
    return { ok: false as const, error: "You do not have access to this board.", status: 403 };
  }

  return { ok: true as const, card, membership, projectId };
}

export async function GET(_request: Request, { params }: { params: { cardId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const access = await getCardWithAccess(params.cardId, userId);
    if (!access.ok) {
      return jsonError(access.error, access.status);
    }

    const comments = await prisma.cardComment.findMany({
      where: { cardId: params.cardId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request, { params }: { params: { cardId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const access = await getCardWithAccess(params.cardId, userId);
    if (!access.ok) {
      return jsonError(access.error, access.status);
    }

    const payload = createCommentSchema.parse(await request.json());

    const metadata =
      payload.attachments && payload.attachments.length > 0
        ? { attachments: payload.attachments }
        : undefined;

    const comment = await prisma.cardComment.create({
      data: {
        cardId: params.cardId,
        authorId: userId,
        content: payload.content,
        type: "COMMENT",
        ...(metadata ? { metadata } : {})
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    const assigneeIds = extractAssigneeIds(access.card.privateCoins);
    const authorName = comment.author.name || comment.author.email || "Teammate";
    const notificationRecipients = assigneeIds.filter((id) => id !== userId);

    if (notificationRecipients.length > 0) {
      try {
        const notifContent = payload.content.trim()
          ? payload.content.slice(0, 120)
          : payload.attachments && payload.attachments.length > 0
            ? `Attached ${payload.attachments.length} file(s)`
            : "New message";

        await prisma.notification.createMany({
          data: notificationRecipients.map((recipientId) => ({
            id: randomUUID(),
            userId: recipientId,
            projectId: access.projectId,
            cardId: params.cardId,
            type: "CARD_COMMENT",
            title: `New message on "${access.card.title}"`,
            message: `${authorName}: ${notifContent}`,
            link: `/project/${access.projectId}/board?cardId=${params.cardId}`
          }))
        });

        triggerPusherEvent(
          ["retzlo-notifications"],
          "retzlo:sync",
          { action: "NEW_NOTIFICATION" }
        );
      } catch (notifError) {
        console.error("Failed to deliver comment notification:", notifError);
      }
    }

    triggerPusherEvent(
      [`retzlo-card-${params.cardId}-comments`, `retzlo-project-${access.projectId}`],
      "retzlo:sync",
      { action: "COMMENT_CREATED", cardId: params.cardId, senderId: userId }
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
