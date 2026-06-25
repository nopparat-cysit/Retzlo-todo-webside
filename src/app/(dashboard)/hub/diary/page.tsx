import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DiaryHubPanel } from "@/components/hub/diary-hub-panel";
import { FabHub } from "@/components/hub/fab-hub";
import { authOptions } from "@/lib/auth";
import { normalizeDiaryChecklist, type DiaryRewardCoinType } from "@/lib/diary/checklist";
import { serializeDiaryRewardClaimedDates } from "@/lib/diary/payout";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";

export const metadata = {
  title: "Diary Hub — Retzlo",
  description: "All diary checklists across every project."
};

export default async function DiaryHubPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: {
      projectId: true,
      role: true,
      project: { select: { id: true, name: true, allowMemberPrivateItems: true } }
    }
  });

  const projectIds = memberships.map((m) => m.projectId);
  const membershipMap = new Map(memberships.map((m) => [m.projectId, m]));

  const items = await prisma.diaryItem.findMany({
    where: {
      OR: [
        { projectId: { in: projectIds }, OR: [{ isHidden: false }, { authorId: userId }] },
        { projectId: null, authorId: userId }
      ]
    },
    include: {
      author: { select: { name: true, email: true } },
      project: { select: { id: true, name: true, allowMemberPrivateItems: true } }
    },
    orderBy: [{ startDate: "asc" }, { updatedAt: "desc" }]
  });


  const normalizedItems = items.map((item) => {
    const membership = item.projectId ? membershipMap.get(item.projectId) : null;
    const isOwner = membership?.role === "OWNER";
    const allowMemberPrivateItems = item.project?.allowMemberPrivateItems ?? false;
    const canManage = isOwner || item.authorId === userId;
    const canToggleHidden = isOwner || (item.authorId === userId && allowMemberPrivateItems);

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      color: normalizeCardColor(item.color),
      intervalDays: item.intervalDays,
      startDate: item.startDate.toISOString(),
      checklist: normalizeDiaryChecklist(item.checklist, item.startDate),
      rewardCoins: item.rewardCoins,
      rewardCoinType: (item.rewardCoinType === "GLOBAL" || !item.projectId ? "GLOBAL" : "PROJECT") as DiaryRewardCoinType,
      rewardClaimedDates: serializeDiaryRewardClaimedDates(item.rewardClaimedDates),
      isStarred: item.isStarred,
      isHidden: item.isHidden,
      projectId: item.projectId,
      authorId: item.authorId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      projectName: item.project?.name ?? null,
      author: item.author,
      canManage,
      canToggleHidden,
      dueTime: item.dueTime
    };
  });

  const projects = memberships.map((m) => ({ id: m.project.id, name: m.project.name }));

  return (
    <main className="soft-grid-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <DiaryHubPanel initialItems={normalizedItems} projects={projects} />
      </div>
      <FabHub />
    </main>
  );
}
