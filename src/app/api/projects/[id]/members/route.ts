import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

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

    await triggerPusherEvent(
      [`retzlo-project-${params.id}`],
      "retzlo:sync",
      { action: "MEMBER_REMOVED", projectId: params.id, memberId, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/projects/${params.id}/members`,
      requestMethod: "DELETE",
      category: "PROJECT",
      action: "PROJECT_MEMBER_REMOVED",
      severity: "WARNING",
      status: "SUCCESS",
      targetType: "USER",
      targetId: targetMember.userId,
      summary: `Removed member ${targetMember.userId} from project ${params.id}.`,
      metadata: { projectId: params.id, memberId, removedUserId: targetMember.userId }
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

    await triggerPusherEvent(
      [`retzlo-project-${params.id}`],
      "retzlo:sync",
      { action: "MEMBER_ROLE_UPDATED", projectId: params.id, memberId, role, senderId: userId }
    );

    void createAuditLog({
      actorId: userId,
      actorRole: membership.role,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || null,
      requestPath: `/api/projects/${params.id}/members`,
      requestMethod: "PATCH",
      category: "PROJECT",
      action: "PROJECT_MEMBER_ROLE_UPDATED",
      severity: "NOTICE",
      status: "SUCCESS",
      targetType: "USER",
      targetId: updated.user.id,
      targetName: updated.user.email,
      summary: `Updated role for member ${updated.user.email} in project ${params.id} from ${targetMember.role} to ${role}.`,
      beforeState: { role: targetMember.role },
      afterState: { role },
      metadata: { projectId: params.id, memberId, userId: updated.user.id, previousRole: targetMember.role, newRole: role }
    });

    return NextResponse.json({ ok: true, member: updated });
  } catch (error) {
    return jsonError("Failed to update member role.", 500);
  }
}

