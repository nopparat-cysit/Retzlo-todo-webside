export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  avatar: string | null;
  bio?: string | null;
  globalRole: string;
  status: string;
  globalCoins?: number;
  aiQuota?: {
    tier: "FREE" | "PRO" | "ADMIN";
    credits: number;
    maxCredits: number;
    lastUsedAt?: string | null;
  };
  createdAt: string;
  counts?: {
    memberships: number;
    notes: number;
    diaryItems: number;
    cardComments?: number;
  };
  _count?: {
    memberships: number;
    notes: number;
    diaryItems: number;
    cardComments?: number;
  };
}

export interface AdminProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
  counts?: {
    members: number;
    boards: number;
    notes: number;
    diaryItems: number;
    invitations?: number;
    rewards?: number;
  };
  _count?: {
    members: number;
    boards: number;
    notes: number;
    diaryItems: number;
  };
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    coins: number;
    joinedAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
      globalRole: string;
      status: string;
    };
  }>;
  boards: Array<{
    id: string;
    name: string;
    columns: Array<{
      id: string;
      name: string;
      _count: { cards: number };
    }>;
    _count: { members: number };
  }>;
  _count: {
    notes: number;
    diaryItems: number;
    invitations: number;
    rewards: number;
  };
}

export interface AdminRedemption {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  reward: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    project?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface AdminAttachment {
  id: string;
  name: string;
  url: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
  card?: {
    id: string;
    title: string;
    column?: {
      name: string;
      board?: {
        id: string;
        name: string;
        project?: {
          id: string;
          name: string;
        };
      };
    };
  } | null;
}

export interface DecoyHit {
  id: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface AdminAuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetType: "USER" | "PROJECT" | "REWARD" | "STORAGE" | "AI" | "BROADCAST";
  targetId?: string;
  targetName?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface SystemBroadcast {
  id: string;
  message: string;
  type: "info" | "warning" | "urgent";
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export interface AdminOverviewData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    totalBoards: number;
    totalCards: number;
    totalNotes: number;
    totalDiaryItems: number;
    totalAttachments: number;
    pendingRedemptions: number;
    totalCoinsCirculation: number;
  };
  recentUsers: AdminUser[];
  recentProjects: Array<{
    id: string;
    name: string;
    type: string;
    createdAt: string;
    _count: { members: number; boards: number };
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    details: unknown;
    createdAt: string;
    user?: {
      name: string | null;
      email: string;
      avatar: string | null;
    };
  }>;
  broadcast: SystemBroadcast | null;
  decoyHitsCount: number;
  systemHealth: {
    database: string;
    dbLatencyMs: number;
    environment: string;
  };
}

export type AdminTab =
  | "overview"
  | "users"
  | "workspaces"
  | "rewards"
  | "ai"
  | "storage"
  | "security"
  | "operations";
