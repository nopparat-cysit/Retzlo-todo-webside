# 2026-10-21 — Landing Page Hero Section: Thai Typography & Vector Hand-Drawn Showcase Overhaul

## Objective
Address user feedback regarding the Hero Section:
1. **Thai Typography Polish ("เรื่องฟ้อนปัญหาอยู่ที่ฟ้อนไทย")**: Prioritize Google Fonts `Anuphan` and `IBM Plex Sans Thai` over system fallbacks (`Segoe UI` / `Tahoma`). Remove negative letter-spacing (`tracking-tight`) from Thai headings and copy to prevent Thai vowel and tone mark clipping. Set comfortable line-height (`1.35`) and `tracking-normal`.
2. **Hand-Drawn Vector Art ("อะไรวาดได้ก็วาดเถอะ ไม่ต้องใช้ css")**: Replace 500 lines of fake interactive CSS mock windows (tabs, cards, checklists constructed out of nested divs) with the actual **Hand-Drawn Vector Cozy Studio Artwork** (`RetroCozyStudioIllustration`) as the primary visual centerpiece, accompanied by an authentic drawn Japanese washi tape badge (`RetroWashiTapeBadge`) and tactile Lofi audio companion deck.

## Files Created, Modified, or Deleted
- **Created / Extended:**
  - `src/components/marketing/retro-hero-icons.tsx` — Extended with `RetroWashiTapeBadge` (drawn SVG washi tape with serrated torn zigzag edges, washi fiber texture, and drop shadow) and updated `RetroCozyStudioIllustration` to support `isPlaying` animated spinning reels, floating notes, and sleeping ginger cat on the window sill.
- **Modified:**
  - `src/app/layout.tsx` — Added Google Fonts stylesheet for `Anuphan` (wght 300–800) and `IBM Plex Sans Thai` with preconnect links. Added lint suppression for App Router `<link>` font stylesheet.
  - `tailwind.config.ts` — Added `'Anuphan'` and `'IBM Plex Sans Thai'` as top priorities in `fontFamily.sans`, `fontFamily.display`, and `fontFamily.thai`.
  - `src/app/globals.css` — Configured `--font-sans` and `--font-display` to place `'Anuphan'` first, updated `.lp-font-display` to use `letter-spacing: normal` and `line-height: 1.35`.
  - `src/app/(marketing)/page.tsx` — Overhauled Hero Section:
    - Left column: Replaced CSS border tag with drawn `<RetroWashiTapeBadge />`, applied `font-thai`, `tracking-normal`, and `leading-[1.35]` on H1, updated 4 core pillar cards with `tracking-normal` and bespoke vector icons, replaced preview dock with a clean 5-module feature strip.
    - Right column: Removed 488 lines of fake CSS mockup cards/tabs, placed the grand framed vector studio canvas (`RetroCozyStudioIllustration`) with active reel animations, alongside the tactile Lofi Focus Audio bar and vector mascot.
    - Cleaned up obsolete interactive mock states and handlers (`heroMiniCards`, `heroCalChecked`, `heroNoteChecked`, `heroAiSplitDone`, `heroStage`, `heroTaskIdx`).
  - `docs/theme-system.md` — Updated coverage matrix and changelog.

## Important Behavior & Visual Changes
1. **Authentic Thai Typography**:
   - Loopless, modern Thai typeface `Anuphan` renders cleanly on all operating systems without falling back to Windows `Segoe UI` or `Tahoma`.
   - All Thai headings and paragraphs now use `tracking-normal` (zero negative tracking) so vowels (ิ, ี, ึ, ื, ุ, ู) and tone marks (่, ้, ๊, ๋) never collide or get clipped.
2. **100% Hand-Drawn Vector Art Showcase (Zero Fake CSS Mockups)**:
   - The Hero right column showcases the crisp, hand-drawn vector room illustration (`RetroCozyStudioIllustration`):
     - Twilight window with crescent moon and twinkling stars.
     - Curled sleeping ginger cat on the window sill.
     - Wood grain desk with classic brass banker's study lamp.
     - Workstation laptop displaying Retzlo Kanban board with colorful cards.
     - Cassette Walkman whose spools actually spin when the user clicks Play on the audio player below.
     - Steaming drip coffee mug, potted succulent, and buttercream/mint sticky notes.
   - Zero raster blurriness, infinite sharpness on 4K/Retina displays.
3. **Drawn Washi Tape Badge**:
   - Category badge is now an authentic drawn vector SVG with jagged torn edges, realistic fibrous paper gradient, gold sparkle, and drop shadow.
4. **Tactile Lofi Audio Bar**:
   - Synchronized with the drawn artwork — clicking Play spins both the Walkman reels in the drawing and the mascot's reels in the radio bar while playing ambient lofi music.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx tsc --noEmit` — Passed (0 errors).
- `npm run lint` — Passed (No ESLint warnings or errors).
- `npm test` — Passed (101 test files, 557 tests passed, 3 skipped).
- `npx prisma validate` — Passed (Prisma schema is valid).
- `npm run build` — Passed (42/42 static and dynamic routes compiled successfully).

## Follow-ups / Blockers
- None.
