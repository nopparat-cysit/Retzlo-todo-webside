import type { CardColor } from "@/lib/theme/card-colors";
import type { ColumnIconId, ColumnThemeId } from "@/lib/kanban/column-settings";
import type { DifficultyScore } from "@/lib/kanban/difficulty";
import type { CardAssignee } from "@/lib/kanban/assignees";

export type { CardAssignee } from "@/lib/kanban/assignees";

export interface CustomPriority {
  id: string;
  label: string;
  color: string;
  level: number;
}

export type CardPriority = "LOW" | "MEDIUM" | "HIGH" | string;

export interface Card {
  id: string;
  title: string;
  description: string | null;
  note: string | null;
  position: number;
  status: CardStatus;
  color: CardColor;
  checklist: ChecklistItem[];
  startDate?: string | null;
  startDateAllDay?: boolean;
  dueDate: string | null;
  dueDateAllDay: boolean;
  priority: CardPriority;
  isStarred: boolean;
  columnId: string;
  rewardCoins?: number;
  privateCoins?: any;
  stickers?: string[];
  difficulty?: DifficultyScore | null;
  assigneeIds?: string[];
  assignees?: CardAssignee[];
  createdAt?: string;
  updatedAt?: string;
}

export type CardStatus = "TODO" | "DOING" | "WAITING" | "DONE" | string;

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ColumnWithCards {
  id: string;
  name: string;
  position: number;
  color: ColumnThemeId;
  icon: ColumnIconId;
  defaultCardStatus: CardStatus;
  wipLimit?: number | null;
  cards: Card[];
}

export interface BoardSummary {
  id: string;
  name: string;
  projectId: string;
  isPrivate: boolean;
  customPriorities?: CustomPriority[] | null;
  createdAt: string;
  memberUserIds?: string[];
  members?: Array<{
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      avatar?: string | null;
    };
  }>;
  cardCount?: number;
}

export interface CardCommentAuthor {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
}

export interface CardCommentItem {
  id: string;
  cardId: string;
  authorId: string;
  author: CardCommentAuthor;
  content: string;
  type: "COMMENT" | "SYSTEM";
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}