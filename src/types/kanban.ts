import type { CardColor } from "@/lib/theme/card-colors";

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
  columnId: string;
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
