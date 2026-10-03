import type { CustomPriority } from "@/types/kanban";

export const MAX_BOARD_PRIORITIES = 10;
export const MIN_BOARD_PRIORITIES = 1;

export interface PriorityColorConfig {
  id: string;
  name: string;
  nameTh: string;
  swatchClass: string;
  pillClass: string;
  textClass: string;
  dotClass: string;
  borderClass: string;
}

export const PRIORITY_COLOR_OPTIONS: Record<string, PriorityColorConfig> = {
  rose: {
    id: "rose",
    name: "Rose / Red",
    nameTh: "แดงกุหลาบ (ด่วนที่สุด)",
    swatchClass: "bg-red-500",
    pillClass: "border-red-500/30 bg-red-500/15 text-red-600 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-300",
    textClass: "text-red-600 dark:text-red-400",
    dotClass: "bg-red-500",
    borderClass: "border-red-500/30"
  },
  orange: {
    id: "orange",
    name: "Orange",
    nameTh: "ส้มสดใส (สำคัญมาก)",
    swatchClass: "bg-orange-500",
    pillClass: "border-orange-500/30 bg-orange-500/15 text-orange-600 dark:border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-300",
    textClass: "text-orange-600 dark:text-orange-400",
    dotClass: "bg-orange-500",
    borderClass: "border-orange-500/30"
  },
  amber: {
    id: "amber",
    name: "Amber",
    nameTh: "อำพันทอง (ระวัง/ด่วน)",
    swatchClass: "bg-amber-500",
    pillClass: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-300",
    textClass: "text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500",
    borderClass: "border-amber-500/30"
  },
  yellow: {
    id: "yellow",
    name: "Yellow",
    nameTh: "เหลืองอบอุ่น",
    swatchClass: "bg-yellow-400",
    pillClass: "border-yellow-500/30 bg-yellow-400/15 text-yellow-700 dark:border-yellow-400/30 dark:bg-yellow-400/20 dark:text-yellow-300",
    textClass: "text-yellow-600 dark:text-yellow-400",
    dotClass: "bg-yellow-400",
    borderClass: "border-yellow-500/30"
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    nameTh: "เขียวมรกต (ปกติ/สำเร็จ)",
    swatchClass: "bg-emerald-500",
    pillClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300",
    textClass: "text-emerald-600 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-500/30"
  },
  teal: {
    id: "teal",
    name: "Teal",
    nameTh: "เขียวอมฟ้า",
    swatchClass: "bg-teal-500",
    pillClass: "border-teal-500/30 bg-teal-500/15 text-teal-700 dark:border-teal-400/30 dark:bg-teal-500/20 dark:text-teal-300",
    textClass: "text-teal-600 dark:text-teal-400",
    dotClass: "bg-teal-500",
    borderClass: "border-teal-500/30"
  },
  sky: {
    id: "sky",
    name: "Sky Blue",
    nameTh: "ฟ้าสว่าง (ความสำคัญต่ำ)",
    swatchClass: "bg-sky-500",
    pillClass: "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-300",
    textClass: "text-sky-600 dark:text-sky-400",
    dotClass: "bg-sky-500",
    borderClass: "border-sky-500/30"
  },
  blue: {
    id: "blue",
    name: "Classic Blue",
    nameTh: "น้ำเงินคลาสสิก",
    swatchClass: "bg-blue-500",
    pillClass: "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300",
    textClass: "text-blue-600 dark:text-blue-400",
    dotClass: "bg-blue-500",
    borderClass: "border-blue-500/30"
  },
  indigo: {
    id: "indigo",
    name: "Indigo",
    nameTh: "อินดิโก้ (ปานกลาง)",
    swatchClass: "bg-indigo-500",
    pillClass: "border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300",
    textClass: "text-indigo-600 dark:text-indigo-400",
    dotClass: "bg-indigo-500",
    borderClass: "border-indigo-500/30"
  },
  purple: {
    id: "purple",
    name: "Purple",
    nameTh: "ม่วงลาเวนเดอร์",
    swatchClass: "bg-purple-500",
    pillClass: "border-purple-500/30 bg-purple-500/15 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/20 dark:text-purple-300",
    textClass: "text-purple-600 dark:text-purple-400",
    dotClass: "bg-purple-500",
    borderClass: "border-purple-500/30"
  },
  pink: {
    id: "pink",
    name: "Pink",
    nameTh: "ชมพูสดใส",
    swatchClass: "bg-pink-500",
    pillClass: "border-pink-500/30 bg-pink-500/15 text-pink-700 dark:border-pink-400/30 dark:bg-pink-500/20 dark:text-pink-300",
    textClass: "text-pink-600 dark:text-pink-400",
    dotClass: "bg-pink-500",
    borderClass: "border-pink-500/30"
  },
  stone: {
    id: "stone",
    name: "Stone / Gray",
    nameTh: "เทาศิลา (งานทั่วไป/Backlog)",
    swatchClass: "bg-stone-500",
    pillClass: "border-stone-400/30 bg-stone-500/15 text-stone-700 dark:border-stone-400/30 dark:bg-stone-500/20 dark:text-stone-300",
    textClass: "text-stone-600 dark:text-stone-400",
    dotClass: "bg-stone-500",
    borderClass: "border-stone-400/30"
  }
};

export const DEFAULT_PRIORITIES: CustomPriority[] = [
  { id: "HIGH", label: "High", color: "rose", level: 1 },
  { id: "MEDIUM", label: "Medium", color: "indigo", level: 2 },
  { id: "LOW", label: "Low", color: "sky", level: 3 }
];

