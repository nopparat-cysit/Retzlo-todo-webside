/**
 * zen-state.ts
 * Core business logic, botanical flora metadata, streak tracking,
 * and state validation for the Solitary Zen Garden micro-sanctuary.
 */

export interface BotanicalPlant {
  id: string;
  name: string;
  nameTh: string;
  emoji: string;
  cost: number;
  tier: 1 | 2 | 3;
  tierName: string;
  tierNameTh: string;
  tone: string;
  auraColor: string;
  solfeggioFreq: number;
  tagline: string;
  taglineTh: string;
}

export const BOTANICAL_PLANTS: BotanicalPlant[] = [
  // ─── Tier 1: Dawn Grove ──────────────────────────────────────────────────
  {
    id: "sprout",
    name: "Sprout",
    nameTh: "ต้นกล้าแรกผลิ",
    emoji: "🌱",
    cost: 10,
    tier: 1,
    tierName: "Dawn Grove",
    tierNameTh: "ป่ารุ่งอรุณ",
    tone: "text-emerald-500 dark:text-emerald-400",
    auraColor: "rgba(52, 211, 153, 0.28)",
    solfeggioFreq: 396,
    tagline: "First spark of focus and mindful discipline",
    taglineTh: "ประกายแรกแห่งสมาธิและวินัยการทำงาน"
  },
  {
    id: "blossom",
    name: "Cherry Blossom",
    nameTh: "ซากุระสมาธิ",
    emoji: "🌸",
    cost: 30,
    tier: 1,
    tierName: "Dawn Grove",
    tierNameTh: "ป่ารุ่งอรุณ",
    tone: "text-pink-500 dark:text-pink-400",
    auraColor: "rgba(244, 114, 182, 0.28)",
    solfeggioFreq: 417,
    tagline: "Quiet serenity and effortless mindful flow",
    taglineTh: "ความสงบเยือกเย็นและการลื่นไหลของสติ"
  },
  {
    id: "bamboo",
    name: "Zen Bamboo",
    nameTh: "ไผ่เซนหยั่งราก",
    emoji: "🎋",
    cost: 60,
    tier: 1,
    tierName: "Dawn Grove",
    tierNameTh: "ป่ารุ่งอรุณ",
    tone: "text-teal-600 dark:text-teal-400",
    auraColor: "rgba(45, 212, 191, 0.28)",
    solfeggioFreq: 528,
    tagline: "Resilient perseverance through adversity",
    taglineTh: "ความยืดหยุ่นไม่ยอมแพ้ต่ออุปสรรคและแรงต้าน"
  },
  {
    id: "aloe",
    name: "Golden Aloe",
    nameTh: "ว่านหางจระเข้ทอง",
    emoji: "🌵",
    cost: 100,
    tier: 1,
    tierName: "Dawn Grove",
    tierNameTh: "ป่ารุ่งอรุณ",
    tone: "text-amber-600 dark:text-amber-400",
    auraColor: "rgba(251, 191, 36, 0.28)",
    solfeggioFreq: 639,
    tagline: "Master of steady, enduring productivity",
    taglineTh: "พลังความเพียรที่มั่นคงและยาวนานดั่งทะเลทราย"
  },

  // ─── Tier 2: Lotus Spring ────────────────────────────────────────────────
  {
    id: "lotus",
    name: "Sacred Lotus",
    nameTh: "บัวสวรรค์บริสุทธิ์",
    emoji: "🪷",
    cost: 180,
    tier: 2,
    tierName: "Lotus Spring",
    tierNameTh: "สายธารบงกช",
    tone: "text-purple-600 dark:text-purple-400",
    auraColor: "rgba(192, 132, 252, 0.32)",
    solfeggioFreq: 741,
    tagline: "Purity unblemished by chaos and distractions",
    taglineTh: "ความบริสุทธิ์ผุดผ่องเหนือความสับสนวุ่นวาย"
  },
  {
    id: "pampas",
    name: "Silver Pampas",
    nameTh: "หญ้าพริ้วสายลม",
    emoji: "🌾",
    cost: 280,
    tier: 2,
    tierName: "Lotus Spring",
    tierNameTh: "สายธารบงกช",
    tone: "text-sky-600 dark:text-sky-400",
    auraColor: "rgba(56, 189, 248, 0.32)",
    solfeggioFreq: 852,
    tagline: "Graceful adaptability bending with the breeze",
    taglineTh: "ความอ่อนโยนที่ลู่ตามลมโดยไม่หักโค่น"
  },
  {
    id: "bonsai",
    name: "Bonsai Pine",
    nameTh: "บอนไซสนโบราณ",
    emoji: "🪴",
    cost: 400,
    tier: 2,
    tierName: "Lotus Spring",
    tierNameTh: "สายธารบงกช",
    tone: "text-emerald-600 dark:text-emerald-300",
    auraColor: "rgba(16, 185, 129, 0.32)",
    solfeggioFreq: 963,
    tagline: "Sculpted patience, deliberate focus, and mastery",
    taglineTh: "ศิลปะแห่งความอดทนและความประณีตในผลงาน"
  },

  // ─── Tier 3: Celestial Sanctuary ─────────────────────────────────────────
  {
    id: "fungi",
    name: "Moonlight Fungi",
    nameTh: "เห็ดเรืองแสงราตรี",
    emoji: "🍄",
    cost: 550,
    tier: 3,
    tierName: "Celestial Sanctuary",
    tierNameTh: "สรวงสวรรค์ดวงดาว",
    tone: "text-indigo-600 dark:text-indigo-400",
    auraColor: "rgba(129, 140, 248, 0.36)",
    solfeggioFreq: 432,
    tagline: "Phosphorescent creativity glowing in silence",
    taglineTh: "แสงประกายความคิดสร้างสรรค์ยามค่ำคืนอันเงียบสงบ"
  },
  {
    id: "ginkgo",
    name: "Golden Ginkgo",
    nameTh: "แปะก๊วยทองคำ",
    emoji: "🌕",
    cost: 750,
    tier: 3,
    tierName: "Celestial Sanctuary",
    tierNameTh: "สรวงสวรรค์ดวงดาว",
    tone: "text-yellow-600 dark:text-yellow-400",
    auraColor: "rgba(250, 204, 21, 0.36)",
    solfeggioFreq: 528,
    tagline: "Enduring wisdom, clarity, and evergreen vitality",
    taglineTh: "ปัญญาอันลึกซึ้งและความแจ่มชัดทางความคิด"
  },
  {
    id: "willow",
    name: "Spirit Willow",
    nameTh: "หลิวทิพย์สมานฉันท์",
    emoji: "✨",
    cost: 1000,
    tier: 3,
    tierName: "Celestial Sanctuary",
    tierNameTh: "สรวงสวรรค์ดวงดาว",
    tone: "text-fuchsia-600 dark:text-fuchsia-400",
    auraColor: "rgba(232, 121, 249, 0.38)",
    solfeggioFreq: 1080,
    tagline: "Transcendent flow state, balance, and unity",
    taglineTh: "ภาวะลื่นไหลไร้รอยต่อและความสมดุลแห่งชีวิต"
  }
];

