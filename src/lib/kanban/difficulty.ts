export const DIFFICULTY_SCORES = [1, 3, 5, 8, 16, 21] as const;

export type DifficultyScore = (typeof DIFFICULTY_SCORES)[number] | number;

export interface DifficultyMetadata {
  score: DifficultyScore;
  label: string;
  pointsLabel: string;
  title: string;
  description: string;
  badgeClass: string;
  activeChipClass: string;
  iconColorClass: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyScore, DifficultyMetadata> = {
  1: {
    score: 1,
    label: "1",
    pointsLabel: "1 pt",
    title: "Very Easy (1 pt)",
    description: "Quick task, 15–30 mins",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    activeChipClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    iconColorClass: "text-emerald-500"
  },
  3: {
    score: 3,
    label: "3",
    pointsLabel: "3 pts",
    title: "Easy (3 pts)",
    description: "Standard basic task, 1–2 hours",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    activeChipClass: "bg-cyan-600 text-white border-cyan-600 shadow-sm",
    iconColorClass: "text-cyan-500"
  },
  5: {
    score: 5,
    label: "5",
    pointsLabel: "5 pts",
    title: "Medium (5 pts)",
    description: "Regular daily task, half day to 1 day",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    activeChipClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
    iconColorClass: "text-amber-500"
  },
  8: {
    score: 8,
    label: "8",
    pointsLabel: "8 pts",
    title: "Hard (8 pts)",
    description: "High-focus task, spans multiple days",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    activeChipClass: "bg-orange-600 text-white border-orange-600 shadow-sm",
    iconColorClass: "text-orange-500"
  },
  16: {
    score: 16,
    label: "16",
    pointsLabel: "16 pts",
    title: "Very Hard (16 pts)",
    description: "Large complex task, requires breakdown",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    activeChipClass: "bg-rose-600 text-white border-rose-600 shadow-sm",
    iconColorClass: "text-rose-500"
  },
  21: {
    score: 21,
    label: "21",
    pointsLabel: "21 pts",
    title: "Epic (21 pts)",
    description: "High-complexity epic with broad impact",
    badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
    activeChipClass: "bg-purple-600 text-white border-purple-600 shadow-sm",
    iconColorClass: "text-purple-500"
  }
};

export interface CustomStoryPoint {
  score: number;
  label: string;
  pointsLabel: string;
  title: string;
  description: string;
  color?: string;
  badgeClass?: string;
  activeChipClass?: string;
  iconColorClass?: string;
}

export const DEFAULT_STORY_POINTS: CustomStoryPoint[] = [
  {
    score: 1,
    label: "1",
    pointsLabel: "1 pt",
    title: "Very Easy (1 pt)",
    description: "Quick task, 15–30 mins",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    activeChipClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    iconColorClass: "text-emerald-500"
  },
  {
    score: 3,
    label: "3",
    pointsLabel: "3 pts",
    title: "Easy (3 pts)",
    description: "Standard basic task, 1–2 hours",
    color: "cyan",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    activeChipClass: "bg-cyan-600 text-white border-cyan-600 shadow-sm",
    iconColorClass: "text-cyan-500"
  },
  {
    score: 5,
    label: "5",
    pointsLabel: "5 pts",
    title: "Medium (5 pts)",
    description: "Regular daily task, half day to 1 day",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    activeChipClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
    iconColorClass: "text-amber-500"
  },
  {
    score: 8,
    label: "8",
    pointsLabel: "8 pts",
    title: "Hard (8 pts)",
    description: "High-focus task, spans multiple days",
    color: "orange",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    activeChipClass: "bg-orange-600 text-white border-orange-600 shadow-sm",
    iconColorClass: "text-orange-500"
  },
  {
    score: 16,
    label: "16",
    pointsLabel: "16 pts",
    title: "Very Hard (16 pts)",
    description: "Large complex task, requires breakdown",
    color: "rose",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    activeChipClass: "bg-rose-600 text-white border-rose-600 shadow-sm",
    iconColorClass: "text-rose-500"
  },
  {
    score: 21,
    label: "21",
    pointsLabel: "21 pts",
    title: "Epic (21 pts)",
    description: "High-complexity epic with broad impact",
    color: "purple",
    badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
    activeChipClass: "bg-purple-600 text-white border-purple-600 shadow-sm",
    iconColorClass: "text-purple-500"
  }
];

export const STORY_POINT_COLOR_CLASSES: Record<string, { badgeClass: string; activeChipClass: string; iconColorClass: string }> = {
  emerald: {
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    activeChipClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    iconColorClass: "text-emerald-500"
  },
  cyan: {
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    activeChipClass: "bg-cyan-600 text-white border-cyan-600 shadow-sm",
    iconColorClass: "text-cyan-500"
  },
  amber: {
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    activeChipClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
    iconColorClass: "text-amber-500"
  },
  orange: {
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    activeChipClass: "bg-orange-600 text-white border-orange-600 shadow-sm",
    iconColorClass: "text-orange-500"
  },
  rose: {
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    activeChipClass: "bg-rose-600 text-white border-rose-600 shadow-sm",
    iconColorClass: "text-rose-500"
  },
  purple: {
    badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
    activeChipClass: "bg-purple-600 text-white border-purple-600 shadow-sm",
    iconColorClass: "text-purple-500"
  },
  indigo: {
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    activeChipClass: "bg-indigo-600 text-white border-indigo-600 shadow-sm",
    iconColorClass: "text-indigo-500"
  }
};

export interface StoryPointWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "Effort" | "Agile" | "Time" | "Sizing" | "Focus" | "Risk" | "Custom";
  icon: string;
  points: CustomStoryPoint[];
}

