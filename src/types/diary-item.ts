import type { CardColor } from "@/lib/theme/card-colors";
import type { DiaryChecklistItem, DiaryRewardCoinType } from "@/lib/diary/checklist";

export interface ProjectDiaryItem {
  id: string;
  title: string;
  description: string | null;
  color: CardColor;
  intervalDays: number;
  startDate: string;
  checklist: DiaryChecklistItem[];
  rewardCoins: number;
  rewardCoinType: DiaryRewardCoinType;
  rewardClaimedDates: string[];
  isStarred: boolean;
  isHidden: boolean;
  dueTime: string | null;
  projectId: string | null;
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
