import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { assertProjectMember, getProjectIdForCard, requireUserId } from "@/lib/project-auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { logBoardActivity } from "@/lib/kanban/activity-logger";

export const dynamic = "force-dynamic";

const linkAttachmentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  url: z.string().trim().url(),
  fileType: z.string().optional()
});

export async function GET(
  _request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const projectId = await getProjectIdForCard(params.cardId);
    if (!projectId) {
      return jsonError("Card not found.", 404);
    }

    const membership = await assertProjectMember(projectId, userId);
    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const attachments = await prisma.cardAttachment.findMany({
      where: { cardId: params.cardId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      attachments: attachments.map((att) => ({
        id: att.id,
        cardId: att.cardId,
        userId: att.userId,
        name: att.name,
        url: att.url,
        size: att.size,
        fileType: att.fileType,
        createdAt: att.createdAt.toISOString(),
        user: att.user
      }))
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const card = await prisma.card.findUnique({
      where: { id: params.cardId },
      include: {
        column: {
          select: {
            id: true,
            boardId: true,
            board: { select: { id: true, projectId: true } }
          }
        }
      }
    });

    if (!card) {
      return jsonError("Card not found.", 404);
    }

    const projectId = card.column.board.projectId;
    const boardId = card.column.board.id;

    const membership = await assertProjectMember(projectId, userId);
    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const contentType = request.headers.get("content-type") || "";

    let name = "";
    let url = "";
    let size: number | null = null;
    let fileType = "link";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file || !(file instanceof Blob)) {
        return jsonError("Valid file is required.", 400);
      }

      name = file.name || "attachment";
      size = file.size;
      fileType = file.type || "file";

      const buffer = await file.arrayBuffer();
      const publicId = `${params.cardId}_${Date.now()}_${randomUUID().slice(0, 8)}`;
      url = await uploadToCloudinary(buffer, "retzlo/card-attachments", publicId);
    } else {
      const body = await request.json();
      const payload = linkAttachmentSchema.parse(body);
      name = payload.name;
      url = payload.url;
      fileType = payload.fileType || "link";
    }

    const attachment = await prisma.cardAttachment.create({
      data: {
        cardId: card.id,
        userId,
        name,
        url,
        size,
        fileType
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    await logBoardActivity({
      boardId,
      userId,
      cardId: card.id,
      action: "ATTACHMENT_ADDED",
      details: {
        cardTitle: card.title,
        attachmentName: name
      }
    });

    await triggerPusherEvent(
      [`retzlo-project-${projectId}`, `retzlo-board-${boardId}`, `retzlo-card-${card.id}`],
      "retzlo:sync",
      {
        action: "ATTACHMENT_ADDED",
        cardId: card.id,
        attachmentId: attachment.id,
        boardId,
        senderId: userId
      }
    );

    return NextResponse.json(
      {
        attachment: {
          id: attachment.id,
          cardId: attachment.cardId,
          userId: attachment.userId,
          name: attachment.name,
          url: attachment.url,
          size: attachment.size,
          fileType: attachment.fileType,
          createdAt: attachment.createdAt.toISOString(),
          user: attachment.user
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return parseError(error);
  }
}
