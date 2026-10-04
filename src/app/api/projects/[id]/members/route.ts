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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);
    if (!membership || membership.role !== "OWNER") {
      return jsonError("Only workspace owners can change member roles.", 403);
    }

    const body = await request.json().catch(() => ({}));
    const { memberId, role } = body as { memberId?: string; role?: string };
    if (!memberId || !role || !["OWNER", "MEMBER"].includes(role)) {
      return jsonError("Invalid memberId or role.", 400);
    }

    const targetMember = await prisma.projectMember.findUnique({
      where: { id: memberId }
    });

    if (!targetMember || targetMember.projectId !== params.id) {
      return jsonError("Member not found in this project.", 404);
    }

    // If demoting from OWNER to MEMBER, ensure there is at least one other OWNER
    if (targetMember.role === "OWNER" && role === "MEMBER") {
      const ownerCount = await prisma.projectMember.count({
        where: { projectId: params.id, role: "OWNER" }
      });
      if (ownerCount <= 1) {
        return jsonError("Cannot demote the only workspace owner. Assign another owner first.", 400);
      }
    }

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role },
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

    return NextResponse.json({ ok: true, member: updated });
  } catch (error) {
    return jsonError("Failed to update member role.", 500);
  }
}

