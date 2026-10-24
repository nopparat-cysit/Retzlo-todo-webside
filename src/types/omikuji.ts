/**
 * omikuji.ts
 * Type definitions for the 100-card Bilingual Japanese Omikuji Fortune Engine.
 */

export type OmikujiRank =
  | "Daikichi"
  | "Kichi"
  | "Chukichi"
  | "Shokichi"
  | "Hankichi"
  | "Suekichi"
  | "Sueshokichi"
  | "Kyo";

export interface OmikujiFortuneItem {
  id: string; // "kannon-001"
  number: number; // 1 - 100
  rank_jp: string; // "大吉"
  rank_romaji: OmikujiRank; // "Daikichi"
  rank_th: string; // "โชคดีมาก"
  rank_en: string; // "Great Blessing"
  title_th: string; // "หอคอยบนยอดเขา"
  title_en: string; // "Tower on the Mountain Peak"
  central_theme_th: string;
  central_theme_en: string;
  career_work_th: string;
  career_work_en: string;
  finance_wealth_th: string;
  finance_wealth_en: string;
  love_relationships_th: string;
  love_relationships_en: string;
  health_wellness_th: string;
  health_wellness_en: string;
  personal_growth_th: string;
  personal_growth_en: string;
  source_url?: string;
}

export type OmikujiLanguageMode = "auto" | "th" | "en";
export type OmikujiDrawMode = "daily" | "unlimited";

export interface OmikujiDeskSettings {
  enabled: boolean;
  languageMode: OmikujiLanguageMode;
  drawMode: OmikujiDrawMode;
  customCsvName?: string | null;
  customCsvUploadedAt?: string | null;
  customFortunesCount?: number | null;
}

export const DEFAULT_OMIKUJI_SETTINGS: OmikujiDeskSettings = {
  enabled: true,
  languageMode: "auto",
  drawMode: "daily",
  customCsvName: null,
  customCsvUploadedAt: null,
  customFortunesCount: null
};

export interface OmikujiDrawResult {
  fortune: OmikujiFortuneItem;
  drawnAt: string; // ISO string
  drawMode: OmikujiDrawMode;
  stickNumber: number;
}