export function resolveBoardPriorities(customPriorities?: unknown): CustomPriority[] {
  if (!Array.isArray(customPriorities) || customPriorities.length === 0) {
    return DEFAULT_PRIORITIES;
  }

  const validItems: CustomPriority[] = [];

  for (let i = 0; i < customPriorities.length; i++) {
    const item = customPriorities[i] as any;
    if (!item || typeof item !== "object") continue;

    const id = String(item.id || `priority_${i + 1}`).trim();
    const label = String(item.label || id).trim();
    if (!label) continue;

    const rawColor = String(item.color || "indigo").toLowerCase();
    const color = PRIORITY_COLOR_OPTIONS[rawColor] ? rawColor : "indigo";
    const level = typeof item.level === "number" && item.level >= 1 && item.level <= 10 ? item.level : i + 1;

    validItems.push({
      id,
      label: label.slice(0, 30),
      color,
      level
    });

    if (validItems.length >= MAX_BOARD_PRIORITIES) break;
  }

  if (validItems.length === 0) {
    return DEFAULT_PRIORITIES;
  }

  // Sort by level ascending
  return validItems.sort((a, b) => a.level - b.level);
}

export function getPriorityColorConfig(colorKey: string): PriorityColorConfig {
  const normalized = colorKey?.toLowerCase();
  return (
    PRIORITY_COLOR_OPTIONS[normalized] ||
    (normalized === "red" ? PRIORITY_COLOR_OPTIONS.rose : undefined) ||
    (normalized === "blue" ? PRIORITY_COLOR_OPTIONS.blue : undefined) ||
    (normalized === "green" ? PRIORITY_COLOR_OPTIONS.emerald : undefined) ||
    PRIORITY_COLOR_OPTIONS.indigo
  );
}

export interface ResolvedPriorityMeta {
  id: string;
  label: string;
  color: string;
  level: number;
  colorConfig: PriorityColorConfig;
  pillClass: string;
  textClass: string;
  dotClass: string;
}

export function getPriorityMeta(
  priorityId: string | null | undefined,
  boardPriorities: CustomPriority[] = DEFAULT_PRIORITIES
): ResolvedPriorityMeta {
  const priorities = boardPriorities.length > 0 ? boardPriorities : DEFAULT_PRIORITIES;
  const targetId = (priorityId || "MEDIUM").trim();

  // 1. Direct match by ID or Label (exact or case-insensitive)
  const exact = priorities.find(
    (p) =>
      p.id === targetId ||
      p.id.toLowerCase() === targetId.toLowerCase() ||
      p.label.toLowerCase() === targetId.toLowerCase()
  );
  if (exact) {
    const config = getPriorityColorConfig(exact.color);
    return {
      id: exact.id,
      label: exact.label,
      color: exact.color,
      level: exact.level,
      colorConfig: config,
      pillClass: config.pillClass,
      textClass: config.textClass,
      dotClass: config.dotClass
    };
  }

  // 2. Fallbacks for standard legacy enum names if renamed
  if (targetId.toUpperCase() === "HIGH") {
    const highest = priorities[0];
    const config = getPriorityColorConfig(highest?.color || "rose");
    return {
      id: "HIGH",
      label: highest ? highest.label : "High",
      color: highest?.color || "rose",
      level: highest?.level || 1,
      colorConfig: config,
      pillClass: config.pillClass,
      textClass: config.textClass,
      dotClass: config.dotClass
    };
  }

  if (targetId.toUpperCase() === "LOW") {
    const lowest = priorities[priorities.length - 1];
    const config = getPriorityColorConfig(lowest?.color || "sky");
    return {
      id: "LOW",
      label: lowest ? lowest.label : "Low",
      color: lowest?.color || "sky",
      level: lowest?.level || priorities.length,
      colorConfig: config,
      pillClass: config.pillClass,
      textClass: config.textClass,
      dotClass: config.dotClass
    };
  }

  if (targetId.toUpperCase() === "MEDIUM") {
    const midIndex = Math.floor(priorities.length / 2);
    const mid = priorities[midIndex] || priorities[0];
    const config = getPriorityColorConfig(mid?.color || "indigo");
    return {
      id: "MEDIUM",
      label: mid ? mid.label : "Medium",
      color: mid?.color || "indigo",
      level: mid?.level || 2,
      colorConfig: config,
      pillClass: config.pillClass,
      textClass: config.textClass,
      dotClass: config.dotClass
    };
  }

  // 3. Fallback for custom undefined strings
  const fallbackConfig = PRIORITY_COLOR_OPTIONS.indigo;
  return {
    id: targetId,
    label: targetId,
    color: "indigo",
    level: 99,
    colorConfig: fallbackConfig,
    pillClass: fallbackConfig.pillClass,
    textClass: fallbackConfig.textClass,
    dotClass: fallbackConfig.dotClass
  };
}

export function sortCardsByPriority<T extends { priority?: string | null }>(
  cards: T[],
  direction: "asc" | "desc",
  boardPriorities: CustomPriority[] = DEFAULT_PRIORITIES
): T[] {
  const getLevel = (priority?: string | null) => {
    const meta = getPriorityMeta(priority, boardPriorities);
    return meta.level;
  };

  return [...cards].sort((a, b) => {
    const levelA = getLevel(a.priority);
    const levelB = getLevel(b.priority);
    // level 1 = highest urgency, level 10 = lowest urgency
    if (direction === "desc") {
      // Urgent first: level 1 before level 2
      return levelA - levelB;
    } else {
      // Low first: level 10 before level 1
      return levelB - levelA;
    }
  });
}
