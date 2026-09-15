export interface CardAssignee {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
  role?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

/**
 * Extracts and sanitizes an array of assignee user IDs from a card's privateCoins object.
 */
export function extractAssigneeIds(privateCoins: unknown): string[] {
  if (!isRecord(privateCoins) || !Array.isArray(privateCoins.assigneeIds)) {
    return [];
  }

  const ids = privateCoins.assigneeIds
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    .map((id) => id.trim());

  // Deduplicate while preserving order
  return Array.from(new Set(ids));
}

/**
 * Returns a new privateCoins object with the updated assignee IDs.
 */
export function withAssignees(
  privateCoins: unknown,
  assigneeIds: string[] | null | undefined
): Record<string, unknown> {
  const next = isRecord(privateCoins) ? { ...privateCoins } : {};

  if (!assigneeIds || !Array.isArray(assigneeIds) || assigneeIds.length === 0) {
    delete next.assigneeIds;
    return next;
  }

  const sanitized = Array.from(
    new Set(
      assigneeIds
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        .map((id) => id.trim())
    )
  );

  if (sanitized.length === 0) {
    delete next.assigneeIds;
  } else {
    next.assigneeIds = sanitized;
  }

  return next;
}

/**
 * Resolves a list of assignee IDs into CardAssignee objects using an available members map.
 */
export function resolveAssignees(
  assigneeIds: string[] | undefined | null,
  members: CardAssignee[]
): CardAssignee[] {
  if (!assigneeIds || assigneeIds.length === 0 || !members || members.length === 0) {
    return [];
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));
  return assigneeIds
    .map((id) => memberMap.get(id))
    .filter((member): member is CardAssignee => Boolean(member));
}

/**
 * Filters a list of cards by the selected assignee filter.
 * - `null` or `"ALL"`: returns all cards.
 * - `"UNASSIGNED"`: returns cards with no assignees.
 * - `"ME"`: returns cards assigned to currentUserId.
 * - specific userId: returns cards assigned to that user.
 */
export function filterCardsByAssignee<T extends { assigneeIds?: string[] }>(
  cards: T[],
  filterAssigneeId: string | null | undefined,
  currentUserId?: string | null
): T[] {
  if (!filterAssigneeId || filterAssigneeId === "ALL") {
    return cards;
  }

  if (filterAssigneeId === "UNASSIGNED") {
    return cards.filter((c) => !c.assigneeIds || c.assigneeIds.length === 0);
  }

  const targetId = filterAssigneeId === "ME" ? currentUserId : filterAssigneeId;
  if (!targetId) {
    return cards;
  }

  return cards.filter((c) => Array.isArray(c.assigneeIds) && c.assigneeIds.includes(targetId));
}
