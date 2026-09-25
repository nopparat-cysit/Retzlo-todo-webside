export interface BoardColumnInfo {
  id: string;
  name: string;
  position?: number;
  color?: string;
  icon?: string;
  defaultCardStatus?: string;
  wipLimit?: number | null;
  cardCount?: number;
}

export interface BoardMemberInfo {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
  role?: string;
}
