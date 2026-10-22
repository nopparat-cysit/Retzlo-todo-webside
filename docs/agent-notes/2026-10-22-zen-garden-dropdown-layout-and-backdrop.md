# Zen Garden Dropdown Layout & Authentic Pure-SVG Japanese Terrarium Backdrop

**Date:** 2026-10-22  
**Objective:** Refine and fix typography, baseline alignment, and cramped layout in the Zen Garden popover dropdown; eliminate horizontal truncation and invalid CSS classes; and create an authentic, hand-drawn pure SVG Japanese woodblock landscape backdrop for the terrarium canvas with Mount Fuji, celestial sky, ancient overhanging Bonsai pine, concentric raked sand waves (*karesansui*), and carved stone *Tsukubai* pedestal.

---

## Files Created & Modified

- **Modified:**
  - `src/components/project/zen-garden/zen-vector-art.tsx`: Added `ZenTerrariumBackdrop` component featuring pure SVG Ukiyo-e Japanese garden artwork (dynamic sky gradients for Dawn/Day/Dusk/Night, Mount Fuji silhouette with snow cap, overhanging Matsu black pine branch with evergreen needle fans, concentric raked karesansui sand waves, balanced stone groupings with emerald moss, carved granite pedestal, pure SVG drifting sakura petals, and mystic dew nourishment aura).
  - `src/components/project/project-topbar-tools.tsx`: Expanded popover comfortable width for Zen Garden from `364px` to `400px` (desktop) and `min(390px, calc(100vw - 1.5rem))` (mobile) to provide ample breathing room.
  - `src/components/project/zen-garden.tsx`:
    - Restructured topbar header into a balanced two-tier layout (Row 1: Leaf icon, Solitary Zen Garden title, Tier badge, Sound toggle & Full-screen Maximize buttons; Row 2: Subtitle status on the left, Dewdrops pill & Serenity Coins pill on the right).
    - Integrated `<ZenTerrariumBackdrop timeOfDay={timeOfDay} isNourishing={isNourishing} />` into the sandbox canvas, replacing the plain CSS radial gradient and raw browser emojis (`🌸`, `🍃`, `✨`).
    - Fixed sub-pixel fractional font sizes (`text-[9.5px]`, `text-[10.5px]`, `text-[11.5px]`) to clean standard sizes (`text-xs`, `text-[11px]`, `text-[10px]`) with proper line heights (`leading-normal`, `leading-relaxed`), eliminating clipped Thai vowel accents (วรรณยุกต์ลอย/จม).
    - Cleaned up invalid Tailwind classes (`py-0.2`) across the tabs and flora list.
    - Replaced raw text emoji in the Mindful Box Breathing mandala with a pure vector SVG Sacred Lotus.

---

## Important Behavior & UX Changes

1. **Zero Text Truncation & Clipped Accents:**
   - Separating the title/actions row from the subtitle/resources row allows both Thai and English status messages (such as "ขาดอีก 10c เพื่อปลดล็อก บอนไซสนโบราณ") to display cleanly without awkward clipping or horizontal overflow.
2. **Authentic Japanese Zen Aesthetic:**
   - The terrarium canvas now renders a handcrafted Japanese woodblock landscape that dynamically adapts to the real-world time of day (morning sun, golden twilight, or starry night crescent moon).
   - The active guardian sits atop a hand-chiseled granite dais with drop shadow.
   - Interactive sand ripples smoothly propagate across the concentric karesansui sand grooves upon tapping.

---

## Verification & Test Results

- `npm run lint`: **Passed** (0 warnings, 0 errors).
- `npx vitest run`: **Passed** (102 test files, 565 passed, 3 skipped).
- `npx prisma validate`: **Passed** (schema valid).
- `npm run build`: **Passed** (42/42 static and dynamic routes compiled successfully).

---

## Follow-ups & Deployment Notes

- None. No schema migrations or environment variables required.
