import type { ColumnWithCards, Card } from "@/types/kanban";

function areCardsEqual(a: Card, b: Card): boolean {
  if (
    a.id !== b.id ||
    a.position !== b.position ||
    a.title !== b.title ||
    a.description !== b.description ||
    a.note !== b.note ||
    a.status !== b.status ||
    a.color !== b.color ||
    a.priority !== b.priority ||
    a.isStarred !== b.isStarred ||
    a.dueDate !== b.dueDate ||
    a.dueDateAllDay !== b.dueDateAllDay ||
    a.startDate !== b.startDate ||
    a.startDateAllDay !== b.startDateAllDay ||
    a.difficulty !== b.difficulty ||
    a.rewardCoins !== b.rewardCoins
  ) {
    return false;
  }

  // Checklists
  const clA = a.checklist || [];
  const clB = b.checklist || [];
  if (clA.length !== clB.length) return false;
  for (let i = 0; i < clA.length; i++) {
    if (clA[i].id !== clB[i].id || clA[i].checked !== clB[i].checked || clA[i].label !== clB[i].label) {
      return false;
    }
  }

  // Assignees
  const asgA = a.assigneeIds || [];
  const asgB = b.assigneeIds || [];
  if (asgA.length !== asgB.length) return false;
  for (let i = 0; i < asgA.length; i++) {
    if (asgA[i] !== asgB[i]) return false;
  }

  return true;
}

export function areColumnsEqual(colsA: ColumnWithCards[], colsB: ColumnWithCards[]): boolean {
  if (colsA === colsB) return true;
  if (!colsA || !colsB || colsA.length !== colsB.length) return false;

  for (let i = 0; i < colsA.length; i++) {
    const a = colsA[i];
    const b = colsB[i];

    if (
      a.id !== b.id ||
      a.name !== b.name ||
      a.position !== b.position ||
      a.color !== b.color ||
      a.icon !== b.icon ||
      a.defaultCardStatus !== b.defaultCardStatus ||
      a.wipLimit !== b.wipLimit ||
      a.cards.length !== b.cards.length
    ) {
      return false;
    }

    for (let j = 0; j < a.cards.length; j++) {
      if (!areCardsEqual(a.cards[j], b.cards[j])) {
        return false;
      }
    }
  }

  return true;
}
