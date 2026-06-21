import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";

export async function GET() {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    // Fetch all projects user is member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: {
        projectId: true,
        role: true,
        project: { select: { id: true, name: true, allowMemberPrivateItems: true, notesEnabled: true } }
      }
    });

    const noteMemberships = memberships.filter((membership) => membership.project.notesEnabled);
    const projectIds = noteMemberships.map((m) => m.projectId);
    const membershipMap = new Map(memberships.map((m) => [m.projectId, m]));

    // Fetch notes visible to user
    const notes = await prisma.note.findMany({
      where: {
        projectId: { in: projectIds },
        OR: [{ isHidden: false }, { authorId: userId }]
      },
      include: {
        author: { select: { name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: [{ updatedAt: "desc" }]
    });

    const normalized = notes.map((note) => {
      const membership = membershipMap.get(note.projectId);
      const isOwner = membership?.role === "OWNER";
      const allowMemberPrivateItems = membership?.project.allowMemberPrivateItems ?? false;
      const canManage = isOwner || note.authorId === userId;
      const canToggleHidden = isOwner || (note.authorId === userId && allowMemberPrivateItems);

      return {
        ...note,
        color: normalizeCardColor(note.color),
        dueDate: note.dueDate?.toISOString() ?? null,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        projectName: note.project.name,
        canManage,
        canToggleHidden
      };
    });

    const projects = noteMemberships.map((m) => ({ id: m.project.id, name: m.project.name }));

    return NextResponse.json({ notes: normalized, projects });
  } catch (error) {
    return parseError(error);
  }
}
