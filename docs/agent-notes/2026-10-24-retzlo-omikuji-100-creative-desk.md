# Retzlo Omikuji 100 Fortune & Creative Desk Work Note

- **Date:** 2026-10-24
- **Objective:** Implement complete 4-step Retzlo Omikuji Fortune & Creative Desk feature with Asakusa Kannon 100-card bilingual dataset, backend settings desk, tactile wooden shaker, vintage editorial slip modal with wax seals, and QA verification.

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
- `src/components/omikuji/omikuji-modal.tsx` (Tactile wooden shaker animation and vintage newspaper editorial slip modal with rank-based wax seals, 5 guidance dimensions, and quick copy/attach as note)
- `src/components/omikuji/omikuji-trigger.tsx` (Header trigger button with feature toggle reactivity and tooltip)
- `scripts/omikuji-translations.mjs` (English editorial translations cards 1-20)
- `scripts/omikuji-translations-21-50.mjs` (English editorial translations cards 21-50)
- `scripts/omikuji-translations-51-75.mjs` (English editorial translations cards 51-75)
- `scripts/omikuji-translations-76-100.mjs` (English editorial translations cards 76-100)
- `scripts/compile-omikuji-dataset.mjs` (Dataset compilation and integrity checker)
- `scripts/update-guide.mjs` (System guide update script)
- `scripts/add-help-topics.mjs` (In-app help guide topic injector)

### Modified
- `src/components/project/project-topbar-tools.tsx` (Mounted OmikujiTrigger in both wide desktop and compact views)
- `src/components/project/project-settings-client.tsx` (Added OmikujiDeskSettings into the preferences tab)
- `src/components/project/user-profile-popover.tsx` (Added link to `/settings` in user profile dropdown)
- `src/app/globals.css` (Added `@keyframes omikuji-shake` and `.animate-omikuji-shake`)
- `docs/system-guide.md` (Documented Creative Fortune & Omikuji Desk)
- `src/components/help/data/topics-th.ts` (Added Omikuji Desk knowledge base topic in Thai)
- `src/components/help/data/topics-en.ts` (Added Omikuji Desk knowledge base topic in English)
- `docs/theme-system.md` (Added theme coverage note and audit entry)

## Important Behavior Changes

1. **Step 1 - Data Engine & Schema:**
   - 100 cards from Asakusa Kannon translated and editorialized in English across all 5 dimensions (Career, Wealth, Love, Health, Personal Growth) alongside the original Thai text.
   - Built-in type definitions for ranks, fortunes, and settings.
   - High-performance, zero-latency retrieval functions (`getAllFortunes`, `getFortuneByNumber`, `getRandomFortune`, `getDailyFortune`).
2. **Step 2 - Backend Settings Desk:**
   - Global `/settings` route created and linked via user profile popover.
   - Also integrated directly into Project Settings (`/project/[id]/settings?tab=preferences`).
   - Feature Toggle: turning it off instantly hides all Omikuji triggers across the application.
   - Language Selection: Auto / Thai (TH) / English (EN).
   - Draw Frequency: Daily Draw (deterministic per user/project/date) or Unlimited.
   - Annual CSV Importer: Drag & Drop zone with live validation, template download, and ConfirmModal protection.
3. **Step 3 - RetzPost Editorial Front-End:**
   - Header Trigger: Elegant `籤` trigger button with pulsing amber indicator and tooltip.
   - Tactile Wooden Shaker: Textured 3D cylinder with brass rims, Asakusa calligraphy, shake wobble animation, and emerging bamboo stick.
   - Vintage Newspaper Editorial Slip: Authentic paper styling with wax seals dynamically colored by rank (`Daikichi` terracotta red, `Kichi` gold, `Hankichi` bronze, `Shokichi` pine green, `Kyo` slate obsidian).
   - Quick actions: "Copy text" (formatted markdown) and "Attach as Note" (directly saves to Project Note via API).
4. **Step 4 - Verification & Compliance:**
   - All CUD operations protected with ConfirmModals and trigger immediate Toast notifications.
   - Zero hardcoded secrets or external web URLs.

## Database & Schema Changes
- None (persists preferences in local storage and connects to existing project notes schema).

## Verification Commands & Results

- `npx prisma validate`: Passed (schema valid).
- `npx vitest run src/lib/omikuji/`: Passed (10/10 tests passed).
- `npx vitest run`: Passed (104/104 test files passed, 576 tests passed, 0 failures).
- `npm run lint`: Passed (0 errors).
- `npm run build`: To be verified.
