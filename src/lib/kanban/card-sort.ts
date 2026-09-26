import { Card } from "@/types/kanban";

export type CardSortOption =
  | "manual"
  | "priority_desc"
  | "priority_asc"
  | "difficulty_desc"
  | "difficulty_asc"
  | "due_date";

const PRIORITY_RANKS: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export function sortCards(cards: Card[], sortOption: CardSortOption): Card[] {
  if (sortOption === "manual") {
    return cards;
  }

  return [...cards].sort((a, b) => {
    if (sortOption === "difficulty_desc") {
      const aPoints = a.difficulty !== null && a.difficulty !== undefined ? Number(a.difficulty) : -1;
      const bPoints = b.difficulty !== null && b.difficulty !== undefined ? Number(b.difficulty) : -1;
      if (bPoints !== aPoints) {
        return bPoints - aPoints; // 8 -> 1
      }
      return (a.position ?? 0) - (b.position ?? 0);
    }

    if (sortOption === "difficulty_asc") {
      const aPoints = a.difficulty !== null && a.difficulty !== undefined ? Number(a.difficulty) : 999;
      const bPoints = b.difficulty !== null && b.difficulty !== undefined ? Number(b.difficulty) : 999;
      if (aPoints !== bPoints) {
        return aPoints - bPoints; // 1 -> 8
      }
      return (a.position ?? 0) - (b.position ?? 0);
    }

    if (sortOption === "priority_desc") {
      const aRank = PRIORITY_RANKS[a.priority ?? "MEDIUM"] ?? 2;
      const bRank = PRIORITY_RANKS[b.priority ?? "MEDIUM"] ?? 2;
      if (bRank !== aRank) {
        return bRank - aRank; // High -> Low
      }
      return (a.position ?? 0) - (b.position ?? 0);
    }

    if (sortOption === "priority_asc") {
      const aRank = PRIORITY_RANKS[a.priority ?? "MEDIUM"] ?? 2;
      const bRank = PRIORITY_RANKS[b.priority ?? "MEDIUM"] ?? 2;
      if (aRank !== bRank) {
        return aRank - bRank; // Low -> High
      }
      return (a.position ?? 0) - (b.position ?? 0);
    }

    if (sortOption === "due_date") {
      if (!a.dueDate && !b.dueDate) return (a.position ?? 0) - (b.position ?? 0);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const aTime = new Date(a.dueDate).getTime();
      const bTime = new Date(b.dueDate).getTime();
      if (aTime !== bTime) {
        return aTime - bTime;
      }
      return (a.position ?? 0) - (b.position ?? 0);
    }

    return (a.position ?? 0) - (b.position ?? 0);
  });
}
