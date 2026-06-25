import type { Prisma } from "@prisma/client";

import {
  hasDiaryRewardBeenClaimed,
  isDiaryChecklistCompleteForReward,
  markDiaryRewardClaimed,
  normalizeDiaryChecklist,
  normalizeDiaryRewardClaimedDates,
  normalizeDiaryRewardCoinType
} from "@/lib/diary/checklist";

export async function processDiaryChecklistReward(
  tx: Prisma.TransactionClient,
  diaryItemId: string,
  userId: string,
  selectedDate: string
) {
  const item = await tx.diaryItem.findUnique({
    where: { id: diaryItemId },
    select: {
      checklist: true,
      rewardCoins: true,
      rewardCoinType: true,
      rewardClaimedDates: true,
      projectId: true
    }
  });

  if (!item || item.rewardCoins <= 0) {
    return { awardedCoins: 0, coinType: null };
  }

  const checklist = normalizeDiaryChecklist(item.checklist, selectedDate);

  if (
    !isDiaryChecklistCompleteForReward(checklist, selectedDate) ||
    hasDiaryRewardBeenClaimed(item.rewardClaimedDates, selectedDate)
  ) {
    return { awardedCoins: 0, coinType: null };
  }

  const coinType = normalizeDiaryRewardCoinType(item.rewardCoinType, Boolean(item.projectId));

  if (coinType === "PROJECT" && item.projectId) {
    await tx.projectMember.update({
      where: { userId_projectId: { userId, projectId: item.projectId } },
      data: { coins: { increment: item.rewardCoins } }
    });
  } else {
    await tx.user.update({
      where: { id: userId },
      data: { globalCoins: { increment: item.rewardCoins } }
    });
  }

  await tx.diaryItem.update({
    where: { id: diaryItemId },
    data: {
      rewardClaimedDates: markDiaryRewardClaimed(item.rewardClaimedDates, selectedDate) as Prisma.InputJsonValue
    }
  });

  return { awardedCoins: item.rewardCoins, coinType };
}

export function serializeDiaryRewardClaimedDates(value: unknown) {
  return normalizeDiaryRewardClaimedDates(value);
}
