# Work Note: Upgrade Zen Garden & Lunar Observatory into Balanced Retro Lofi Ambient Tools

**Date:** 2026-09-20  
**Objective:** Upgrade the Topbar Solitary Zen Garden and Lunar Phase tools into balanced, deeply engaging retro-lofi ambient instruments with live metrics, milestone progress, interactive harmonic audio, and astronomical lunar orbit visualization.

## 1. Context & Identified Friction

1. **Zen Garden (`zen-garden.tsx`):**  
   - The original garden popover was an unbalanced, minimal shelf lacking coin balance display, milestone progress, or botanical lore.
   - Newer Unicode 13/15 emojis rendered as missing box glyphs (`▯`) on Windows fonts.
   - Lacked interactive tactile feedback.
2. **Lunar Observatory (`pixel-moon.tsx`):**  
   - Contained only a single sentence and a static moon symbol, feeling disproportionately empty and unfinished inside the topbar tools popover.
   - Lacked astronomical context (illumination percentage, synodic cycle day counter, full/new moon countdowns, and 8-phase cycle exploration).
3. **Popover Dimension Harmony:**  
   - Increased popover width from `w-72` to `w-80` in `project-topbar-tools.tsx` to ensure comfortable margins, typography breathing room, and alignment across all 4 ambient tools.

## 2. Changes Made

- **`src/components/project/zen-garden.tsx`:**
  - Added live Global Coins balance pill badge (`✦ {globalCoins}c`).
  - Added multi-phase growth progress bar tracking unlocked botanical milestones.
  - Implemented illuminated terrarium showcase shelf with custom radial aura colors for Sprout (`🌱`), Cherry Blossom (`🌸`), Zen Bamboo (`🎋`), and Golden Aloe (`🌵`).
  - Added interactive plant inspector card revealing botanical quotes and unlock requirements.
  - Added interactive "Ring Singing Bowl & Tend Garden" action triggering `playZenChimeSound()` (procedural 432 Hz harmonic singing bowl chime) and gentle ambient mist glow.
- **`src/components/project/pixel-moon.tsx`:**
  - Revamped into full **Lunar Observatory** with dynamic illumination percentage and synodic month cycle age (Day X of 29.5).
  - Added celestial aura glow shifting with moon brightness (lunar gold for Full Moon, cyan/indigo for crescent/quarter).
  - Built an interactive **8-Phase Lunar Orbit Astrolabe** strip highlighting the current phase and enabling hover previews of all 8 phases.
  - Added countdown cards for the next Full Moon and New Moon.
- **`src/components/project/project-topbar-tools.tsx`:**
  - Adjusted popover content width to `w-80` for visual balance across Ambience, Focus, Phase, and Garden.
- **`src/lib/sound.ts`:**
  - Added `playZenChimeSound()` procedural Web Audio API harmonic chime (432 Hz, 864 Hz, 1296 Hz).

## 3. Verification Results

- `npm test`: 61 test files passed, 279 tests passed (100%).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Production build verified successfully for all 35 routes.
