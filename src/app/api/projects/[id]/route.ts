import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { projectAppearanceUpdateSchema } from "@/lib/projects/appearance";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";

const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  coverImage: z.string().max(500).nullable().optional(),
}).merge(projectAppearanceUpdateSchema);

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const membership = await assertProjectMember(params.id, userId);

  if (!membership) {
    return jsonError("You do not have access to this project.", 403);
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      boards: { select: { id: true, name: true }, orderBy: { createdAt: "asc" } },
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  return NextResponse.json({ project, membership });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    if (!["OWNER", "ADMIN"].includes(membership.role)) {
      return jsonError("Only owners and admins can update project settings.", 403);
    }

    const payload = updateProjectSchema.parse(await request.json());
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.coverImage !== undefined && { coverImage: payload.coverImage }),
        ...(payload.themeColor !== undefined && { themeColor: payload.themeColor }),
        ...(payload.sticker !== undefined && { sticker: payload.sticker }),
      }
    });

    return NextResponse.json({ project });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const membership = await assertProjectMember(params.id, userId);

    if (!membership) {
      return jsonError("You do not have access to this project.", 403);
    }

    if (membership.role !== "OWNER") {
      return jsonError("Only the project owner can delete this project.", 403);
    }

    await prisma.project.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return parseError(error);
  }
}
