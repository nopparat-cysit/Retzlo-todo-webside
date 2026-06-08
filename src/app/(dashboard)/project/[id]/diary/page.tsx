import { redirect } from "next/navigation";

import { DiaryListPanel } from "@/components/diary/diary-list-panel";
import { prisma } from "@/lib/prisma";
import {
  canManageAuthoredItem,
  canToggleHiddenItem,
  getProjectMembership,
  isOwnerRole,
  requireUserId
} from "@/lib/project-auth";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { ProjectDiaryItem } from "@/types/diary-item";

function normalizeDate(date: string | string[] | undefined) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  return new Date().toISOString().slice(0, 10);
}

function toProjectDiaryItems(
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    color: string;
    intervalDays: number;
    startDate: Date;
    isHidden: boolean;
    projectId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      name: string | null;
      email: string;
    };
  }>,
  context: {
    membership: { role: string };
    userId: string;
    allowMemberPrivateItems: boolean;
  }
): ProjectDiaryItem[] {
  return items.map((item) => ({
    ...item,
    color: normalizeCardColor(item.color),
    startDate: item.startDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    canManage: canManageAuthoredItem(context.membership, context.userId, item.authorId),
    canToggleHidden: canToggleHiddenItem(
      context.membership,
      context.userId,
      item.authorId,
      context.allowMemberPrivateItems
    )
  }));
}

export default async function DiaryPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { date?: string | string[] };
}) {
  const userId = await requireUserId();

  if (!userId) {
    redirect("/login");
  }

  const selectedDate = normalizeDate(searchParams.date);
  const membership = await getProjectMembership(params.id, userId);

  if (!membership) {
    redirect("/projects");
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      allowMemberPrivateItems: true
    }
  });

  if (!project) {
    redirect("/projects");
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

  return (
    <DiaryListPanel
      allowMemberPrivateItems={project.allowMemberPrivateItems}
      initialItems={toProjectDiaryItems(items, {
        membership,
        userId,
        allowMemberPrivateItems: project.allowMemberPrivateItems
      })}
      isOwner={isOwnerRole(membership.role)}
      projectId={params.id}
      selectedDate={selectedDate}
    />
  );
}
