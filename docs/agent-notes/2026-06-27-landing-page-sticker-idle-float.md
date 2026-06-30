# Agent Work Note - June 27, 2026

## Objective
Implement smooth floating micro-animations (idle movements) for all stickers on the marketing landing page, ensuring they continue to move organically when the user is not scrolling.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - [src/app/globals.css](file:///c:/Users/Nopparat/Documents/Todo/src/app/globals.css) - Added three alternate floating keyframe animations (`sticker-float-slow`, `sticker-float-medium`, `sticker-float-fast`).
  - [src/app/(marketing)/page.tsx](file:///c:/Users/Nopparat/Documents/Todo/src/app/(marketing)/page.tsx) - Wrapped each sticker image tag inside an animated sub-container with these class names to combine scroll-parallax with native idle movement.

## Important Behavior Changes
- Landing page stickers now float gently up and down and rotate back and forth (wobble) organically when stationary, making the page feel alive and premium.

## Database/Schema Changes
- None.

## Verification Commands Run and Their Result
- `npm run lint` - Completed successfully (No ESLint warnings or errors).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
