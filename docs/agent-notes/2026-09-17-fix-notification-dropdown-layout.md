# Fix Notification Dropdown Layout & Topbar Stretching

- **Date**: 2026-09-17
- **Objective**: Fix the notification dropdown (`NotificationsPopover`) being rendered in normal document flow inside the workspace topbar, stretching the header height to 180px and pushing adjacent buttons out of alignment due to `.lofi-panel`'s `position: relative` overriding `position: absolute`.

## Files Modified

- `src/components/notifications/notifications-popover.tsx`:
  - Replaced manual `relative`/`absolute` DOM hierarchy and custom `mousedown` click-outside listeners with standard `@radix-ui/react-popover` primitives (`Popover`, `PopoverTrigger`, `PopoverContent`).
  - Rendered notification dropdown via Radix Portal (`document.body`) with `align="end"` and `sideOffset={8}`, ensuring the dropdown floats above the page without stretching or polluting the header container.
  - Added `shrink-0` to the trigger button to guarantee fixed 36x36px dimensions inside the header.
- `src/components/notifications/invitation.test.ts`:
  - Added assertions verifying `NotificationsPopover` properly utilizes Radix UI `Popover`, `PopoverTrigger`, and `PopoverContent`.

## Important Behavior Changes

- Opening the notification menu no longer stretches the workspace topbar height or displaces neighboring tools and the user profile avatar.
- The notification popover cleanly floats anchored to the bottom-right of the bell trigger button with automatic viewport collision adjustment.
- Click-outside, Escape-to-close, and focus restoration are now handled reliably by Radix UI.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test`: 52 test suites, 199 tests passed (100%).
- `npm run lint`: 0 warnings, 0 errors.
- `npm run build`: Production build verified for all 31 routes.
- `npx prisma validate`: Schema is valid.
