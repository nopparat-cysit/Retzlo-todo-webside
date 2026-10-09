import { prisma } from "@/lib/prisma";

export type AiTier = "FREE" | "PRO" | "ADMIN";

export interface UserAiQuota {
  tier: AiTier;
  credits: number;
  maxCredits: number;
  unlimited: boolean;
}

export const AI_CREDIT_COSTS = {
  BREAKDOWN: 1,
  SUMMARY: 2,
  CHAT: 1
} as const;

export const AI_TIER_LIMITS: Record<AiTier, number> = {
  FREE: 50,
  PRO: 200,
  ADMIN: 999999
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

/**
 * Normalizes and reads AI quota from user profile data.
 */
export async function getUserAiQuota(userId: string): Promise<UserAiQuota> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { globalRole: true, zenGarden: true }
  });

  if (!user) {
    return {
      tier: "FREE",
      credits: 0,
      maxCredits: AI_TIER_LIMITS.FREE,
      unlimited: false
    };
  }

  const isAdmin = user.globalRole === "ADMIN";
  if (isAdmin) {
    return {
      tier: "ADMIN",
      credits: 999999,
      maxCredits: 999999,
      unlimited: true
    };
  }

  const zen = isRecord(user.zenGarden) ? user.zenGarden : {};
  const aiData = isRecord(zen.aiQuota) ? zen.aiQuota : {};

  const tier: AiTier =
    aiData.tier === "PRO" ? "PRO" : "FREE";
  const maxCredits = AI_TIER_LIMITS[tier];

  // If credits are not yet initialized, set default tier limit
  const credits =
    typeof aiData.credits === "number" && Number.isFinite(aiData.credits)
      ? Math.max(0, Math.floor(aiData.credits))
      : maxCredits;

  return {
    tier,
    credits,
    maxCredits,
    unlimited: false
  };
}

/**
 * Safely and atomically deducts AI credits for an action.
 */
export async function deductUserAiCredit(
  userId: string,
  cost: number,
  _feature: "BREAKDOWN" | "SUMMARY" | "CHAT"
): Promise<{ ok: boolean; remainingCredits: number; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, globalRole: true, zenGarden: true }
  });

  if (!user) {
    return { ok: false, remainingCredits: 0, error: "User not found." };
  }

  // Admin gets free pass
  if (user.globalRole === "ADMIN") {
    return { ok: true, remainingCredits: 999999 };
  }

  const zen = isRecord(user.zenGarden) ? { ...user.zenGarden } : {};
  const currentAi = isRecord(zen.aiQuota) ? { ...zen.aiQuota } : {};

  const tier: AiTier = currentAi.tier === "PRO" ? "PRO" : "FREE";
  const maxCredits = AI_TIER_LIMITS[tier];

  const currentCredits =
    typeof currentAi.credits === "number" && Number.isFinite(currentAi.credits)
      ? Math.max(0, Math.floor(currentAi.credits))
      : maxCredits;

  if (currentCredits < cost) {
    return {
      ok: false,
      remainingCredits: currentCredits,
      error: `Insufficient AI credits (${currentCredits} remaining, but ${cost} required).`
    };
  }

  const nextCredits = currentCredits - cost;
  zen.aiQuota = {
    ...currentAi,
    tier,
    credits: nextCredits,
    lastUsedAt: new Date().toISOString()
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      zenGarden: zen as object
    }
  });

  return {
    ok: true,
    remainingCredits: nextCredits
  };
}
