# 2026-06-26 — Fix Hero Card Visibility

## Objective
Fix a bug where the floating mockup cards disappeared from the desktop view after adding responsive utility classes.

---

## Files Created / Modified

### Modified
- `src/app/(marketing)/page.tsx` — Updated Tailwind classes of the 5 floating cards to include `lg:block`:
  - Changed `hidden lg:absolute` to `hidden lg:block lg:absolute` for all 5 cards.

---

## Behavior Changes
- The 5 floating cards are now correctly displayed on large screens (`>= 1024px`) using `display: block` and `position: absolute`.
- They remain hidden on mobile viewports as intended.

---

## Verification
- `npm run lint` → ✅ Passed (No ESLint warnings or errors)
