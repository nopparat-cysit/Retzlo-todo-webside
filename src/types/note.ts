import type { CardColor } from "@/lib/theme/card-colors";

export interface NoteFolderItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  projectId: string;
  authorId: string;
  _count?: { notes: number };
  createdAt: string;
  updatedAt: string;
}

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
  boardId?: string | null;
  board?: {
    id: string;
    name: string;
  } | null;
  folderId?: string | null;
  folder?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
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
