import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const membership = await assertProjectMember(params.id, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  const members = projectMembers.map((pm) => ({
    id: pm.user.id,
    name: pm.user.name,
    email: pm.user.email,
    avatar: pm.user.avatar,
    role: pm.role
  }));

  return NextResponse.json({ members });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);
    if (!membership || membership.role !== "OWNER") {
      return jsonError("Only workspace owners can remove members.", 403);
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) {
      return jsonError("Missing memberId parameter.", 400);
    }

    const targetMember = await prisma.projectMember.findUnique({
      where: { id: memberId }
    });

    if (!targetMember || targetMember.projectId !== params.id) {
      return jsonError("Member not found in this project.", 404);
    }

    if (targetMember.userId === userId) {
      return jsonError("You cannot remove yourself from your own project.", 400);
    }

    await prisma.projectMember.delete({
      where: { id: memberId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError("Failed to remove member.", 500);
  }
}
