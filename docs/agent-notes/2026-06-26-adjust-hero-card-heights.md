# 2026-06-26 — Adjust Hero Card Heights

## Objective
Adjust the vertical positions of the 5 floating mockup cards in the landing page hero section. Pushed them down to sit lower on the screen to prevent them from feeling too high or close to the top header.

---

## Files Created / Modified

### Modified
- `src/app/(marketing)/page.tsx` — Shifted the top positions of all cards:
  - Kanban board: changed from `top: 14%` to `top: 24%`
  - Dashboard mockup: changed from `top: 16%` to `top: 26%`
  - Finance card: changed from `top: 24%` to `top: 34%`
  - Lofi Focus: changed from `top: 52%` to `top: 62%`
  - Calendar: changed from `top: 58%` to `top: 66%`

---

## Behavior Changes
- Floating cards sit lower on the screen, creating a more centered, cohesive cluster around the sun and horizon grid floor.

---

## Verification
- `npm run lint` → ✅ Passed (No ESLint warnings or errors)
