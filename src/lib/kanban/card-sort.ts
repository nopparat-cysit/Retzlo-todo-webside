import { Card, CustomPriority } from "@/types/kanban";
import { getPriorityMeta, resolveBoardPriorities } from "@/lib/kanban/priority";

export type CardSortOption =
  | "manual"
  | "priority_desc"
  | "priority_asc"
  | "difficulty_desc"
  | "difficulty_asc"
  | "due_date";

export function sortCards(
  cards: Card[],
  sortOption: CardSortOption,
  boardPriorities?: CustomPriority[]
): Card[] {
  if (sortOption === "manual") {
    return cards;
  }

  const priorities = resolveBoardPriorities(boardPriorities);

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
      const aLevel = getPriorityMeta(a.priority, priorities).level;
      const bLevel = getPriorityMeta(b.priority, priorities).level;
      if (aLevel !== bLevel) {
        return aLevel - bLevel; // High / Urgent (level 1) first
      }
      return (a.position ?? 0) - (b.position ?? 0);
    }

    if (sortOption === "priority_asc") {
      const aLevel = getPriorityMeta(a.priority, priorities).level;
      const bLevel = getPriorityMeta(b.priority, priorities).level;
      if (bLevel !== aLevel) {
        return bLevel - aLevel; // Low (level 10) first
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
