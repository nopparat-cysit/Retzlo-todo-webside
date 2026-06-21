import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { jsonError, parseError } from "@/lib/api";
import { normalizeDiaryChecklist } from "@/lib/diary/checklist";
import { parseCreateDiaryItemPayload } from "@/lib/diary/validation";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, canToggleHiddenItem, isOwnerRole, requireUserId } from "@/lib/project-auth";
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
  const canManage = isOwnerRole(context.membership.role) || context.userId === item.authorId;

  return {
    ...item,
    color: normalizeCardColor(item.color),
    startDate: item.startDate.toISOString(),
    checklist: normalizeDiaryChecklist(item.checklist, item.startDate),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    canManage,
    canToggleHidden: canToggleHiddenItem(
      context.membership,
      context.userId,
      item.authorId,
      context.allowMemberPrivateItems
    )
  };
}

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
    select: { allowMemberPrivateItems: true }
  });

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  const items = await prisma.diaryItem.findMany({
    where: isOwnerRole(membership.role)
      ? { projectId: params.id }
      : {
          projectId: params.id,
          OR: [{ isHidden: false }, { authorId: userId }]
        },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: [{ startDate: "asc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({
    diaryItems: items.map((item) =>
      toDiaryItemResponse(item, {
        membership,
        userId,
        allowMemberPrivateItems: project.allowMemberPrivateItems
      })
    )
  });
}

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

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { allowMemberPrivateItems: true }
    });

    if (!project) {
      return jsonError("Project not found.", 404);
    }

    const payload = parseCreateDiaryItemPayload(await request.json());

    if (payload.isHidden && !canToggleHiddenItem(membership, userId, userId, project.allowMemberPrivateItems)) {
      return jsonError("This project does not allow members to hide their own items.", 403);
    }

    const item = await prisma.diaryItem.create({
      data: {
        title: payload.title,
        description: payload.description,
        color: payload.color,
        intervalDays: payload.intervalDays,
        startDate: new Date(`${payload.startDate}T00:00:00.000Z`),
        checklist: payload.checklist as unknown as Prisma.InputJsonValue,
        isStarred: payload.isStarred,
        isHidden: payload.isHidden,
        dueTime: payload.dueTime ?? null,
        projectId: params.id,
        authorId: userId
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

    return NextResponse.json(
      {
        diaryItem: toDiaryItemResponse(item, {
          membership,
          userId,
          allowMemberPrivateItems: project.allowMemberPrivateItems
        })
      },
      { status: 201 }
    );
  } catch (error) {
    return parseError(error);
  }
}
