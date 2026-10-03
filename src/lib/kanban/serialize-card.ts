import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { CardPriority, CardStatus, ChecklistItem } from "@/types/kanban";
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
}>(card: T): Omit<T, "status" | "color" | "checklist" | "dueDate" | "priority" | "stickers"> & {
  status: CardStatus;
  color: string;
  checklist: ChecklistItem[];
  startDate: string | null;
  startDateAllDay: boolean;
  dueDate: string | null;
  dueDateAllDay: boolean;
  priority: CardPriority;
  isStarred: boolean;
  rewardCoins: number;
  privateCoins: unknown;
  stickers: ReturnType<typeof normalizeRetroStickerSelection>;
  difficulty: ReturnType<typeof extractDifficulty>;
  assigneeIds: string[];
} {
  const { status, color, checklist, dueDate, priority, stickers, ...rest } = card;
  return {
    ...rest,
    status: status as CardStatus,
    color: normalizeCardColor(color),
    checklist: Array.isArray(checklist) ? (checklist as ChecklistItem[]) : [],
    startDate: extractStartDate(card.privateCoins),
    startDateAllDay: extractStartDateAllDay(card.privateCoins),
    dueDate: dueDate ? dueDate.toISOString() : null,
    dueDateAllDay: card.dueDateAllDay,
    priority: (priority || "MEDIUM") as CardPriority,
    isStarred: card.isStarred,
    rewardCoins: card.rewardCoins,
    privateCoins: card.privateCoins,
    stickers: normalizeRetroStickerSelection(stickers),
    difficulty: extractDifficulty(card.privateCoins),
    assigneeIds: extractAssigneeIds(card.privateCoins),
  };
}
