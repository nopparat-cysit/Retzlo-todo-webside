# Marketing Landing Page Sticky Navbar Follow Fix

## Date and Short Objective
- **Date:** 2026-10-18
- **Objective:** Fix the marketing landing page top navigation bar so it follows the user when scrolling down ("ให้ Navbar เลื่อนตาม") by resolving an ancestor overflow conflict and adding dynamic scroll elevation.

## Files Created, Modified, Deleted, or Moved
- **Created:**
  - `docs/agent-notes/2026-10-18-sticky-navbar-scroll-follow.md`
- **Modified:**
  - `src/app/(marketing)/page.tsx`:
    - Replaced `className="relative overflow-x-hidden"` with `className="relative overflow-x-clip"` on the `<main>` container. Previously, `overflow-x: hidden` forced `overflow-y` to compute as `auto`, creating an internal scroll context that detached `<header>`'s `position: sticky; top: 0` from window scrolling. `overflow-x: clip` prevents horizontal bleed while preserving native viewport sticky behavior.
    - Added `isScrolled` React state with a passive window scroll event listener (`window.scrollY > 15`).
    - Enhanced `<header>` styling: dynamically transitions to a deeper backdrop blur (`blur(20px)`), higher panel opacity (`94%`), and subtle elevation shadow (`shadow-[0_8px_30px_rgba(0,0,0,0.12)]`) when scrolled down.

## Important Behavior Changes
- The top Navbar now smoothly and continuously follows the user across the entire landing page as they scroll down.
- Clicking any anchor link in the navbar or mobile menu smoothly navigates to the section with proper `scroll-mt-20 sm:scroll-mt-24` offset below the sticky header.
- Mobile drawer menu stays pinned at the top when toggled while scrolling.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/auth/auth-navigation.test.ts` (3/3 passed)
- `npx tsc --noEmit` (0 errors)
- `npm run lint` (0 warnings, 0 errors)
- `npx prisma validate` (valid schema)
- `npm run build` (successful compilation, 42/42 static/dynamic routes generated)

## Follow-ups / Blockers
- None.
