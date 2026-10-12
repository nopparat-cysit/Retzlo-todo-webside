import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/admin-system-state";

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

    return NextResponse.json({ ok: true, message: "Workspace updated successfully" });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(
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

    return NextResponse.json({ ok: true, message: `Workspace "${project.name}" permanently deleted.` });
  } catch (error) {
    return parseError(error);
  }
}
