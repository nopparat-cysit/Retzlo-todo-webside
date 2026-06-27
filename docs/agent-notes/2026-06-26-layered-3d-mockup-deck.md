# 2026-06-26 — Layered 3D Mockup Deck

## Objective
Reorganize the layout of the 5 floating mockup cards in the landing page hero section from a scattered pentagon layout to a tight, beautifully structured, overlapping 3D window stack (mockup deck).

---

## Files Created / Modified

### Modified
- `src/app/(marketing)/page.tsx` — Repositioned the 5 mockup cards into an overlapping, layered group centered around the main workspace dashboard mockup:
  - **Dashboard Mockup (Base)**: Positioned at `left: 70%`, `top: 32%`.
  - **Kanban Board (Top Left Overlap)**: Positioned at `left: 58%`, `top: 18%` (Z-index/translateZ: 60px).
  - **Finance Card (Top Right Overlap)**: Positioned at `left: 80%`, `top: 22%` (Z-index/translateZ: 55px).
  - **Lofi Focus Player (Bottom Left Overlap)**: Positioned at `left: 57%`, `top: 52%` (Z-index/translateZ: 80px).
  - **Calendar Card (Bottom Right Overlap)**: Positioned at `left: 76%`, `top: 56%` (Z-index/translateZ: 50px).

---

## Behavior Changes
- The mockups are now clustered as a single cohesive "Command Center" dashboard graphics group. They overlap beautifully in 3D depth layers and slide relative to each other dynamically with scroll parallax and cursor mouse-move hover effects.

---

## Verification
- `npm run lint` → ✅ Passed (No ESLint warnings or errors)
