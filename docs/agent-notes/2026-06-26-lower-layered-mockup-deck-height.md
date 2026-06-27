# 2026-06-26 — Lower Layered Mockup Deck Height

## Objective
Lower the overall height of the layered 3D mockup deck to align it closer to the vertical center of the viewport (around the horizon line and sun).

---

## Files Created / Modified

### Modified
- `src/app/(marketing)/page.tsx` — Shifted the top positions of all stacked cards down by another 8-12%:
  - Kanban board: from `top: 18%` to `top: 30%`
  - Dashboard mockup: from `top: 32%` to `top: 42%`
  - Finance card: from `top: 22%` to `top: 34%`
  - Lofi Focus: from `top: 52%` to `top: 60%`
  - Calendar: from `top: 56%` to `top: 64%`

---

## Behavior Changes
- The entire 3D layered card deck is now vertically centered on the right half of the screen, perfectly surrounding the neon horizon line and sun.

---

## Verification
- `npm run lint` → ✅ Passed (No ESLint warnings or errors)
