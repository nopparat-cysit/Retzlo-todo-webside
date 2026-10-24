import omikujiData from "@/data/omikuji-100.json";
import { OmikujiFortuneItem, OmikujiRank } from "@/types/omikuji";

const fortunes: OmikujiFortuneItem[] = omikujiData as OmikujiFortuneItem[];

export interface RankVisualMeta {
  rank: OmikujiRank;
  kanji: string;
  romaji: string;
  th: string;
  en: string;
  sealColor: string; // Tailwind hex or class
  bgGradient: string;
  badgeClass: string;
  textColor: string;
}

export const RANK_VISUALS: Record<string, RankVisualMeta> = {
  Daikichi: {
    rank: "Daikichi",
    kanji: "大吉",
    romaji: "Daikichi",
    th: "โชคดีมาก",
    en: "Great Blessing",
    sealColor: "#b91c1c", // Terracotta / Crimson wax
    bgGradient: "from-amber-500/10 via-red-500/15 to-orange-500/10",
    badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60",
    textColor: "text-red-700 dark:text-red-400"
  },
  Kichi: {
    rank: "Kichi",
    kanji: "吉",
    romaji: "Kichi",
    th: "โชคดี",
    en: "Good Fortune",
    sealColor: "#d97706", // Antique Gold
    bgGradient: "from-amber-500/15 via-yellow-500/10 to-amber-600/10",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
    textColor: "text-amber-700 dark:text-amber-400"
  },
  Chukichi: {
    rank: "Chukichi",
    kanji: "中吉",
    romaji: "Chukichi",
    th: "โชคปานกลาง",
    en: "Middle Blessing",
    sealColor: "#c2410c", // Warm Rust
    bgGradient: "from-orange-500/15 via-amber-500/10 to-orange-600/10",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60",
    textColor: "text-orange-700 dark:text-orange-400"
  },
  Shokichi: {
    rank: "Shokichi",
    kanji: "小吉",
    romaji: "Shokichi",
    th: "โชคดีเล็กน้อย",
    en: "Small Blessing",
    sealColor: "#059669", // Emerald Pine
    bgGradient: "from-emerald-500/10 via-teal-500/10 to-emerald-600/10",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
    textColor: "text-emerald-700 dark:text-emerald-400"
  },
  Hankichi: {
    rank: "Hankichi",
    kanji: "半吉",
    romaji: "Hankichi",
    th: "โชคกึ่งดี",
    en: "Half Blessing",
    sealColor: "#b45309", // Warm Ochre
    bgGradient: "from-yellow-500/15 via-stone-500/10 to-amber-600/10",
    badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900/60",
    textColor: "text-yellow-700 dark:text-yellow-400"
  },
  Suekichi: {
    rank: "Suekichi",
    kanji: "末吉",
    romaji: "Suekichi",
    th: "โชคดีในอนาคต",
    en: "Future Blessing",
    sealColor: "#0284c7", // Cerulean
    bgGradient: "from-sky-500/10 via-blue-500/10 to-sky-600/10",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60",
    textColor: "text-sky-700 dark:text-sky-400"
  },
  Sueshokichi: {
    rank: "Sueshokichi",
    kanji: "末小吉",
    romaji: "Sueshokichi",
    th: "โชคเล็กน้อยในอนาคต",
    en: "Gentle Future Blessing",
    sealColor: "#0d9488", // Sage Teal
    bgGradient: "from-teal-500/10 via-cyan-500/10 to-teal-600/10",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/60",
    textColor: "text-teal-700 dark:text-teal-400"
  },
  Kyo: {
    rank: "Kyo",
    kanji: "凶",
    romaji: "Kyo",
    th: "ควรระวัง",
    en: "Caution Ahead",
    sealColor: "#334155", // Slate Obsidian
    bgGradient: "from-slate-500/15 via-zinc-500/10 to-slate-700/15",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    textColor: "text-slate-700 dark:text-slate-300"
  }
};

/**
 * Returns all 100 bilingual omikuji fortunes.
 */
export function getAllFortunes(): OmikujiFortuneItem[] {
  return fortunes;
}

