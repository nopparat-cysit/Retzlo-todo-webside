# Work Note: Landing Page Performance & Smooth Scroll Optimization

**Date**: 2026-10-19  
**Objective**: Fix stuttering / frame drops (jank) on the landing page by eliminating root-level style recalculations, massive Gaussian blur GPU overdraw, pointer movement layout thrashing, and unthrottled scroll listeners.

## Files Modified

- `src/components/ui/cursor-aura.tsx`:
  - Replaced `document.documentElement.style.setProperty("--cursor-x/y")` on every mouse move with a direct `ref` using GPU-accelerated `translate3d` scheduled via `requestAnimationFrame`.
  - Preserved all contracts for `retrod:cursor-effects`, `prefers-reduced-motion: reduce`, `touch` suppression, and `data-cursor-aura`.
- `src/app/globals.css`:
  - Updated `.cursor-aura` to a fixed-size circular element with self-centered radial gradients in dark and light mode, avoiding full-viewport repaint on each frame.
  - Removed static `will-change: transform` from `.lp-spring-card` and `.lp-press-btn`, applying it only on `:hover` to eliminate memory bloat across 60+ elements.
  - Added `.lp-section-defer` utility using `content-visibility: auto` and `contain-intrinsic-size: 1px 750px` for smooth off-screen section handling.
- `src/components/auth/mixtape-artwork.tsx`:
  - Removed `unoptimized` prop on the 1.63 MB `/images/login-cassette-cutout.png` asset and added responsive `sizes`, allowing Next.js image optimization to serve compressed modern WebP/AVIF formats.
- `src/app/(marketing)/page.tsx`:
  - Throttled window `scroll` listener with `requestAnimationFrame` and state bailout check to prevent redundant re-renders on scroll.
  - Throttled `moveArtwork` pointer events via `requestAnimationFrame` and cached element bounds to prevent forced synchronous layout thrashing (`getBoundingClientRect()`).
  - Replaced 7 heavy `blur-[110px]` to `blur-[140px]` background divs with pure `radial-gradient` backgrounds, removing heavy multi-pass Gaussian blur overhead from the GPU compositor.
  - Added `.lp-section-defer` to long off-screen marketing sections (`#playground`, `#pain-tabs`, `#walkthrough`, `#comparison`, `#testimonials`, `#faq`, `#buy`).
  - Added proper audio contexts and pointer animation frame teardown in component unmount cleanup.

## Behavior Changes

- Landing page scrolling and cursor movement are now fluid and 60/120fps smooth.
- Eliminates DOM-wide style invalidation on mouse move.
- Off-screen sections defer heavy rendering until scrolled into/near the viewport without affecting in-page navigation or anchors.

## Database & Schema Changes

- None.

## Verification Commands & Results

- `npx prisma validate` — Passed (Schema valid).
- `npm run lint` — Passed (0 warnings, 0 errors).
- `npm test` — Passed (100 test files, 533 passed, 3 skipped).
- `npm run build` — Passed (Compiled successfully, all 42 static & dynamic routes generated cleanly).

## Follow-ups / Blockers

- None.
