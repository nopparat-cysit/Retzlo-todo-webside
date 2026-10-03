# 2026-10-03 — Cover Image Title Label in Workspace Identity

## Objective
Add a uppercase label (`Cover image`) above the cover image preview upload button in Project Settings (`Workspace identity` section), matching the typography and alignment of `PROJECT NAME` and `DESCRIPTION`.

## Files Created / Modified
- `src/components/project/settings-form.tsx` (modified): Wrapped the cover image upload button and helper text in a container with an uppercase label `<span className="block text-xs uppercase tracking-[0.16em] text-stone-500">Cover image</span>`, aligning vertically with `PROJECT NAME`. Added `hidden` HTML attribute to the file input to prevent spacing artifacts in Tailwind `space-y-2`.

## Important Behavior Changes
- The cover image area now has a prominent and consistent title label `COVER IMAGE` right above the image upload box in `/project/[id]/settings`.
- Perfectly aligns with `PROJECT NAME` and `DESCRIPTION` on the right column.

## Verification Run & Results
- `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 errors / warnings.
- `npx prisma validate`: Schema valid.
- `npx vitest run`: 76 test files passed, 377 tests passed.
- `npm run build`: Verified Next.js build.