export interface GardenPlot {
  slotIndex: number; // 0 - 8 (3x3 Grid)
  itemType: "empty" | "flora" | "decor";
  itemId: string | null;
  stage: 1 | 2 | 3 | 4 | 5; // 1: Seed, 2: Sprout, 3: Sapling, 4: Blooming, 5: Ancient
  waterCount: number;
}

export interface ZenGardenState {
  nurtureStreak: number;
  lastWateredDate: string | null;
  activeGuardianId: string;
  totalNourished: number;
  totalZenMinutes: number;
  soundMuted: boolean;

  // Multi-Year Expansion State
  dewdrops: number;      // Water drops earned from completing tasks
  sunlight: number;      // Vitality earned from focus sessions
  richSoil: number;      // Soil energy earned from habits/diary
  plots: GardenPlot[];   // 3x3 Grid Terrarium (9 slots)
  herbarium: string[];   // Collected plant specimen IDs
  unlockedDecorIds: string[];
  visitorsEncountered: string[];
}

export function createDefaultPlots(guardianId = "sprout"): GardenPlot[] {
  return Array.from({ length: 9 }, (_, idx) => {
    if (idx === 4) {
      // Center plot has the active guardian
      return {
        slotIndex: idx,
        itemType: "flora",
        itemId: guardianId,
        stage: 4,
        waterCount: 12
      };
    }
    if (idx === 0) {
      // Corner stone lantern
      return {
        slotIndex: idx,
        itemType: "decor",
        itemId: "lantern",
        stage: 4,
        waterCount: 0
      };
    }
    if (idx === 8) {
      // Resting cat companion
      return {
        slotIndex: idx,
        itemType: "decor",
        itemId: "cat",
        stage: 4,
        waterCount: 0
      };
    }
    return {
      slotIndex: idx,
      itemType: "empty",
      itemId: null,
      stage: 1,
      waterCount: 0
    };
  });
}

