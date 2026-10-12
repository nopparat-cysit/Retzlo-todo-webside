import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/admin-system-state";
import { createAuditLog } from "@/lib/audit/audit-logger";

export const dynamic = "force-dynamic";

const patchProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  transferOwnerId: z.string().optional()
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                globalRole: true,
                status: true
              }
            }
          }
        },
        boards: {
          include: {
            columns: {
              select: {
                id: true,
                name: true,
                _count: { select: { cards: true } }
              }
            },
            _count: { select: { members: true } }
          }
        },
        _count: {
          select: {
            notes: true,
            diaryItems: true,
            invitations: true,
            rewards: true
          }
        }
      }
    });

    if (!project) {
      return jsonError("Workspace not found.", 404);
    }

    return NextResponse.json({ project });
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const payload = patchProjectSchema.parse(await request.json());

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, name: true }
    });

    if (!project) {
      return jsonError("Workspace not found.", 404);
    }

    // Handle Transfer of Ownership
    if (payload.transferOwnerId) {
      // Demote current owner(s) to MEMBER and promote target to OWNER
      await prisma.$transaction([
        prisma.projectMember.updateMany({
          where: { projectId: params.id, role: "OWNER" },
          data: { role: "MEMBER" }
        }),
        prisma.projectMember.upsert({
          where: {
            userId_projectId: {
              userId: payload.transferOwnerId,
              projectId: params.id
            }
          },
          update: { role: "OWNER" },
          create: {
            userId: payload.transferOwnerId,
            projectId: params.id,
            role: "OWNER"
          }
        })
      ]);

      recordAdminAudit({
        adminEmail: admin.email,
        action: "TRANSFER_PROJECT_OWNER",
        targetType: "PROJECT",
        targetId: params.id,
        targetName: project.name,
        details: { newOwnerId: payload.transferOwnerId }
      });
    }

    // Update metadata if present
    const updateData: Record<string, unknown> = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.description !== undefined) updateData.description = payload.description;

    if (Object.keys(updateData).length > 0) {
      await prisma.project.update({
        where: { id: params.id },
        data: updateData
      });

      recordAdminAudit({
        adminEmail: admin.email,
        action: "UPDATE_PROJECT",
        targetType: "PROJECT",
        targetId: params.id,
        targetName: project.name,
        details: updateData
      });
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || null);
    const userAgent = request.headers.get("user-agent") || null;

    if (payload.transferOwnerId) {
      void createAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        actorRole: admin.globalRole,
        ipAddress: ip,
        userAgent,
        requestPath: `/api/admin/projects/${params.id}`,
        requestMethod: "PATCH",
        category: "PROJECT",
        action: "WORKSPACE_OWNERSHIP_TRANSFERRED",
        severity: "WARNING",
        status: "SUCCESS",
        targetType: "PROJECT",
        targetId: params.id,
        targetName: project.name,
        summary: `Admin ${admin.email} transferred ownership of workspace "${project.name}" to user ID ${payload.transferOwnerId}`,
        metadata: { newOwnerId: payload.transferOwnerId }
      });
    }

    if (Object.keys(updateData).length > 0) {
      void createAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        actorRole: admin.globalRole,
        ipAddress: ip,
        userAgent,
        requestPath: `/api/admin/projects/${params.id}`,
        requestMethod: "PATCH",
        category: "PROJECT",
        action: "WORKSPACE_UPDATED",
        severity: "NOTICE",
        status: "SUCCESS",
        targetType: "PROJECT",
        targetId: params.id,
        targetName: project.name,
        summary: `Admin ${admin.email} modified workspace details for "${project.name}"`,
        beforeState: project,
        afterState: { ...project, ...updateData },
        metadata: updateData
      });
    }

    return NextResponse.json({ ok: true, message: "Workspace updated successfully" });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { id: true, name: true }
    });

    if (!project) {
      return jsonError("Workspace not found.", 404);
    }

    await prisma.project.delete({
      where: { id: params.id }
    });

    recordAdminAudit({
      adminEmail: admin.email,
      action: "DELETE_PROJECT",
      targetType: "PROJECT",
      targetId: params.id,
      targetName: project.name
    });

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || null);
    const userAgent = request.headers.get("user-agent") || null;

    void createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      actorRole: admin.globalRole,
      ipAddress: ip,
      userAgent,
      requestPath: `/api/admin/projects/${params.id}`,
      requestMethod: "DELETE",
      category: "PROJECT",
      action: "WORKSPACE_DELETED",
      severity: "CRITICAL",
      status: "SUCCESS",
      targetType: "PROJECT",
      targetId: params.id,
      targetName: project.name,
      summary: `Admin ${admin.email} PERMANENTLY DELETED workspace "${project.name}" (ID: ${project.id})`,
      beforeState: project,
      metadata: { deletedWorkspaceId: params.id, name: project.name }
    });

    return NextResponse.json({ ok: true, message: `Workspace "${project.name}" permanently deleted.` });
  } catch (error) {
    return parseError(error);
  }
}
