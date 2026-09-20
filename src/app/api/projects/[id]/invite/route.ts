import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { sendProjectInvitationEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";

const inviteSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    const inviteLimit = checkRateLimit(`invite-user:${userId}`, { max: 10, windowMs: 10 * 60 * 1000 });
    if (!inviteLimit.success) {
      return jsonError(`Too many invitation requests. Please wait ${inviteLimit.reset} seconds before sending more.`, 429);
    }

    const payload = inviteSchema.parse(await request.json());
    const email = payload.email.trim().toLowerCase();

    // Check if the user is already an active member of this project
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: params.id,
        user: { email }
      }
    });

    if (existingMember) {
      return jsonError("This user is already a member of this project.", 400);
    }

    const [project, inviter] = await Promise.all([
      prisma.project.findUnique({
        where: { id: params.id },
        select: { name: true }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      })
    ]);

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await prisma.invitation.create({
      data: {
        email,
        projectId: params.id,
        token,
        expiresAt,
        invitedBy: userId
      }
    });

    // If the invited email belongs to an existing registered user, create an in-app notification
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (targetUser) {
      const inviterLabel = inviter?.name || inviter?.email || "เพื่อนร่วมทีม";
      const projectName = project?.name || "Workspace";

      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          projectId: params.id,
          type: "PROJECT_INVITATION",
          title: "คำเชิญเข้าร่วมโปรเจกต์",
          message: `${inviterLabel} ได้เชิญคุณเข้าร่วมโปรเจกต์ "${projectName}"`
        }
      });
    }

    // Build absolute URL for the email
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const acceptPath = `/accept-invitation?token=${token}`;
    const fullAcceptUrl = `${origin}${acceptPath}`;

    // Send email notification (gracefully handle if SMTP is not configured)
    try {
      await sendProjectInvitationEmail({
        email,
        inviterName: inviter?.name || inviter?.email || "เพื่อนร่วมทีม",
        projectName: project?.name || "Workspace",
        acceptUrl: fullAcceptUrl
      });
    } catch (mailError) {
      console.warn("[MAIL] Could not send invitation email:", mailError);
    }

    return NextResponse.json(
      {
        invitation,
        acceptUrl: acceptPath,
        fullAcceptUrl
      },
      { status: 201 }
    );
  } catch (error) {
    return parseError(error);
  }
}
