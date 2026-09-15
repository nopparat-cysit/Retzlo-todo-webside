export const DIFFICULTY_SCORES = [1, 3, 5, 8, 16, 21] as const;

export type DifficultyScore = (typeof DIFFICULTY_SCORES)[number];

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

export function isValidDifficultyScore(value: unknown): value is DifficultyScore {
  return typeof value === "number" && (DIFFICULTY_SCORES as readonly number[]).includes(value);
}

export function sanitizeDifficultyScore(value: unknown): DifficultyScore | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (Number.isFinite(num) && isValidDifficultyScore(num)) {
    return num;
  }

  return null;
}

export function getDifficultyMetadata(score: DifficultyScore | null | undefined): DifficultyMetadata | null {
  if (!score || !isValidDifficultyScore(score)) {
    return null;
  }
  return DIFFICULTY_CONFIGS[score] ?? null;
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
