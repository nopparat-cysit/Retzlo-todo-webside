# 2026-10-22: Zen Garden Daily Watering Omikuji Fortune Ritual

## Objective
Streamline the Zen Garden by replacing the multi-plot cultivation inventory flow with an authentic, inspiring Japanese Daily Omikuji Fortune (*รดน้ำรายวันเพื่อรับคำทำนายแห่งสติ*) experience.

## Files Created / Modified
- `src/lib/zen-garden/zen-state.ts`:
  - Added `DailyFortune` and `FortuneGrade` types (`daikichi`, `chukichi`, `kichi`, `shokichi`, `suekichi`).
  - Added rich pool of 10 Japanese Omikuji fortunes (`ZEN_DAILY_FORTUNES`) covering mindful focus, perseverance, teamwork, and calm.
  - Added `generateDailyFortune(dateStr, streak)` with deterministic hash.
  - Added `dailyFortune` to `ZenGardenState` and `parseZenGardenState`.
- `src/app/api/zen-garden/route.ts`:
  - Updated `GET /api/zen-garden` to return `dailyFortune` if watered today.
  - Updated `POST /api/zen-garden` (`action: "nurture"`) to generate and persist `dailyFortune`, award +5 coins, and return the revealed fortune slip.
- `src/components/project/zen-garden/zen-vector-art.tsx`:
  - Created and exported `ZenOmikujiScroll`: Japanese Makimono hanging scroll with lacquered wooden rollers, brass caps, vermilion borders, and red Hanko stamp.
- `src/components/project/zen-garden/zen-sanctuary-modal.tsx`:
  - Refactored modal into the **Daily Fortune & Omikuji Sanctuary**:
  - Displays the active botanical guardian in the diurnal terrarium backdrop.
  - If not watered: presents the daily watering ceremony button with `ZenGameToolLadle`.
  - If watered: displays the authentic unrolled `ZenOmikujiScroll` with fortune grade, poetic verse, mindful oracle, productivity guidance, and lucky focus item.
- `src/components/project/zen-garden.tsx`:
  - Integrated Daily Fortune card in Tab 1 ("Sanctuary") when watered today, with 1-click button to view the full scroll.
  - Streamlined header to focus on daily watering streak and serenity coins.
  - Updated watering button to "รดน้ำประจำวันเพื่อรับคำทำนาย (+5c)".
- `src/lib/zen-garden/zen-state.test.ts` & `src/components/project/zen-garden/zen-sanctuary-modal.test.ts`:
  - Added unit tests for Omikuji fortune generation and modal rendering contracts.

## Database / Schema Changes
- None (persisted in existing `user.zenGarden` JSON column).

## Verification Commands & Results
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx vitest run`: Passed (102/102 test files, 566 passed, 3 skipped).
- `npx prisma validate`: Valid (`The schema at prisma\schema.prisma is valid 🚀`).
- `npm run build`: Passed (42/42 static and dynamic routes compiled cleanly).

## Follow-ups / Deployment Notes
- Production ready. Fast, clean daily engagement loop with zero clutter.
