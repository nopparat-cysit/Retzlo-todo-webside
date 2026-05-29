import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const acceptInvitationSchema = z.object({
  token: z.string().min(12)
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const payload = acceptInvitationSchema.parse(await request.json());
    const invitation = await prisma.invitation.findUnique({
      where: { token: payload.token },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
      return jsonError("This invitation is invalid or expired.", 404);
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
      return jsonError("Please sign in with the invited email.", 403);
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
      })
    ]);

    return NextResponse.json({
      accepted: true,
      projectId: invitation.projectId
    });
  } catch (error) {
    return parseError(error);
  }
}
