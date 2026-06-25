import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { projectAppearanceUpdateSchema } from "@/lib/projects/appearance";
import { assertProjectMember, isOwnerRole, requireUserId } from "@/lib/project-auth";

const updateProjectSettingsSchema = z.object({
  allowMemberPrivateItems: z.boolean().optional(),
  notesEnabled: z.boolean().optional()
}).merge(projectAppearanceUpdateSchema);

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

    if (!isOwnerRole(membership.role)) {
      return jsonError("Only project owners can update these settings.", 403);
    }

    const payload = updateProjectSettingsSchema.parse(await request.json());
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        allowMemberPrivateItems: payload.allowMemberPrivateItems,
        notesEnabled: payload.notesEnabled,
        ...(payload.themeColor !== undefined && { themeColor: payload.themeColor }),
        ...(payload.sticker !== undefined && { sticker: payload.sticker })
      },
      select: {
        id: true,
        allowMemberPrivateItems: true,
        notesEnabled: true,
        themeColor: true,
        sticker: true
      }
    });

    return NextResponse.json({ project });
  } catch (error) {
    return parseError(error);
  }
}
