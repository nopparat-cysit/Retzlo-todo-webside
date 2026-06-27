# 2026-06-26 — Align Text Container Padding

## Objective
Align the hero text container horizontal padding to match the global layout grid.

---

## Files Created / Modified

### Modified
- `src/app/(marketing)/page.tsx` — Adjusted left and right padding:
  - Changed `px-6 md:px-12 lg:px-16` to `px-6` on the `max-w-7xl mx-auto` hero text container.
  - This ensures the text elements align perfectly with the logo and menu items in the Navigation Bar and sections below, matching the global padding behavior.

---

## Behavior Changes
- The text layout is perfectly flush with the logo and grid elements on the left side across all viewport widths.

---

## Verification
- `npm run lint` → ✅ Passed (No ESLint warnings or errors)