export const STORY_POINT_WORKFLOW_TEMPLATES: Record<string, StoryPointWorkflowTemplate> = {
  retzlo: {
    id: "retzlo",
    name: "Retzlo Standard",
    description: "Standard effort points evaluation scale (1, 3, 5, 8, 16, 21 pts)",
    category: "Effort",
    icon: "zap",
    points: DEFAULT_STORY_POINTS
  },
  fibonacci: {
    id: "fibonacci",
    name: "Fibonacci Sequence",
    description: "Standard Agile Scrum Fibonacci sequence for sprint planning (1, 2, 3, 5, 8, 13, 21)",
    category: "Agile",
    icon: "target",
    points: [
      { score: 1, label: "1", pointsLabel: "1 pt", title: "Very Easy (1 pt)", description: "Quick task, 15–30 mins", color: "emerald", ...STORY_POINT_COLOR_CLASSES.emerald },
      { score: 2, label: "2", pointsLabel: "2 pts", title: "Easy (2 pts)", description: "Short task, 30–60 mins", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 3, label: "3", pointsLabel: "3 pts", title: "Medium (3 pts)", description: "Standard task, 1–2 hours", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 5, label: "5", pointsLabel: "5 pts", title: "Standard (5 pts)", description: "Half day to 1 day", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 8, label: "8", pointsLabel: "8 pts", title: "Complex (8 pts)", description: "High focus, multiple days", color: "orange", ...STORY_POINT_COLOR_CLASSES.orange },
      { score: 13, label: "13", pointsLabel: "13 pts", title: "Very Hard (13 pts)", description: "Large task with risks", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 21, label: "21", pointsLabel: "21 pts", title: "Epic (21 pts)", description: "Highest complexity epic", color: "purple", ...STORY_POINT_COLOR_CLASSES.purple }
    ]
  },
  linear: {
    id: "linear",
    name: "Linear / Working Hours",
    description: "Estimate based on working hours: 1h, 2h, 4h, 8h, 16h, 24h, 40h",
    category: "Time",
    icon: "clock",
    points: [
      { score: 1, label: "1h", pointsLabel: "1 hr", title: "1 Hour", description: "Quick task", color: "emerald", ...STORY_POINT_COLOR_CLASSES.emerald },
      { score: 2, label: "2h", pointsLabel: "2 hrs", title: "2 Hours", description: "Half-morning task", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 4, label: "4h", pointsLabel: "4 hrs", title: "Half Day (4 hrs)", description: "Half-day task", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 8, label: "8h", pointsLabel: "8 hrs", title: "Full Day (8 hrs)", description: "1 full workday", color: "orange", ...STORY_POINT_COLOR_CLASSES.orange },
      { score: 16, label: "16h", pointsLabel: "16 hrs", title: "2 Days (16 hrs)", description: "2 workdays", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 24, label: "24h", pointsLabel: "24 hrs", title: "3 Days (24 hrs)", description: "3 workdays", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 40, label: "40h", pointsLabel: "40 hrs", title: "1 Week (40 hrs)", description: "1 full workweek", color: "purple", ...STORY_POINT_COLOR_CLASSES.purple }
    ]
  },
  tshirt: {
    id: "tshirt",
    name: "T-Shirt Sizes",
    description: "Intuitive sizing scale: XS, S, M, L, XL, XXL",
    category: "Sizing",
    icon: "sparkles",
    points: [
      { score: 1, label: "XS", pointsLabel: "XS (1 pt)", title: "Extra Small (XS)", description: "Tiny task, under 30 mins", color: "emerald", ...STORY_POINT_COLOR_CLASSES.emerald },
      { score: 2, label: "S", pointsLabel: "S (2 pts)", title: "Small (S)", description: "Small task, 1–2 hours", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 3, label: "M", pointsLabel: "M (3 pts)", title: "Medium (M)", description: "Medium task, half day", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 5, label: "L", pointsLabel: "L (5 pts)", title: "Large (L)", description: "Large task, full day", color: "orange", ...STORY_POINT_COLOR_CLASSES.orange },
      { score: 8, label: "XL", pointsLabel: "XL (8 pts)", title: "Extra Large (XL)", description: "Extra large task, 2–3 days", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 13, label: "XXL", pointsLabel: "XXL (13 pts)", title: "Double XL (XXL)", description: "Epic task, 1 week or more", color: "purple", ...STORY_POINT_COLOR_CLASSES.purple }
    ]
  },
  pomodoro: {
    id: "pomodoro",
    name: "Pomodoro Focus Blocks",
    description: "Track tasks by 25-minute focus intervals (1, 2, 4, 8, 16 Pomodoros)",
    category: "Focus",
    icon: "timer",
    points: [
      { score: 1, label: "1🍅", pointsLabel: "1 Pomo (25m)", title: "1 Pomodoro (25m)", description: "Single focus block", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 2, label: "2🍅", pointsLabel: "2 Pomo (1h)", title: "2 Pomodoros (1h)", description: "Short task, 2 focus blocks", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 4, label: "4🍅", pointsLabel: "4 Pomo (2h)", title: "4 Pomodoros (2h)", description: "Half-morning or afternoon task", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 8, label: "8🍅", pointsLabel: "8 Pomo (4h)", title: "8 Pomodoros (Half Day)", description: "Deep focus task", color: "indigo", ...STORY_POINT_COLOR_CLASSES.indigo },
      { score: 16, label: "16🍅", pointsLabel: "16 Pomo (1 Day)", title: "16 Pomodoros (Full Day)", description: "Full workday task", color: "purple", ...STORY_POINT_COLOR_CLASSES.purple }
    ]
  },
  risk_matrix: {
    id: "risk_matrix",
    name: "Complexity & Risk",
    description: "Estimate system complexity and operational risk (1, 3, 5, 10, 20 pts)",
    category: "Risk",
    icon: "flame",
    points: [
      { score: 1, label: "Low", pointsLabel: "1 pt (Low)", title: "Very Low Risk (1 pt)", description: "Routine task, no risk", color: "emerald", ...STORY_POINT_COLOR_CLASSES.emerald },
      { score: 3, label: "Mild", pointsLabel: "3 pts (Mild)", title: "Mild Risk (3 pts)", description: "Straightforward task", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 5, label: "Moderate", pointsLabel: "5 pts (Mod)", title: "Moderate Risk (5 pts)", description: "External dependencies", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 10, label: "High", pointsLabel: "10 pts (High)", title: "High Risk (10 pts)", description: "Architectural changes", color: "orange", ...STORY_POINT_COLOR_CLASSES.orange },
      { score: 20, label: "Critical", pointsLabel: "20 pts (Crit)", title: "Critical Risk (20 pts)", description: "Core system migration", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose }
    ]
  }
};

