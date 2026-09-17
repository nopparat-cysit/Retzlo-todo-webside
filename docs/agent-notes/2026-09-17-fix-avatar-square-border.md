# Work Session Note: Fix Square Border Around Circular Avatar

- **Date**: 2026-09-17
- **Objective**: Fix the square black border and unwanted photo border rendered around circular user avatars in `Avatar` and `AvatarStack`.

## Files Created, Modified, Deleted, or Moved

- **Modified**:
  - `src/components/ui/avatar.tsx`: Added `rounded-full` to the outer root `<span>` of `Avatar`; removed unwanted colored border (`border-purple-500/30`) when `avatarSrc` is present; ensured `AvatarStack` only applies `ring` when multiple avatars overlap (`visible.length > 1`) and enforces `rounded-full` circular geometry.

## Important Behavior Changes

- **No Square Border Box**: Resolved the issue where `className="ring-1 ring-ink-950"` applied to `Avatar` produced a 1px square black outline because the outer root `<span>` was missing `rounded-full` while only the inner `<span>` was circular.
- **Clean Photo Avatars**: When a user has a custom profile photo (`avatarSrc`), the photo is displayed cleanly without an artificial purple ring overlay from `colorClass`.
- **Standalone Assignees**: When a card or component has a single assignee, no cutout ring is rendered around it, leaving a clean circular avatar.

## Database/Schema Changes

- None (Zero database or schema changes).

## Verification Commands Run & Results

- `npm test`: Passed (51 test files passed, 193 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Passed (`prisma generate && next build` compiled 31 static/dynamic pages with 0 errors).

## Known Follow-ups, Blockers, or Deployment Notes

- Pushed to `origin main` for automatic production deployment.