export function parseZenGardenState(raw: unknown): ZenGardenState {
  const fallback: ZenGardenState = {
    nurtureStreak: 0,
    lastWateredDate: null,
    activeGuardianId: "sprout",
    totalNourished: 0,
    totalZenMinutes: 0,
    soundMuted: false,
    dewdrops: 5,
    sunlight: 10,
    richSoil: 3,
    plots: createDefaultPlots("sprout"),
    herbarium: ["sprout"],
    unlockedDecorIds: ["lantern", "cat"],
    visitorsEncountered: ["cat"]
  };

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const r = raw as Record<string, unknown>;

  const nurtureStreak =
    typeof r.nurtureStreak === "number" && r.nurtureStreak >= 0
      ? Math.floor(r.nurtureStreak)
      : fallback.nurtureStreak;

  const lastWateredDate =
    typeof r.lastWateredDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.lastWateredDate)
      ? r.lastWateredDate
      : fallback.lastWateredDate;

  const activeGuardianId =
    typeof r.activeGuardianId === "string" && BOTANICAL_PLANTS.some((p) => p.id === r.activeGuardianId)
      ? r.activeGuardianId
      : fallback.activeGuardianId;

  const totalNourished =
    typeof r.totalNourished === "number" && r.totalNourished >= 0
      ? Math.floor(r.totalNourished)
      : fallback.totalNourished;

  const totalZenMinutes =
    typeof r.totalZenMinutes === "number" && r.totalZenMinutes >= 0
      ? Math.floor(r.totalZenMinutes)
      : fallback.totalZenMinutes;

  const soundMuted = typeof r.soundMuted === "boolean" ? r.soundMuted : fallback.soundMuted;

  const dewdrops =
    typeof r.dewdrops === "number" && r.dewdrops >= 0
      ? Math.floor(r.dewdrops)
      : fallback.dewdrops;

  const sunlight =
    typeof r.sunlight === "number" && r.sunlight >= 0
      ? Math.floor(r.sunlight)
      : fallback.sunlight;

  const richSoil =
    typeof r.richSoil === "number" && r.richSoil >= 0
      ? Math.floor(r.richSoil)
      : fallback.richSoil;

  let plots = fallback.plots;
  if (Array.isArray(r.plots) && r.plots.length === 9) {
    plots = r.plots.map((p, idx) => {
      if (!p || typeof p !== "object") return fallback.plots[idx];
      const plotObj = p as Record<string, unknown>;
      return {
        slotIndex: idx,
        itemType: plotObj.itemType === "flora" || plotObj.itemType === "decor" ? plotObj.itemType : "empty",
        itemId: typeof plotObj.itemId === "string" ? plotObj.itemId : null,
        stage: (typeof plotObj.stage === "number" && plotObj.stage >= 1 && plotObj.stage <= 5 ? plotObj.stage : 4) as 1 | 2 | 3 | 4 | 5,
        waterCount: typeof plotObj.waterCount === "number" ? Math.max(0, plotObj.waterCount) : 0
      };
    });
  }

  const herbarium = Array.isArray(r.herbarium)
    ? r.herbarium.filter((id): id is string => typeof id === "string")
    : fallback.herbarium;

  const unlockedDecorIds = Array.isArray(r.unlockedDecorIds)
    ? r.unlockedDecorIds.filter((id): id is string => typeof id === "string")
    : fallback.unlockedDecorIds;

  const visitorsEncountered = Array.isArray(r.visitorsEncountered)
    ? r.visitorsEncountered.filter((id): id is string => typeof id === "string")
    : fallback.visitorsEncountered;

  return {
    nurtureStreak,
    lastWateredDate,
    activeGuardianId,
    totalNourished,
    totalZenMinutes,
    soundMuted,
    dewdrops,
    sunlight,
    richSoil,
    plots,
    herbarium,
    unlockedDecorIds,
    visitorsEncountered
  };
}

export function calculateSkyTimeOfDay(date: Date = new Date()): "dawn" | "day" | "dusk" | "night" {
  const hours = date.getHours();
  if (hours >= 5 && hours < 9) return "dawn";
  if (hours >= 9 && hours < 17) return "day";
  if (hours >= 17 && hours < 20) return "dusk";
  return "night";
}

