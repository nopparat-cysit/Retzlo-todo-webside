import type { CardColor } from "@/lib/theme/card-colors";

export interface ProjectDiaryItem {
  id: string;
  title: string;
  description: string | null;
  color: CardColor;
  intervalDays: number;
  startDate: string;
  isStarred: boolean;
  isHidden: boolean;
  projectId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  canManage: boolean;
  canToggleHidden: boolean;
  author: {
    name: string | null;
    email: string;
  };
}
