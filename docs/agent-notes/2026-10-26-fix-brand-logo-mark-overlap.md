# Work Note: Fix Brand Logo Mark Overlap on Wordmark

- Date: 2026-10-26
- Objective: Fix the header brand logo where the retro monitor logo icon overlapped and obscured the letter "r" in the "retzlo" wordmark (displaying as "'etzlo").

## Files Modified

- `src/components/auth/mixtape-logo-mark.tsx`:
  - Upgraded `MixtapeLogoMark` component to accept `className`, `width`, and `height` props with responsive default fallbacks (`width = 46`, `height = 36`).
  - Added `cn(styles.brandMark, className)` to allow container-based scaling.
- `src/components/auth/login-scene.module.css`:
  - Added `max-width: 100%` and `max-height: 100%` to `.brandMark` so the SVG scales within bounded containers without spilling over siblings.
- `src/app/(marketing)/page.tsx`:
  - Sized the brand logo icon container to `w-[36px] h-[28px]` matching the SVG aspect ratio.
  - Passed `className="w-full h-full" width={36} height={28}` to `MixtapeLogoMark`.
  - Increased flex gap from `gap-2` (8px) to `gap-2.5 sm:gap-3` (10-12px), eliminating all visual collision and giving the letter "r" clear spacing.

## Important Behavior Changes

1. **Complete Wordmark Visibility**: The "retzlo" brand text is now fully visible with clean letter spacing and no overlap from the retro monitor icon or its drop-shadow.

## Verification Commands Run & Results

- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx vitest run`: Passed (105 test files, 584 passed, 0 failed).
- `npm run build`: Passed (production build compiled successfully).
- `npx prisma validate`: Passed (schema is valid).
