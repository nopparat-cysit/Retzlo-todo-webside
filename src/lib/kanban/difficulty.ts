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
    title: "ง่ายมาก (1 pt)",
    description: "งานสั้นๆ เล็กน้อย 15–30 นาที",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    activeChipClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    iconColorClass: "text-emerald-500"
  },
  3: {
    score: 3,
    label: "3",
    pointsLabel: "3 pts",
    title: "ง่าย (3 pts)",
    description: "งานพื้นฐานทั่วไป 1–2 ชั่วโมง",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    activeChipClass: "bg-cyan-600 text-white border-cyan-600 shadow-sm",
    iconColorClass: "text-cyan-500"
  },
  5: {
    score: 5,
    label: "5",
    pointsLabel: "5 pts",
    title: "ปานกลาง (5 pts)",
    description: "งานมาตรฐานประจำวัน ครึ่งวันถึง 1 วัน",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    activeChipClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
    iconColorClass: "text-amber-500"
  },
  8: {
    score: 8,
    label: "8",
    pointsLabel: "8 pts",
    title: "ยาก (8 pts)",
    description: "งานที่ต้องโฟกัสสูง หรือใช้เวลาข้ามวัน",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    activeChipClass: "bg-orange-600 text-white border-orange-600 shadow-sm",
    iconColorClass: "text-orange-500"
  },
  16: {
    score: 16,
    label: "16",
    pointsLabel: "16 pts",
    title: "ยากมาก (16 pts)",
    description: "งานชิ้นใหญ่ มีความซับซ้อน หรือต้องแยกย่อย",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    activeChipClass: "bg-rose-600 text-white border-rose-600 shadow-sm",
    iconColorClass: "text-rose-500"
  },
  21: {
    score: 21,
    label: "21",
    pointsLabel: "21 pts",
    title: "มหากาพย์ (21 pts)",
    description: "Epic Task ซับซ้อนขั้นสูงสุดที่ส่งผลกระทบวงกว้าง",
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
    title: "ง่ายมาก (1 pt)",
    description: "งานสั้นๆ เล็กน้อย 15–30 นาที",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    activeChipClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    iconColorClass: "text-emerald-500"
  },
  {
    score: 3,
    label: "3",
    pointsLabel: "3 pts",
    title: "ง่าย (3 pts)",
    description: "งานพื้นฐานทั่วไป 1–2 ชั่วโมง",
    color: "cyan",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    activeChipClass: "bg-cyan-600 text-white border-cyan-600 shadow-sm",
    iconColorClass: "text-cyan-500"
  },
  {
    score: 5,
    label: "5",
    pointsLabel: "5 pts",
    title: "ปานกลาง (5 pts)",
    description: "งานมาตรฐานประจำวัน ครึ่งวันถึง 1 วัน",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    activeChipClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
    iconColorClass: "text-amber-500"
  },
  {
    score: 8,
    label: "8",
    pointsLabel: "8 pts",
    title: "ยาก (8 pts)",
    description: "งานที่ต้องโฟกัสสูง หรือใช้เวลาข้ามวัน",
    color: "orange",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    activeChipClass: "bg-orange-600 text-white border-orange-600 shadow-sm",
    iconColorClass: "text-orange-500"
  },
  {
    score: 16,
    label: "16",
    pointsLabel: "16 pts",
    title: "ยากมาก (16 pts)",
    description: "งานชิ้นใหญ่ มีความซับซ้อน หรือต้องแยกย่อย",
    color: "rose",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    activeChipClass: "bg-rose-600 text-white border-rose-600 shadow-sm",
    iconColorClass: "text-rose-500"
  },
  {
    score: 21,
    label: "21",
    pointsLabel: "21 pts",
    title: "มหากาพย์ (21 pts)",
    description: "Epic Task ซับซ้อนขั้นสูงสุดที่ส่งผลกระทบวงกว้าง",
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

export const STORY_POINT_PRESETS: Record<string, { name: string; points: CustomStoryPoint[] }> = {
  retzlo: {
    name: "Retzlo Standard (1, 3, 5, 8, 16, 21)",
    points: DEFAULT_STORY_POINTS
  },
  fibonacci: {
    name: "Fibonacci (1, 2, 3, 5, 8, 13, 21)",
    points: [
      { score: 1, label: "1", pointsLabel: "1 pt", title: "ง่ายมาก (1 pt)", description: "งานสั้นๆ 15–30 นาที", color: "emerald", ...STORY_POINT_COLOR_CLASSES.emerald },
      { score: 2, label: "2", pointsLabel: "2 pts", title: "ง่าย (2 pts)", description: "งานสั้นๆ 30–60 นาที", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 3, label: "3", pointsLabel: "3 pts", title: "ปานกลาง (3 pts)", description: "งาน 1–2 ชั่วโมง", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 5, label: "5", pointsLabel: "5 pts", title: "มาตรฐาน (5 pts)", description: "งานครึ่งวันถึง 1 วัน", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 8, label: "8", pointsLabel: "8 pts", title: "ซับซ้อน (8 pts)", description: "งานที่ต้องโฟกัสข้ามวัน", color: "orange", ...STORY_POINT_COLOR_CLASSES.orange },
      { score: 13, label: "13", pointsLabel: "13 pts", title: "ยากมาก (13 pts)", description: "งานชิ้นใหญ่ มีความเสี่ยง", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 21, label: "21", pointsLabel: "21 pts", title: "มหากาพย์ (21 pts)", description: "Epic Task ซับซ้อนสูงสุด", color: "purple", ...STORY_POINT_COLOR_CLASSES.purple }
    ]
  },
  linear: {
    name: "Linear / ชั่วโมง (1, 2, 4, 8, 16, 24, 40)",
    points: [
      { score: 1, label: "1h", pointsLabel: "1 hr", title: "1 ชั่วโมง", description: "งานสั้นๆ", color: "emerald", ...STORY_POINT_COLOR_CLASSES.emerald },
      { score: 2, label: "2h", pointsLabel: "2 hrs", title: "2 ชั่วโมง", description: "งานครึ่งเช้า", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 4, label: "4h", pointsLabel: "4 hrs", title: "ครึ่งวัน (4 ชม.)", description: "งานครึ่งวัน", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 8, label: "8h", pointsLabel: "8 hrs", title: "1 วันเต็ม (8 ชม.)", description: "งาน 1 วันทำงาน", color: "orange", ...STORY_POINT_COLOR_CLASSES.orange },
      { score: 16, label: "16h", pointsLabel: "16 hrs", title: "2 วัน (16 ชม.)", description: "งาน 2 วัน", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 24, label: "24h", pointsLabel: "24 hrs", title: "3 วัน (24 ชม.)", description: "งาน 3 วัน", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 40, label: "40h", pointsLabel: "40 hrs", title: "1 สัปดาห์ (40 ชม.)", description: "งาน 1 สัปดาห์", color: "purple", ...STORY_POINT_COLOR_CLASSES.purple }
    ]
  },
  tshirt: {
    name: "T-Shirt Sizes (XS, S, M, L, XL, XXL)",
    points: [
      { score: 1, label: "XS", pointsLabel: "XS (1 pt)", title: "Extra Small (XS)", description: "งานจิ๋ว ไม่เกิน 30 นาที", color: "emerald", ...STORY_POINT_COLOR_CLASSES.emerald },
      { score: 2, label: "S", pointsLabel: "S (2 pts)", title: "Small (S)", description: "งานเล็ก 1-2 ชั่วโมง", color: "cyan", ...STORY_POINT_COLOR_CLASSES.cyan },
      { score: 3, label: "M", pointsLabel: "M (3 pts)", title: "Medium (M)", description: "งานขนาดกลาง ครึ่งวัน", color: "amber", ...STORY_POINT_COLOR_CLASSES.amber },
      { score: 5, label: "L", pointsLabel: "L (5 pts)", title: "Large (L)", description: "งานใหญ่ 1 วันเต็ม", color: "orange", ...STORY_POINT_COLOR_CLASSES.orange },
      { score: 8, label: "XL", pointsLabel: "XL (8 pts)", title: "Extra Large (XL)", description: "งานใหญ่พิเศษ 2-3 วัน", color: "rose", ...STORY_POINT_COLOR_CLASSES.rose },
      { score: 13, label: "XXL", pointsLabel: "XXL (13 pts)", title: "Double XL (XXL)", description: "งานมหากาพย์ 1 สัปดาห์ขึ้นไป", color: "purple", ...STORY_POINT_COLOR_CLASSES.purple }
    ]
  }
};

export function getStoredStoryPoints(boardId?: string): CustomStoryPoint[] {
  if (typeof window === "undefined") return DEFAULT_STORY_POINTS;
  try {
    const key = boardId ? `retzlo:story_points_${boardId}` : `retzlo:story_points_default`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_STORY_POINTS;
}

export function saveStoredStoryPoints(points: CustomStoryPoint[], boardId?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = boardId ? `retzlo:story_points_${boardId}` : `retzlo:story_points_default`;
    localStorage.setItem(key, JSON.stringify(points));
    window.dispatchEvent(
      new CustomEvent("retzlo:story-points-updated", {
        detail: { boardId, points }
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
