import fs from 'fs';
import path from 'path';
import { EN_TRANSLATIONS } from './omikuji-translations.mjs';
import { EN_TRANSLATIONS_21_50 } from './omikuji-translations-21-50.mjs';
import { EN_TRANSLATIONS_51_75 } from './omikuji-translations-51-75.mjs';
import { translations76to100 } from './omikuji-translations-76-100.mjs';

const allTranslations = {
  ...EN_TRANSLATIONS,
  ...EN_TRANSLATIONS_21_50,
  ...EN_TRANSLATIONS_51_75,
  ...translations76to100
};

const RANK_ROMAJI_TO_EN = {
  'Daikichi': 'Great Blessing',
  'Kichi': 'Good Fortune',
  'Chukichi': 'Middle Blessing',
  'Shokichi': 'Small Blessing',
  'Hankichi': 'Half Blessing',
  'Suekichi': 'Future Blessing',
  'Sueshokichi': 'Gentle Future Blessing',
  'Kyo': 'Caution Ahead'
};

const csvPath = path.resolve('public/omikuji/retzlo_omikuji_100_five_categories.csv');
const rawCsv = fs.readFileSync(csvPath, 'utf8');

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    if (parts.length < 12) {
      console.warn(`Line ${i} has fewer parts: ${parts.length}`);
      continue;
    }
    
    // id, number, rank_jp, rank_romaji, rank_th, title_th, central_theme_th, career_work_th, finance_wealth_th, love_relationships_th, health_wellness_th, personal_growth_th, source_url
    const num = parseInt(parts[1], 10);
    const trans = allTranslations[num];
    if (!trans) {
      throw new Error(`Missing translation for fortune number ${num}`);
    }

    const rankRomaji = parts[3].trim();
    const rankEn = trans.rank_en || RANK_ROMAJI_TO_EN[rankRomaji] || 'Blessing';

    const item = {
      id: parts[0].trim(),
      number: num,
      rank_jp: parts[2].trim(),
      rank_romaji: rankRomaji,
      rank_th: parts[4].trim(),
      rank_en: rankEn,
      title_th: parts[5].trim(),
      title_en: trans.title_en || trans.title,
      central_theme_th: parts[6].trim(),
      central_theme_en: trans.central_theme_en || trans.theme,
      career_work_th: parts[7].trim(),
      career_work_en: trans.career_work_en || trans.career,
      finance_wealth_th: parts[8].trim(),
      finance_wealth_en: trans.finance_wealth_en || trans.finance,
      love_relationships_th: parts[9].trim(),
      love_relationships_en: trans.love_relationships_en || trans.love,
      health_wellness_th: parts[10].trim(),
      health_wellness_en: trans.health_wellness_en || trans.health,
      personal_growth_th: parts[11].trim(),
      personal_growth_en: trans.personal_growth_en || trans.growth,
    };
    rows.push(item);
  }

  return rows;
}

const fortunes = parseCsv(rawCsv);
console.log(`Parsed ${fortunes.length} fortunes successfully.`);

// Validate all numbers 1 to 100 exist and have all non-empty fields
for (let n = 1; n <= 100; n++) {
  const found = fortunes.find(f => f.number === n);
  if (!found) {
    throw new Error(`Missing fortune #${n}`);
  }
  const requiredKeys = [
    'id', 'number', 'rank_jp', 'rank_romaji', 'rank_th', 'rank_en',
    'title_th', 'title_en', 'central_theme_th', 'central_theme_en',
    'career_work_th', 'career_work_en', 'finance_wealth_th', 'finance_wealth_en',
    'love_relationships_th', 'love_relationships_en', 'health_wellness_th', 'health_wellness_en',
    'personal_growth_th', 'personal_growth_en'
  ];
  for (const k of requiredKeys) {
    if (!found[k] || (typeof found[k] === 'string' && found[k].trim().length === 0)) {
      throw new Error(`Fortune #${n} has invalid or empty field: ${k}`);
    }
  }
}

// Ensure target dir exists
const targetDir = path.resolve('src/data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetPath = path.join(targetDir, 'omikuji-100.json');
fs.writeFileSync(targetPath, JSON.stringify(fortunes, null, 2), 'utf8');
console.log(`Saved omikuji data to ${targetPath}`);
