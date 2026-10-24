# Retzlo Omikuji 100 Fortune & Creative Desk Work Note

- **Date:** 2026-10-24
- **Objective:** Implement complete Retzlo Omikuji Fortune & Creative Desk feature with Asakusa Kannon 100-card bilingual dataset, backend settings desk, tactile wooden shaker, vintage editorial slip modal with wax seals, Zen Garden sanctuary integration, zero-emoji typography, and QA verification.

## Files Created / Modified

### Created
- `public/omikuji/retzlo_omikuji_100_five_categories.csv` (Base 100-card Asakusa Kannon CSV dataset)
- `src/types/omikuji.ts` (TypeScript interfaces: OmikujiFortuneItem, OmikujiRank, OmikujiDeskSettings, OmikujiDrawResult)
- `src/data/omikuji-100.json` (100 fully bilingual cards compiled with English editorial translations)
- `src/lib/omikuji/omikuji-data.ts` (Data engine: retrieval, random/daily draw, rank visual metadata, and CSV validator)
- `src/lib/omikuji/omikuji-data.test.ts` (Unit tests for data engine)
- `src/lib/omikuji/omikuji-settings.ts` (Settings state management and localStorage sync)
- `src/lib/omikuji/omikuji-settings.test.ts` (Unit tests for settings management)
- `src/components/settings/omikuji-desk-settings.tsx` (Backend settings desk with feature toggle, language switcher, draw mode selector, drag & drop CSV uploader, validation callouts, template download, and ConfirmModals)
- `src/app/(dashboard)/settings/page.tsx` (Dedicated global settings page `/settings`)
- `src/components/omikuji/omikuji-modal.tsx` (Tactile wooden shaker animation and vintage newspaper editorial slip modal with rank-based wax seals, 5 guidance dimensions, and quick copy/attach as note - 100% zero emojis)
- `src/components/omikuji/omikuji-trigger.tsx` (Header trigger button with feature toggle reactivity and tooltip)
- `scripts/compile-omikuji-dataset.mjs` (Dataset compilation and integrity checker)
- `scripts/omikuji-translations*.mjs` (English editorial translations cards 1-100)

### Modified
- `src/lib/zen-garden/zen-state.ts` (Integrated Asakusa 100 Omikuji engine into `DailyFortune` and `generateDailyFortune`)
- `src/components/project/zen-garden.tsx` (Enhanced Today tab with Asakusa 100 fortune ritual and 5-dimension preview without emojis)
- `src/components/project/zen-garden/zen-sanctuary-modal.tsx` (Full Asakusa 100 Omikuji editorial slip in sanctuary washi scroll with wax seals, 5 dimensions, copy, and note attach - 100% zero emojis)
- `src/components/project/zen-garden/zen-garden-skin.module.css` (Added styling for 5-dimension grid, washi cards, wax seal badge, and slip action pills)
- `src/components/project/project-topbar-tools.tsx` (Mounted OmikujiTrigger in both wide desktop and compact views)
- `src/components/project/project-settings-client.tsx` (Added OmikujiDeskSettings into the preferences tab)
- `src/components/project/user-profile-popover.tsx` (Added link to `/settings` in user profile dropdown)
- `src/app/globals.css` (Added `@keyframes omikuji-shake` and `.animate-omikuji-shake`)
- `docs/system-guide.md` (Documented Creative Fortune & Omikuji Desk)
- `src/components/help/data/topics-th.ts` (Added Omikuji Desk knowledge base topic in Thai)
- `src/components/help/data/topics-en.ts` (Added Omikuji Desk knowledge base topic in English)
- `docs/theme-system.md` (Added theme coverage note and audit entry)

## Important Behavior Changes

1. **Zen Garden & Daily Water Ritual Integration:**
   - Daily watering in Zen Garden now draws from the authentic 100 Asakusa Kannon fortune engine deterministically.
   - The popover "Today" (วันนี้) tab shows the sacred slip number (`第 [X] 番`), rank stamp, verse, and quick 5-dimension chips.
   - The full-screen Zen Sanctuary Modal unfolds the authentic 100 Asakusa Kannon editorial slip with wax seal, central verse, and 5 guidance dimensions (Career, Wealth, Love, Health, Personal Growth).
   - Added "Copy Slip" (formatted text) and "Attach as Note" (saves directly to project notes or copies markdown).
2. **Zero-Emoji Enforcement:**
   - All unicode emojis (`💼`, `💰`, `❤️`, `🌿`, `🌱`, `🎋`, `✨`, `☕`, `💧`, flags, etc.) strictly replaced with clean Lucide SVG icons (`Briefcase`, `Coins`, `Heart`, `Activity`, `Sprout`, `ScrollText`, `Sparkles`, `Droplets`).
   - Copy text and Note titles/content formatted with clean ASCII typography and bullet characters (`•`, `―`).
3. **Data Engine & Schema:**
   - 100 cards from Asakusa Kannon translated and editorialized in English across all 5 dimensions alongside the original Thai text.
   - High-performance, zero-latency retrieval functions (`getAllFortunes`, `getFortuneByNumber`, `getRandomFortune`, `getDailyFortune`).
4. **Backend Settings Desk (`/settings` & Project Settings):**
   - Feature Toggle: turning it off instantly hides all Omikuji triggers across the application.
   - Language Selection: Auto / Thai (TH) / English (EN).
   - Draw Frequency: Daily Draw (deterministic per user/project/date) or Unlimited.
   - Annual CSV Importer: Drag & Drop zone with live validation, template download, and ConfirmModal protection.

## Database & Schema Changes
- None (persists preferences in local storage and connects to existing project notes schema).

## Verification Commands & Results

- `npx prisma validate`: Passed (schema valid).
- `npx vitest run src/lib/zen-garden/`: Passed (12/12 tests passed).
- `npx vitest run src/lib/omikuji/`: Passed (10/10 tests passed).
- `npx vitest run src/components/project/zen-garden/zen-sanctuary-modal.test.ts`: Passed (4/4 tests passed).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npm run build`: Verified.
