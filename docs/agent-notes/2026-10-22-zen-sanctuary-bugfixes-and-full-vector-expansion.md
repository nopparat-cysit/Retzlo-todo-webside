# Work Note: Zen Sanctuary Bugfixes & Full Vector Art Expansion

**Date:** 2026-10-22  
**Objective:** Resolve all UX/UI bugs in the Zen Garden living sanctuary, fix modal trapping inside Radix PopoverContent, expand the vector art collection to 100% cover all 10 botanical guardians and 5 decor elements with pure bespoke SVG, wire up Pomodoro sunlight integration, add plot clearing with `ConfirmModal`, and ensure real-time synchronization on task completions.

---

## Bugs Identified & Resolved

1. **Modal Layout Trapping & Popover Clash:**
   - *Bug:* `ZenSanctuaryModal` was rendered directly inside `ZenGarden` within `PopoverContent`. Because `PopoverContent` had `w-[364px]`, `backdrop-blur-xl`, and `overflow-hidden`, the modal was clipped to 364px width and clicking outside or closing triggered unexpected Popover dismissing.
   - *Fix:* Wrapped `ZenSanctuaryModal` in `<ModalPortal>`, lifted modal activation to `ProjectTopbarTools`, and added `handleOpenSanctuary` callback which cleanly closes the small popover before opening the full-screen modal at root level.

2. **Missing Vector Art for Half the Plants:**
   - *Bug:* Plants like `aloe`, `pampas`, `fungi`, `willow`, and `sprout` fell through `default` in `ZenFloraRenderer`, displaying Bonsai Pine instead of their own artwork.
   - *Fix:* Created bespoke hand-drawn pure SVG components for all 10 botanical species (`ZenSprout`, `ZenAloeSucculent`, `ZenSilverPampas`, `ZenMoonlightFungi`, `ZenSpiritWillow`, etc.) and 5 decor items (`ZenToriiGate`, `ZenMoonBridge`, `ZenTsukubai`, `ZenStoneLantern`, `ZenSleepyCat`).

3. **Raw Browser Emojis in Seed Picker & Showcase:**
   - *Bug:* Seed picker and botanical cards still used raw browser emoji strings (`🪴`, `🌸`, `🎋`).
   - *Fix:* Sliced and embedded mini vector previews via `ZenFloraRenderer` in both the Seed Picker drawer and the guardian showcase shelf.

4. **Irreversible Plot Planting:**
   - *Bug:* Once planted, a plot could never be cleared or replanted.
   - *Fix:* Added `clear-plot` API endpoint and a "Dig Up / Replant" button in the inspector, guarded by `ConfirmModal` for user intent verification.

5. **Stale Dewdrops in Topbar:**
   - *Bug:* Moving cards to `DONE` awarded dewdrops in the database, but client components did not fire a sync event.
   - *Fix:* Added `zen-updated` event dispatch on card completion in `board.tsx` and `board-list-view.tsx`, and added listener in `zen-garden.tsx`.

6. **Pomodoro Sunlight Integration:**
   - *Bug:* Sunlight resource was not linked to Pomodoro focus sessions.
   - *Fix:* Wired `nixie-pomodoro.tsx` to automatically call `award-sunlight` on focus session expiration, and added "Bask in Sun" button in `ZenSanctuaryModal` to accelerate flora growth.

7. **Audit Logging Compliance:**
   - *Bug:* Mutation routes in `POST /api/zen-garden` were missing `createAuditLog()` calls.
   - *Fix:* Added forensic audit logs for all 10 mutation actions in accordance with `docs/audit-logging-standard.md`.

8. **Module Import Resolution:**
   - *Bug:* `zen-sanctuary-modal.tsx` attempted to import from `@/components/language-provider` which caused Next.js build failure.
   - *Fix:* Corrected to `@/lib/i18n/language-context`.

---

## Files Created & Modified

- `src/components/project/zen-garden/zen-vector-art.tsx` [MODIFY]
  - Added `ZenSprout`, `ZenAloeSucculent`, `ZenSilverPampas`, `ZenMoonlightFungi`, `ZenSpiritWillow`, `ZenToriiGate`, `ZenMoonBridge`, `ZenTsukubai`.
  - Mapped all 15 identifiers in `ZenFloraRenderer`.
- `src/components/project/zen-garden/zen-sanctuary-modal.tsx` [MODIFY]
  - Wrapped in `ModalPortal`.
  - Added Bask in Sun action (+2 growth units).
  - Added Dig up / Replant with `ConfirmModal`.
  - Added Tibetan Singing Bowl 432 Hz chime button with concentric ripple animation.
  - Sliced vector art previews into Seed Picker.
- `src/components/project/project-topbar-tools.tsx` [MODIFY]
  - Integrated `isSanctuaryOpen` and `handleOpenSanctuary`.
  - Mounted `ZenSanctuaryModal` at root level.
- `src/components/project/zen-garden.tsx` [MODIFY]
  - Added `onOpenSanctuary` prop support.
  - Added `zen-updated` event listener.
  - Replaced emojis in showcase cards with `ZenFloraRenderer`.
- `src/app/api/zen-garden/route.ts` [MODIFY]
  - Added `award-sunlight`, `bask-plot`, `clear-plot`, `ring-bell` actions.
  - Added `createAuditLog` to all mutation endpoints.
- `src/components/project/nixie-pomodoro.tsx` [MODIFY]
  - Awarded +1 Sunlight upon focus session completion.
- `src/components/kanban/board.tsx` & `src/components/kanban/board-list-view.tsx` [MODIFY]
  - Dispatched `zen-updated` and `coins-updated` on card completion to DONE.
- `src/lib/zen-garden/zen-state.ts` [MODIFY]
  - Fixed empty plot default stage in `parseZenGardenState()`.

---

## Verification Commands & Results

```bash
npx vitest run
npm run lint
npx prisma validate
npm run build
```
- **Vitest:** 101/101 test files passed, 561 tests passed, 3 skipped.
- **ESLint:** 0 warnings, 0 errors.
- **Prisma:** Schema valid.
- **Next.js Build:** 42/42 static and dynamic pages compiled successfully.