/**
 * Find a specific fortune by its 1-based number (1 to 100).
 */
export function getFortuneByNumber(num: number): OmikujiFortuneItem | undefined {
  return fortunes.find((f) => f.number === num);
}

/**
 * Pick a random fortune.
 */
export function getRandomFortune(): OmikujiFortuneItem {
  const index = Math.floor(Math.random() * fortunes.length);
  return fortunes[index];
}

/**
 * Deterministically pick today's fortune based on date string and optional seed/userId.
 */
export function getDailyFortune(seedKey?: string, targetDate = new Date()): OmikujiFortuneItem {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const combinedSeed = `${seedKey || "global"}:${dateStr}`;

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < combinedSeed.length; i++) {
    const char = combinedSeed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const index = Math.abs(hash) % fortunes.length;
  return fortunes[index];
}

/**
 * Get visual styling metadata for a fortune's rank.
 */
export function getRankVisual(rankRomaji: string): RankVisualMeta {
  return (
    RANK_VISUALS[rankRomaji] || {
      rank: "Kichi",
      kanji: "吉",
      romaji: rankRomaji as OmikujiRank,
      th: rankRomaji,
      en: rankRomaji,
      sealColor: "#d97706",
      bgGradient: "from-amber-500/10 to-yellow-500/10",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      textColor: "text-amber-700"
    }
  );
}

/**
 * Validation result for CSV upload
 */
export interface CsvValidationResult {
  valid: boolean;
  count: number;
  errors: string[];
  fortunes?: OmikujiFortuneItem[];
}

/**
 * Validates a CSV string uploaded by user for Omikuji Desk.
 * Supports the 12/13 column format or standard bilingual format.
 */
export function validateOmikujiCsv(csvContent: string): CsvValidationResult {
  const errors: string[] = [];
  if (!csvContent || csvContent.trim().length === 0) {
    return { valid: false, count: 0, errors: ["ไฟล์ CSV ว่างเปล่า (CSV content is empty)"] };
  }

  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { valid: false, count: 0, errors: ["ไม่พบข้อมูลใบเซียมซีในไฟล์ (Header only or empty)"] };
  }

  const parsedFortunes: OmikujiFortuneItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(",").map((s) => s.trim());
    if (parts.length < 12) {
      errors.push(`บรรทัดที่ ${i + 1}: จำนวนคอลัมน์ไม่ครบ (${parts.length}/12 คอลัมน์)`);
      continue;
    }

    const num = parseInt(parts[1], 10);
    if (isNaN(num)) {
      errors.push(`บรรทัดที่ ${i + 1}: หมายเลขใบไม่ถูกต้อง '${parts[1]}'`);
      continue;
    }

    const rankRomaji = (parts[3] || "Kichi") as OmikujiRank;
    const defaultMeta = getRankVisual(rankRomaji);

    parsedFortunes.push({
      id: parts[0] || `kannon-${String(num).padStart(3, "0")}`,
      number: num,
      rank_jp: parts[2] || defaultMeta.kanji,
      rank_romaji: rankRomaji,
      rank_th: parts[4] || defaultMeta.th,
      rank_en: defaultMeta.en,
      title_th: parts[5] || `ใบที่ ${num}`,
      title_en: parts[5] ? `Slip #${num}` : `Slip #${num}`,
      central_theme_th: parts[6] || "",
      central_theme_en: parts[6] || "",
      career_work_th: parts[7] || "",
      career_work_en: parts[7] || "",
      finance_wealth_th: parts[8] || "",
      finance_wealth_en: parts[8] || "",
      love_relationships_th: parts[9] || "",
      love_relationships_en: parts[9] || "",
      health_wellness_th: parts[10] || "",
      health_wellness_en: parts[10] || "",
      personal_growth_th: parts[11] || "",
      personal_growth_en: parts[11] || ""
    });
  }

  return {
    valid: errors.length === 0 && parsedFortunes.length > 0,
    count: parsedFortunes.length,
    errors,
    fortunes: parsedFortunes
  };
}
