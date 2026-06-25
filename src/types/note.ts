import type { CardColor } from "@/lib/theme/card-colors";

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  emoji: string;
  color: CardColor;
  isStarred: boolean;
  isHidden: boolean;
  completedAt: string | null;
  dueDate: string | null;
  dueDateAllDay: boolean;
  projectId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string | null;
    email: string;
  };
  canManage: boolean;
  canToggleHidden: boolean;
}
