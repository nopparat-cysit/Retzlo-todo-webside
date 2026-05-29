import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

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

    const payload = inviteSchema.parse(await request.json());
    const email = payload.email.toLowerCase();
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

    return NextResponse.json({
      invitation,
      acceptUrl: `/accept-invitation?token=${token}`
    }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
