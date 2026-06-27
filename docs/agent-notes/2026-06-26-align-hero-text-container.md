# 2026-06-26 — Align Hero Text Container

## Objective
Fix layout where the landing page hero text was pinned too close to the left edge of the viewport on widescreen monitors.

---

## Files Created / Modified

### Modified
- `src/app/(marketing)/page.tsx` — Wrapped the left-column text container in `max-w-7xl mx-auto w-full`:
  - Added `w-full max-w-7xl mx-auto` classes to the relative container.
  - Adjusted left paddings slightly to `px-6 md:px-12 lg:px-16` for perfect alignment with the navigation bar logo and standard layout margins.

---

## Behavior Changes
- The hero text aligns perfectly with the Navigation Bar and Bento grids below, rather than sticking to the far left of widescreen viewports.

---

## Verification
- `npm run lint` → ✅ Passed (No ESLint warnings or errors)
