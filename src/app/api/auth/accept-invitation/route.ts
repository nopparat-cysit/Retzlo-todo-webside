import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

const invitationTokenSchema = z.object({
  token: z.string().min(12)
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return jsonError("Missing invitation token.", 400);
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        project: { select: { id: true, name: true, description: true } },
        inviter: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    if (!invitation) {
      return jsonError("This invitation is invalid or could not be found.", 404);
    }

    const isExpired = invitation.expiresAt < new Date();
    const userId = await requireUserId();
    const currentUser = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, avatar: true }
        })
      : null;

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        token: invitation.token,
        email: invitation.email,
        status: invitation.status,
        isExpired,
        expiresAt: invitation.expiresAt,
        project: invitation.project,
        inviter: invitation.inviter
      },
      currentUser,
      isLoggedIn: Boolean(currentUser),
      isEmailMatch: currentUser ? currentUser.email.toLowerCase() === invitation.email.toLowerCase() : false
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const payload = invitationTokenSchema.parse(await request.json());
    const invitation = await prisma.invitation.findUnique({
      where: { token: payload.token },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
      return jsonError("This invitation is invalid, expired, or has already been used.", 404);
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    });

    if (!invitedUser || !userId) {
      return NextResponse.json({
        accountRequired: true,
        email: invitation.email,
        projectName: invitation.project.name
      });
    }

    if (invitedUser.id !== userId) {
      return jsonError("Please sign in with the invited email address.", 403);
    }

    await prisma.$transaction([
      prisma.projectMember.upsert({
        where: {
          userId_projectId: {
            userId,
            projectId: invitation.projectId
          }
        },
        update: {},
        create: {
          userId,
          projectId: invitation.projectId,
          role: "MEMBER"
        }
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" }
      }),
      prisma.notification.updateMany({
        where: {
          userId,
          projectId: invitation.projectId,
          type: "PROJECT_INVITATION",
          isRead: false
        },
        data: { isRead: true }
      })
    ]);

    await triggerPusherEvent(
      [`retzlo-project-${invitation.projectId}`],
      "retzlo:sync",
      { action: "MEMBER_JOINED", projectId: invitation.projectId, userId, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      actorEmail: invitedUser.email,
      actorName: invitedUser.name,
      actorRole: "MEMBER",
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: "/api/auth/accept-invitation",
      requestMethod: "POST",
      category: "PROJECT",
      action: "INVITATION_ACCEPTED",
      severity: "NOTICE",
      status: "SUCCESS",
      targetType: "PROJECT",
      targetId: invitation.projectId,
      targetName: invitation.project.name,
      summary: `User ${invitedUser.email} accepted invitation to project "${invitation.project.name}".`,
      metadata: { invitationId: invitation.id, projectId: invitation.projectId }
    });

    return NextResponse.json({
      accepted: true,
      projectId: invitation.projectId,
      projectName: invitation.project.name
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Authentication required", 401);
    }

    const payload = invitationTokenSchema.parse(await request.json());
    const [invitation, currentUser] = await Promise.all([
      prisma.invitation.findUnique({
        where: { token: payload.token }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      })
    ]);

    if (!invitation) {
      return jsonError("Invitation not found.", 404);
    }

    if (!currentUser || currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return jsonError("You are not authorized to decline this invitation.", 403);
    }

    await prisma.$transaction([
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "DECLINED" }
      }),
      prisma.notification.updateMany({
        where: {
          userId,
          projectId: invitation.projectId,
          type: "PROJECT_INVITATION",
          isRead: false
        },
        data: { isRead: true }
      })
    ]);

    void createAuditLog({
      actorId: userId,
      actorEmail: currentUser.email,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: "/api/auth/accept-invitation",
      requestMethod: "DELETE",
      category: "PROJECT",
      action: "INVITATION_DECLINED",
      severity: "NOTICE",
      status: "SUCCESS",
      targetType: "PROJECT",
      targetId: invitation.projectId,
      summary: `User ${currentUser.email} declined invitation to project ${invitation.projectId}.`,
      metadata: { invitationId: invitation.id, projectId: invitation.projectId }
    });

    return NextResponse.json({
      declined: true
    });
  } catch (error) {
    return parseError(error);
  }
}
