import { extractAssigneeIds } from "./assignees";

export interface CardCoffeeCheerEntry {
  userId: string;
  userName?: string;
  createdAt: string;
}

export interface CardCoffeeCheersData {
  count: number;
  userIds: string[];
  cheers: Record<string, CardCoffeeCheerEntry>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

/**
 * Extracts normalized coffee cheers data from a card's privateCoins JSON object.
 */
export function extractCardCoffeeCheers(privateCoins: unknown): CardCoffeeCheersData {
  if (!isRecord(privateCoins) || !isRecord(privateCoins.coffeeCheers)) {
    return { count: 0, userIds: [], cheers: {} };
  }

  const rawCheers = privateCoins.coffeeCheers as Record<string, unknown>;
  const cheers: Record<string, CardCoffeeCheerEntry> = {};
  const userIds: string[] = [];

  for (const [userId, rawVal] of Object.entries(rawCheers)) {
    if (!userId || typeof userId !== "string") continue;
    const trimmedId = userId.trim();
    if (!trimmedId) continue;

    if (isRecord(rawVal)) {
      cheers[trimmedId] = {
        userId: trimmedId,
        userName: typeof rawVal.userName === "string" ? rawVal.userName : undefined,
        createdAt: typeof rawVal.createdAt === "string" ? rawVal.createdAt : new Date().toISOString()
      };
    } else {
      cheers[trimmedId] = {
        userId: trimmedId,
        createdAt: new Date().toISOString()
      };
    }
    userIds.push(trimmedId);
  }

  return {
    count: userIds.length,
    userIds,
    cheers
  };
}

/**
 * Checks whether a specific user has already given coffee to this card.
 */
export function hasUserCheeredCard(privateCoins: unknown, userId?: string | null): boolean {
  if (!userId || !userId.trim()) return false;
  const { userIds } = extractCardCoffeeCheers(privateCoins);
  return userIds.includes(userId.trim());
}

export type CheerDenialReason =
  | "NOT_DONE"
  | "NO_USER"
  | "SELF_CHEER_FORBIDDEN"
  | "ALREADY_CHEERED";

export interface CanCheerResult {
  canCheer: boolean;
  reason?: CheerDenialReason;
}

/**
 * Validates 100% Anti-Cheat conditions for cheering a card:
 * 1. Card must be in DONE column / status.
 * 2. Caller must be logged in.
 * 3. Caller cannot be an assignee of the card (No self-farming).
 * 4. Caller cannot cheer more than once on the same card.
 */
export function canUserCheerCard(params: {
  cardStatus: string;
  privateCoins: unknown;
  currentUserId?: string | null;
}): CanCheerResult {
  const { cardStatus, privateCoins, currentUserId } = params;

  if (cardStatus !== "DONE") {
    return { canCheer: false, reason: "NOT_DONE" };
  }

  if (!currentUserId || !currentUserId.trim()) {
    return { canCheer: false, reason: "NO_USER" };
  }

  const trimmedUser = currentUserId.trim();
  const assigneeIds = extractAssigneeIds(privateCoins);

  if (assigneeIds.includes(trimmedUser)) {
    return { canCheer: false, reason: "SELF_CHEER_FORBIDDEN" };
  }

  if (hasUserCheeredCard(privateCoins, trimmedUser)) {
    return { canCheer: false, reason: "ALREADY_CHEERED" };
  }

  return { canCheer: true };
}

/**
 * Returns a new privateCoins object containing the added coffee cheer.
 */
export function withCardCoffeeCheer(
  privateCoins: unknown,
  userId: string,
  userName?: string
): Record<string, unknown> {
  const next = isRecord(privateCoins) ? { ...privateCoins } : {};
  const currentCheers = isRecord(next.coffeeCheers) ? { ...next.coffeeCheers } : {};

  const trimmedId = userId.trim();
  currentCheers[trimmedId] = {
    userId: trimmedId,
    userName: userName?.trim() || undefined,
    createdAt: new Date().toISOString()
  };

  next.coffeeCheers = currentCheers;
  return next;
}

/**
 * Aggregates total coffees received by a member across all completed cards in a project.
 */
export function calculateMemberTotalCoffees(
  cards: Array<{ status: string; privateCoins?: unknown }>,
  memberUserId: string
): number {
  if (!memberUserId || !memberUserId.trim()) return 0;
  const targetId = memberUserId.trim();

  let total = 0;
  for (const card of cards) {
    if (card.status !== "DONE") continue;

    const assignees = extractAssigneeIds(card.privateCoins);
    if (!assignees.includes(targetId)) continue;

    const { count } = extractCardCoffeeCheers(card.privateCoins);
    total += count;
  }

  return total;
}