export const STORY_POINT_PRESETS = STORY_POINT_WORKFLOW_TEMPLATES;

export function getStoredStoryPoints(boardId?: string): CustomStoryPoint[] {
  if (typeof window === "undefined") return DEFAULT_STORY_POINTS;
  try {
    const key = boardId ? `retzlo:story_points_${boardId}` : `retzlo:story_points_default`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          score: Number(item.score)
        }));
      }
    }
  } catch {}
  return DEFAULT_STORY_POINTS;
}

export function saveStoredStoryPoints(points: CustomStoryPoint[], boardId?: string) {
  if (typeof window === "undefined") return;
  try {
    const sanitized = points.map((item) => ({
      ...item,
      score: Number(item.score)
    }));
    const key = boardId ? `retzlo:story_points_${boardId}` : `retzlo:story_points_default`;
    localStorage.setItem(key, JSON.stringify(sanitized));
    if (boardId) {
      localStorage.setItem("retzlo:story_points_default", JSON.stringify(sanitized));
    }
    window.dispatchEvent(
      new CustomEvent("retzlo:story-points-updated", {
        detail: { boardId, points: sanitized }
      })
    );
  } catch {}
}

export function isValidDifficultyScore(value: unknown): value is DifficultyScore {
  return typeof value === "number" && (DIFFICULTY_SCORES as readonly number[]).includes(value as any);
}

