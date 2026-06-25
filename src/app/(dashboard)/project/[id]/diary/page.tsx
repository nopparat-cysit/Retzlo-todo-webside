import { redirect } from "next/navigation";
import Link from "next/link";

import { DiaryListPanel } from "@/components/diary/diary-list-panel";
import { normalizeDiaryChecklist } from "@/lib/diary/checklist";
import { serializeDiaryRewardClaimedDates } from "@/lib/diary/payout";
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

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Can't reach database server") || error.message.includes("P1001");
}

function DiaryDatabaseUnavailable({ projectId, selectedDate }: { projectId: string; selectedDate: string }) {
  return (
    <section className="lofi-panel mx-auto max-w-3xl rounded-xl p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-dusk-rose">Database offline</p>
      <h2 className="mt-2 text-2xl font-semibold text-stone-100">Diary data could not load</h2>
      <p className="mt-3 text-sm leading-6 text-stone-400">
        The app cannot reach the configured Neon database right now. Check that the Neon project is active,
        the database URL is still valid, and your network allows PostgreSQL connections on port 5432.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-lg border border-dusk-lavender/30 bg-dusk-lavender/15 px-4 text-sm font-medium text-dusk-lavender transition hover:border-dusk-lavender/60 hover:bg-dusk-lavender/20"
          href={`/project/${projectId}/diary?date=${selectedDate}`}
        >
          Retry diary
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-medium text-stone-300 transition hover:border-white/20 hover:bg-white/[0.075]"
          href="/projects"
        >
          Back to projects
        </Link>
      </div>
    </section>
  );
}

function toProjectDiaryItems(
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    color: string;
    intervalDays: number;
    startDate: Date;
    checklist: unknown;
    rewardCoins: number;
    rewardCoinType: string;
    rewardClaimedDates: unknown;
    isStarred: boolean;
    isHidden: boolean;
    dueTime: string | null;
    projectId: string | null;
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
    checklist: normalizeDiaryChecklist(item.checklist, item.startDate),
    rewardCoins: item.rewardCoins,
    rewardCoinType: item.rewardCoinType === "GLOBAL" || !item.projectId ? "GLOBAL" : "PROJECT",
    rewardClaimedDates: serializeDiaryRewardClaimedDates(item.rewardClaimedDates),
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
  let membership: Awaited<ReturnType<typeof getProjectMembership>>;
  let project: { allowMemberPrivateItems: boolean } | null;
  let items: Parameters<typeof toProjectDiaryItems>[0];

  try {
    membership = await getProjectMembership(params.id, userId);

    if (!membership) {
      redirect("/projects");
    }

    project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        allowMemberPrivateItems: true
      }
    });

    if (!project) {
      redirect("/projects");
    }

    items = await prisma.diaryItem.findMany({
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
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DiaryDatabaseUnavailable projectId={params.id} selectedDate={selectedDate} />;
    }

    throw error;
  }

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
