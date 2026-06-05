import type { CardColor } from "@/lib/theme/card-colors";

export interface DiaryTask {
  id: string;
  title: string;
  description: string | null;
  color: CardColor;
  dueDate: string;
  stickers?: string[];
  column: {
    name: string;
    boardId: string;
  };
}