export function sanitizeDifficultyScore(value: unknown): DifficultyScore | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (Number.isFinite(num) && num > 0 && num <= 100) {
    return num as DifficultyScore;
  }

  return null;
}

export function getDifficultyMetadata(
  score: DifficultyScore | number | null | undefined,
  customList?: CustomStoryPoint[]
): DifficultyMetadata | null {
  if (!score || score <= 0) {
    return null;
  }

  if (customList && customList.length > 0) {
    const found = customList.find((p) => p.score === score);
    if (found) {
      return {
        score: found.score as DifficultyScore,
        label: found.label || String(found.score),
        pointsLabel: found.pointsLabel || `${found.score} pts`,
        title: found.title || `${found.score} pts`,
        description: found.description || "",
        badgeClass: found.badgeClass || (found.color && STORY_POINT_COLOR_CLASSES[found.color]?.badgeClass) || "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
        activeChipClass: found.activeChipClass || (found.color && STORY_POINT_COLOR_CLASSES[found.color]?.activeChipClass) || "bg-indigo-600 text-white border-indigo-600 shadow-sm",
        iconColorClass: found.iconColorClass || (found.color && STORY_POINT_COLOR_CLASSES[found.color]?.iconColorClass) || "text-indigo-500"
      };
    }
  }

  if (isValidDifficultyScore(score)) {
    return DIFFICULTY_CONFIGS[score] ?? null;
  }

  return {
    score: score as DifficultyScore,
    label: String(score),
    pointsLabel: `${score} pts`,
    title: `${score} pts`,
    description: `Story points: ${score}`,
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    activeChipClass: "bg-indigo-600 text-white border-indigo-600 shadow-sm",
    iconColorClass: "text-indigo-500"
  };
}

export function calculateColumnPoints(
  cards: Array<{ difficulty?: DifficultyScore | number | null } | null | undefined>
): number {
  if (!Array.isArray(cards) || cards.length === 0) {
    return 0;
  }

  return cards.reduce<number>((total, card) => {
    if (!card) return total;
    const score = sanitizeDifficultyScore(card.difficulty);
    return total + (score ?? 0);
  }, 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function extractDifficulty(privateCoins: unknown): DifficultyScore | null {
  if (!isRecord(privateCoins)) {
    return null;
  }
  return sanitizeDifficultyScore(privateCoins.difficulty);
}

export function withDifficulty(privateCoins: unknown, difficulty: DifficultyScore | null | undefined): Record<string, unknown> {
  const next = isRecord(privateCoins) ? { ...privateCoins } : {};
  const validScore = sanitizeDifficultyScore(difficulty);

  if (validScore === null) {
    delete next.difficulty;
  } else {
    next.difficulty = validScore;
  }

  return next;
}
