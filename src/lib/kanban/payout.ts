import type { Prisma } from "@prisma/client";

import { getPrivateCoinEntry, markPrivateCoinClaimed } from "@/lib/kanban/private-coins";

/**
 * Processes coin payouts for a card transitioning to DONE status.
 * Awards Project Coins to the active user (credited to ProjectMember.coins)
 * and private Global Coins to the active user (credited to User.globalCoins).
 * Uses a claim state saved inside Card.privateCoins JSON to prevent double claiming.
 * 
 * Returns an object with the awarded coin amounts.
 */
export async function processCardDonePayouts(
  tx: Prisma.TransactionClient,
  cardId: string,
  userId: string,
  projectId: string
) {
  // 1. Fetch card details
  const card = await tx.card.findUnique({
    where: { id: cardId },
    select: {
      status: true,
      rewardCoins: true,
      privateCoins: true
    }
  });

  if (!card) return { globalCoinsAwarded: 0, projectCoinsAwarded: 0 };

  let coinsRewarded = false;
  let globalCoinsAwarded = 0;
  let projectCoinsAwarded = 0;

  let privateCoins = (card.privateCoins && typeof card.privateCoins === "object" && !Array.isArray(card.privateCoins)
    ? { ...(card.privateCoins as Record<string, unknown>) }
    : {}) as Record<string, unknown>;

  // A. Process Private Global Coins Payout
  const userPriv = getPrivateCoinEntry(privateCoins, userId);
  const globalRewardAmount = userPriv.coins;
  const globalClaimed = userPriv.claimed;

  if (globalRewardAmount > 0 && !globalClaimed) {
    // Increment User's global coins
    await tx.user.update({
      where: { id: userId },
      data: { globalCoins: { increment: globalRewardAmount } }
    });
    privateCoins = markPrivateCoinClaimed(privateCoins, userId);
    globalCoinsAwarded = globalRewardAmount;
    coinsRewarded = true;
  }

  // B. Process Team Project Coins Payout
  const projectRewardAmount = card.rewardCoins || 0;
  const projectClaimed = privateCoins.projectCoinsClaimed === true;

  if (projectRewardAmount > 0 && !projectClaimed) {
    // Increment member's project coins
    await tx.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { coins: { increment: projectRewardAmount } }
    });
    privateCoins.projectCoinsClaimed = true;
    projectCoinsAwarded = projectRewardAmount;
    coinsRewarded = true;
  }

  // 2. If any coins were rewarded, save the updated claim status in privateCoins and update status to DONE
  if (coinsRewarded || card.status !== "DONE") {
    await tx.card.update({
      where: { id: cardId },
      data: {
        status: "DONE",
        privateCoins: privateCoins as Prisma.InputJsonValue
      }
    });
  }

  return { globalCoinsAwarded, projectCoinsAwarded };
}
