import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  all: z.boolean().default(false),
});

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

    return NextResponse.json({ notifications: enrichedNotifications });
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
