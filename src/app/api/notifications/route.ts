import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { canAccessBoard, requireUserId } from "@/lib/project-auth";
import { extractAssigneeIds } from "@/lib/kanban/assignees";

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  all: z.boolean().default(false),
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    // Check approaching or overdue tasks assigned to this user
    try {
      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const past48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const candidateCards = await prisma.card.findMany({
        where: {
          dueDate: { gte: past48h, lte: next24h },
          status: { not: "DONE" }
        },
        include: {
          column: {
            include: {
              board: {
                select: {
                  projectId: true,
                  isPrivate: true,
                  members: { select: { userId: true } }
                }
              }
            }
          }
        },
        take: 30
      });

      for (const card of candidateCards) {
        const assignees = extractAssigneeIds(card.privateCoins);
        if (!assignees.includes(userId)) continue;
        if (!canAccessBoard(card.column.board, userId)) continue;

        // Check if an alert was already issued in the last 24h for this card
        const existingAlert = await prisma.notification.findFirst({
          where: {
            userId,
            cardId: card.id,
            type: "DUE_DATE_ALERT",
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        });

        if (!existingAlert) {
          const isOverdue = card.dueDate! < now;
          await prisma.notification.create({
            data: {
              userId,
              projectId: card.column.board.projectId,
              cardId: card.id,
              type: "DUE_DATE_ALERT",
              title: isOverdue ? "⚠️ Task Overdue" : "⏰ Task Due Soon",
              message: isOverdue
                ? `Card "${card.title}" is overdue!`
                : `Card "${card.title}" is due within 24 hours!`,
              link: `/project/${card.column.board.projectId}/board?cardId=${card.id}`
            }
          });
        }
      }
    } catch {
      // Due alert background generation should not block notifications query
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Enrich PROJECT_INVITATION notifications with live invitation data
    const inviteProjectIds = notifications
      .filter((n) => n.type === "PROJECT_INVITATION" && n.projectId)
      .map((n) => n.projectId as string);

    const pendingInvites =
      user && inviteProjectIds.length > 0
        ? await prisma.invitation.findMany({
            where: {
              projectId: { in: inviteProjectIds },
              email: user.email,
              status: "PENDING",
              expiresAt: { gt: new Date() }
            },
            include: {
              project: { select: { id: true, name: true, description: true } },
              inviter: { select: { name: true, email: true, avatar: true } }
            }
          })
        : [];

    const enrichedNotifications = notifications.map((n) => {
      if (n.type === "PROJECT_INVITATION" && n.projectId) {
        const matchingInvite = pendingInvites.find((inv) => inv.projectId === n.projectId);
        return {
          ...n,
          invitation: matchingInvite
            ? {
                token: matchingInvite.token,
                projectName: matchingInvite.project.name,
                projectId: matchingInvite.project.id,
                projectDescription: matchingInvite.project.description,
                inviterName: matchingInvite.inviter.name,
                inviterEmail: matchingInvite.inviter.email,
                inviterAvatar: matchingInvite.inviter.avatar,
                status: matchingInvite.status
              }
            : null
        };
      }
      return n;
    });

    return NextResponse.json(
      { notifications: enrichedNotifications },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0"
        }
      }
    );
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = markReadSchema.parse(await request.json());

    if (payload.all) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (payload.notificationId) {
      await prisma.notification.updateMany({
        where: { id: payload.notificationId, userId },
        data: { isRead: true },
      });
    } else {
      return jsonError("Either notificationId or all: true must be provided.", 400);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
