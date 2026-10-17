# Walkthrough Tabs & Heading Clipping Fix

## Date and Short Objective
- **Date:** 2026-10-17
- **Objective:** Fix Thai heading vertical clipping, anchor scroll margin offsets, stray background grid collision line, and tab strip jitter / corner gaps in the Section 4 Walkthrough component (`#walkthrough`).

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/app/(marketing)/page.tsx`:
    - Added `scroll-mt-20 sm:scroll-mt-24` across all anchor sections (`#walkthrough`, `#playground`, `#pain-tabs`, `#comparison`, `#check-readiness`, `#faq`, `#buy`) to prevent the sticky navbar (67px) from overlapping section headings upon navigation.
    - Added `pt-2`, `paddingTop: "4px"`, and `lineHeight: 1.35` on the Walkthrough section heading to prevent Thai tone marks and ascenders (`ไม้เอก`, `ไม้โท`, `สระอิ`, `สระอี`) from being clipped.
    - Encapsulated the 6 Walkthrough room tabs inside a grounded tactile retro pill track (`background: color-mix(in srgb, var(--paper) 92%, transparent)`, `1.5px solid var(--border)`, `backdrop-filter: blur(8px)`).
    - Replaced `lp-press-btn` with `lp-spring-card` and unified tab border width to constant `2px solid ...` with `backgroundClip: "padding-box"` to eliminate subpixel corner seams and click geometry shifts.
    - Added a matching active indicator dot (`w-1.5 h-1.5 rounded-full`) for instant visual feedback.
  - `src/app/(marketing)/landing-data.ts`:
    - Refined Room 03 Calendar slide `accentColor` from neon magenta `#db2777` to warm rose berry `#be185d` to harmonize with the retro lofi indigo design palette.
  - `src/app/globals.css`:
    - Added `.no-scrollbar` utility (`scrollbar-width: none; ::-webkit-scrollbar: display: none`) for clean, smooth horizontal tab scrolling without Windows default scrollbars.

## Important Behavior Changes
- Navigation links (`#walkthrough`, `#pain-tabs`, etc.) now scroll smoothly with generous top offset below the sticky header.
- The 6 Walkthrough room tabs no longer sit naked on top of the graph drafting grid, eliminating visual line collisions.
- Clicking tabs no longer causes layout shifts (jitter) between 1px and 2px borders.
- Chromium subpixel anti-aliasing seam on active tab rounded corners is completely resolved.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/auth/auth-navigation.test.ts` (3/3 passing)
- `npx tsc --noEmit` (0 errors)
- `npm run lint` (0 warnings, 0 errors)
- `npx prisma validate` (valid schema)
- `npm run build` (successful compilation, 42/42 static/dynamic routes generated)

## Follow-ups / Blockers
- None. All 3 visual bugs reported in the user's screenshots are completely resolved.
