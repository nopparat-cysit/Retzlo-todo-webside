import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { jsonError, parseError } from "@/lib/api";
import { normalizeDiaryChecklist } from "@/lib/diary/checklist";
import { parseUpdateDiaryItemPayload } from "@/lib/diary/validation";
import { prisma } from "@/lib/prisma";
import {
  assertProjectMember,
  canManageAuthoredItem,
  canToggleHiddenItem,
  requireUserId
} from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";

function toDiaryItemResponse(
  item: {
    id: string;
    title: string;
    description: string | null;
    color: string;
    intervalDays: number;
    startDate: Date;
    checklist: unknown;
    isStarred: boolean;
    isHidden: boolean;
    dueTime: string | null;
    projectId: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: { name: string | null; email: string };
  },
  context: {
    membership: { role: string };
    userId: string;
    allowMemberPrivateItems: boolean;
  }
) {
  return {
    ...item,
    color: normalizeCardColor(item.color),
    startDate: item.startDate.toISOString(),
    checklist: normalizeDiaryChecklist(item.checklist, item.startDate),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    canManage: canManageAuthoredItem(context.membership, context.userId, item.authorId),
    canToggleHidden: canToggleHiddenItem(
      context.membership,
      context.userId,
      item.authorId,
      context.allowMemberPrivateItems
    )
  };
}

async function getDiaryItemContext(diaryItemId: string, userId: string) {
  const item = await prisma.diaryItem.findUnique({
    where: { id: diaryItemId },
    include: {
      project: {
        select: {
          allowMemberPrivateItems: true
        }
      },
      author: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!item) {
    return null;
  }

  // Personal diary — no project membership needed
  if (!item.projectId) {
    const isOwner = item.authorId === userId;
    return {
      item,
      membership: isOwner ? { role: "OWNER" } : null,
      isPersonal: true
    };
  }

  const membership = await assertProjectMember(item.projectId, userId);

  if (!membership) {
    return { item, membership: null, isPersonal: false };
  }

  return { item, membership, isPersonal: false };
}

export async function PATCH(request: Request, { params }: { params: { diaryItemId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const context = await getDiaryItemContext(params.diaryItemId, userId);

    if (!context) {
      return jsonError("Diary item not found.", 404);
    }

    if (!context.membership) {
      return jsonError("You do not have access to this item.", 403);
    }

    if (!canManageAuthoredItem(context.membership, userId, context.item.authorId)) {
      return jsonError("You can only update your own diary items.", 403);
    }

    const payload = parseUpdateDiaryItemPayload(await request.json(), context.item.startDate);

    const allowMemberPrivateItems = context.item.project?.allowMemberPrivateItems ?? false;
    if (
      typeof payload.isHidden === "boolean" &&
      !context.isPersonal &&
      !canToggleHiddenItem(context.membership, userId, context.item.authorId, allowMemberPrivateItems)
    ) {
      return jsonError("This project does not allow members to hide their own items.", 403);
    }

    const item = await prisma.diaryItem.update({
      where: { id: params.diaryItemId },
      data: {
        title: payload.title,
        description: payload.description,
        color: payload.color,
        intervalDays: payload.intervalDays,
        startDate: payload.startDate ? new Date(`${payload.startDate}T00:00:00.000Z`) : undefined,
        checklist: payload.checklist as unknown as Prisma.InputJsonValue | undefined,
        isStarred: payload.isStarred,
        isHidden: payload.isHidden,
        dueTime: payload.dueTime !== undefined ? payload.dueTime : undefined
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      diaryItem: toDiaryItemResponse(item, {
        membership: context.membership,
        userId,
        allowMemberPrivateItems
      })
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { diaryItemId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const context = await getDiaryItemContext(params.diaryItemId, userId);

    if (!context) {
      return jsonError("Diary item not found.", 404);
    }

    if (!context.membership) {
      return jsonError("You do not have access to this item.", 403);
    }

    if (!canManageAuthoredItem(context.membership, userId, context.item.authorId)) {
      return jsonError("You can only delete your own diary items.", 403);
    }

    await prisma.diaryItem.delete({
      where: { id: params.diaryItemId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
