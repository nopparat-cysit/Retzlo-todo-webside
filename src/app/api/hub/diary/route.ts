import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import { parseCreateDiaryItemPayload } from "@/lib/diary/validation";

export async function GET() {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    // Fetch all projects user is member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true, role: true, project: { select: { id: true, name: true, allowMemberPrivateItems: true } } }
    });

    const projectIds = memberships.map((m) => m.projectId);
    const membershipMap = new Map(memberships.map((m) => [m.projectId, m]));

    // Fetch all diary items (project + personal)
    const items = await prisma.diaryItem.findMany({
      where: {
        OR: [
          // Project items: user is member
          {
            projectId: { in: projectIds },
            OR: [
              { isHidden: false },
              { authorId: userId }
            ]
          },
          // Personal (My Diary): owned by user
          { projectId: null, authorId: userId }
        ]
      },
      include: {
        author: { select: { name: true, email: true } },
        project: { select: { id: true, name: true, allowMemberPrivateItems: true } }
      },
      orderBy: [{ startDate: "asc" }, { updatedAt: "desc" }]
    });

    const normalized = items.map((item) => {
      const membership = item.projectId ? membershipMap.get(item.projectId) : null;
      const isOwner = membership?.role === "OWNER";
      const canManage = isOwner || item.authorId === userId;
      const allowMemberPrivateItems = item.project?.allowMemberPrivateItems ?? false;
      const canToggleHidden = isOwner || (item.authorId === userId && allowMemberPrivateItems);

      return {
        ...item,
        color: normalizeCardColor(item.color),
        startDate: item.startDate.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        projectName: item.project?.name ?? null,
        canManage,
        canToggleHidden
      };
    });

    const projects = memberships.map((m) => ({ id: m.project.id, name: m.project.name }));

    return NextResponse.json({ items: normalized, projects });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = parseCreateDiaryItemPayload(await request.json());

    // Create personal diary item (no project)
    const item = await prisma.diaryItem.create({
      data: {
        title: payload.title,
        description: payload.description,
        color: payload.color,
        intervalDays: payload.intervalDays,
        startDate: new Date(`${payload.startDate}T00:00:00.000Z`),
        isStarred: payload.isStarred,
        isHidden: false,
        dueTime: payload.dueTime ?? null,
        projectId: null,
        authorId: userId
      },
      include: {
        author: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(
      {
        diaryItem: {
          ...item,
          color: normalizeCardColor(item.color),
          startDate: item.startDate.toISOString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          projectName: null,
          canManage: true,
          canToggleHidden: false
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return parseError(error);
  }
}