export function calculateRealWorldSeason(date: Date = new Date()): "spring" | "summer" | "autumn" | "winter" {
  const month = date.getMonth(); // 0-indexed: 0 = Jan, 11 = Dec
  if (month >= 2 && month <= 4) return "spring"; // Mar, Apr, May
  if (month >= 5 && month <= 7) return "summer"; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return "autumn"; // Sep, Oct, Nov
  return "winter"; // Dec, Jan, Feb
}

export function getUnlockedPlants(coins: number): BotanicalPlant[] {
  return BOTANICAL_PLANTS.filter((p) => coins >= p.cost);
}

export function getNextLockedPlant(coins: number): BotanicalPlant | null {
  return BOTANICAL_PLANTS.find((p) => coins < p.cost) || null;
}

export function calculateZenGrowth(coins: number) {
  const unlocked = getUnlockedPlants(coins);
  const total = BOTANICAL_PLANTS.length;
  const count = unlocked.length;
  const pct = Math.min(100, Math.round((count / total) * 100));

  let currentTier: 1 | 2 | 3 = 1;
  if (count >= 7) {
    currentTier = 3;
  } else if (count >= 4) {
    currentTier = 2;
  }

  return {
    unlockedCount: count,
    totalCount: total,
    percentage: pct,
    currentTier,
    nextPlant: getNextLockedPlant(coins)
  };
}

/**
 * Checks whether the user can nurture/water their sanctuary today.
 */
export function canWaterToday(lastWateredDate: string | null, todayDate: string): boolean {
  if (!lastWateredDate) return true;
  return lastWateredDate !== todayDate;
}

/**
 * Computes the updated streak count.
 * - If last watered yesterday, streak increments by 1.
 * - If last watered today, streak remains the same.
 * - If last watered 2+ days ago or never, streak resets to 1.
 */
export function computeNewStreak(
  lastWateredDate: string | null,
  currentStreak: number,
  todayDate: string
): number {
  if (!lastWateredDate) return 1;
  if (lastWateredDate === todayDate) return Math.max(1, currentStreak);

  const prev = new Date(`${lastWateredDate}T00:00:00Z`).getTime();
  const current = new Date(`${todayDate}T00:00:00Z`).getTime();
  const diffDays = Math.round((current - prev) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return currentStreak + 1;
  }
  return 1;
}

export const ZEN_WISDOM_QUOTES = [
  {
    en: "Still water reflects the moon clearly; a quiet mind perceives truth effortlessly.",
    th: "น้ำที่นิ่งสะท้อนเงาจันทร์ได้ชัดเจน จิตที่สงบมองเห็นความจริงได้แจ่มแจ้ง"
  },
  {
    en: "One mindful step is worth a hundred rushed strides in the wrong direction.",
    th: "หนึ่งก้าวที่เต็มไปด้วยสติ มีค่ายิ่งกว่าร้อยก้าวที่เร่งรีบแต่ไร้ทิศทาง"
  },
  {
    en: "A tree that bends with the wind will stand tall after the storm has passed.",
    th: "ต้นไม้ที่ลู่ตามลม จะยังคงยืนหยัดอย่างสง่างามหลังพายุผ่านพ้น"
  },
  {
    en: "Do not seek to follow in the footsteps of the wise; seek what they sought.",
    th: "อย่าเพียงเดินตามรอยเท้าของปราชญ์ แต่จงแสวงหาสิ่งที่ท่านเหล่านั้นแสวงหา"
  },
  {
    en: "Empty your teacup, so that it may be filled once again with fresh clarity.",
    th: "จงเทชาออกจากถ้วย เพื่อเปิดรับความรู้และความแจ่มชัดครั้งใหม่"
  },
  {
    en: "Patience is not the ability to wait, but the ability to keep a calm heart while waiting.",
    th: "ความอดทนไม่ใช่เพียงการรอคอย แต่คือการรักษาหัวใจให้สงบในระหว่างที่รอ"
  },
  {
    en: "Focus is like the sun through a magnifying glass: dispersed it warms, concentrated it burns bright.",
    th: "สมาธิดั่งแสงอาทิตย์ผ่านแว่นขยาย เมื่อรวมเป็นจุดเดียว ย่อมเกิดพลังขับเคลื่อนอันทรงพลัง"
  }
];

export function getTodayZenWisdom(date: Date = new Date()) {
  const dayIndex = date.getDate() % ZEN_WISDOM_QUOTES.length;
  return ZEN_WISDOM_QUOTES[dayIndex];
}
