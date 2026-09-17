import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { CardStatus, ChecklistItem } from "@/types/kanban";
import { normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import { extractDifficulty } from "@/lib/kanban/difficulty";
import { extractAssigneeIds } from "@/lib/kanban/assignees";
import { extractStartDate, extractStartDateAllDay } from "@/lib/kanban/due-date";

export function serializeCard<T extends {
  status: string;
  color: string;
  checklist: unknown;
  dueDate: Date | null;
  dueDateAllDay: boolean;
  priority: string;
  isStarred: boolean;
  rewardCoins: number;
  privateCoins: unknown;
  stickers: unknown;
  note?: string | null;
}>(card: T) {
  return {
    ...card,
    status: card.status as CardStatus,
    color: normalizeCardColor(card.color),
    checklist: Array.isArray(card.checklist) ? (card.checklist as ChecklistItem[]) : [],
    startDate: extractStartDate(card.privateCoins),
    startDateAllDay: extractStartDateAllDay(card.privateCoins),
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    dueDateAllDay: card.dueDateAllDay,
    priority: card.priority as "LOW" | "MEDIUM" | "HIGH",
    isStarred: card.isStarred,
    rewardCoins: card.rewardCoins,
    privateCoins: card.privateCoins,
    stickers: normalizeRetroStickerSelection(card.stickers),
    difficulty: extractDifficulty(card.privateCoins),
    assigneeIds: extractAssigneeIds(card.privateCoins),
  };
}
