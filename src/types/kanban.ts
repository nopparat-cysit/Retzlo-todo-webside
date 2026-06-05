import type { CardColor } from "@/lib/theme/card-colors";

export type CardPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  status: CardStatus;
  color: CardColor;
  checklist: ChecklistItem[];
  dueDate: string | null;
  dueDateAllDay: boolean;
  priority: CardPriority;
  isStarred: boolean;
  columnId: string;
  rewardCoins?: number;
  privateCoins?: any;
  stickers?: string[];
}

export type CardStatus = "TODO" | "DOING" | "WAITING" | "DONE";

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ColumnWithCards {
  id: string;
  name: string;
  position: number;
  cards: Card[];
}
