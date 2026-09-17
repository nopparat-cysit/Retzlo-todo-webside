# Redesign Accept Invitation Page & Unify Auth Layouts

- **Date**: 2026-09-17
- **Objective**: Fix `/accept-invitation` page being stuck on the left 25% of the screen with an empty dark void and alarming red error box for already-accepted invitations, redesigning it into a centered, elegant, responsive Retro Lo-Fi page with courteous states and project preview cards.

## Files Modified

- `src/components/auth/auth-scene.tsx`:
  - Added support for `cardClassName?: string` and `hideHeader?: boolean` in `AuthSceneProps` to allow flexible card widths while preserving full atmospheric scene centering.
- `src/app/(auth)/accept-invitation/page.tsx`:
  - Replaced left-pinned `PageShell` with `<AuthScene>`, achieving seamless centering, responsive typography, and signature atmospheric night sky aesthetic.
- `src/app/(auth)/reset-password/page.tsx`:
  - Replaced left-pinned `PageShell` with `<AuthScene>` for visual consistency across all auth pages.
- `src/components/auth/accept-invitation.tsx`:
  - Completely redesigned all invitation states:
    - **Already Accepted (`status === "ACCEPTED"`)**: Displays a positive, celebratory cyan badge (`CheckCircle2`), polite status message, full project preview card with inviter info, and a direct button to enter the project board (`/project/${id}/board`), eliminating the alarming red error box.
    - **Expired (`isExpired`)**: Courteous amber badge (`Clock`), clear expiration explanation, project preview card, and action to return to projects.
    - **Declined (`status === "DECLINED"`)**: Neutral badge (`XCircle`), clear explanation, and action to return to projects.
    - **Not Found / Invalid Token**: Rose alert badge (`AlertCircle`), clean explanation, and action to return to projects.
    - **Not Logged In (`!isLoggedIn`)**: Shows project preview card, target email notice, and clear Sign In / Create Account buttons.
    - **Different Email (`!isEmailMatch`)**: Clear notice showing both current email and invited email, with option to switch accounts.
    - **Logged In & Matching (`isLoggedIn && isEmailMatch`)**: Project preview card, Member role badge, direct Accept & Join button with loading state, and Decline button with `ConfirmModal` guard.
- `src/components/auth/auth-navigation.test.ts`:
  - Added unit tests verifying `AuthScene` usage in `accept-invitation` and `reset-password`, as well as `ACCEPTED` state handling in `accept-invitation.tsx`.

## Important Behavior Changes

- `/accept-invitation` is now perfectly centered on all screen sizes with the Retzlo retro lofi aesthetic (starry night, vinyl, atmospheric glow).
- When an invitation was already accepted, users are greeted with a positive confirmation and a direct button to open the project, instead of an intimidating red error box.
- Direct inline actions for accepting and declining invitations without requiring nested popup modals on a dedicated page.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test`: 51 test suites, 196 tests passed.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production build verified.
