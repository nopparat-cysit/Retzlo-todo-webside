export interface PrivateCoinEntry {
  coins: number;
  claimed: boolean;
}

export type CardPrivateCoins = Record<string, PrivateCoinEntry | number | unknown>;

export function getPrivateCoinEntry(privateCoins: unknown, userId: string): PrivateCoinEntry {
  const entries = isRecord(privateCoins) ? privateCoins : {};
  const rawEntry = entries[userId];

  if (typeof rawEntry === "number") {
    return { coins: sanitizeCoinAmount(rawEntry), claimed: false };
  }

  if (isRecord(rawEntry)) {
    return {
      coins: sanitizeCoinAmount(rawEntry.coins),
      claimed: rawEntry.claimed === true
    };
  }

  return { coins: 0, claimed: false };
}

export function setPrivateCoinAmount(privateCoins: unknown, userId: string, amount: number): CardPrivateCoins {
  const next = { ...(isRecord(privateCoins) ? privateCoins : {}) } as CardPrivateCoins;
  const current = getPrivateCoinEntry(next, userId);
  const coins = sanitizeCoinAmount(amount);

  if (coins === 0) {
    delete next[userId];
    return next;
  }

  next[userId] = {
    coins,
    claimed: current.claimed
  };

  return next;
}

export function resolveCardRewardPayload({
  activeUserId,
  enabled,
  privateCoins,
  privateGlobalCoins,
  rewardCoins
}: {
  activeUserId: string | null;
  enabled: boolean;
  privateCoins: unknown;
  privateGlobalCoins: number;
  rewardCoins: number;
}) {
  const nextRewardCoins = enabled ? sanitizeCoinAmount(rewardCoins) : 0;
  const nextPrivateGlobalCoins = enabled ? sanitizeCoinAmount(privateGlobalCoins) : 0;

  return {
    rewardCoins: nextRewardCoins,
    privateCoins: activeUserId
      ? setPrivateCoinAmount(privateCoins, activeUserId, nextPrivateGlobalCoins)
      : undefined
  };
}

export function markPrivateCoinClaimed(privateCoins: unknown, userId: string): CardPrivateCoins {
  const next = { ...(isRecord(privateCoins) ? privateCoins : {}) } as CardPrivateCoins;
  const current = getPrivateCoinEntry(next, userId);

  if (current.coins > 0) {
    next[userId] = {
      coins: current.coins,
      claimed: true
    };
  }

  return next;
}

export function sanitizeCoinAmount(value: unknown): number {
  const numberValue = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : 0;

  if (!Number.isFinite(numberValue)) return 0;

  return Math.max(0, Math.trunc(numberValue));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
