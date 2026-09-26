# 2026-09-26 Fix Card Modal Auto Scroll on Open

## Objective
Fix the issue where opening the card details modal (`CardModal`) caused the modal to automatically scroll down and cut off the top card title and description.

## Root Cause
In `src/components/kanban/card-chat-timeline.tsx`, an initial load and comment arrival effect was invoking `messagesEndRef.current?.scrollIntoView()`. In the browser DOM specification, `Element.scrollIntoView()` scrolls all ancestor scroll containers (including the modal's primary scroll container) until the target element is visible. When a card loaded with comments or activity items, this scrolled the entire modal body down to the "Discussion & Activity" section.

## Files Modified
- `src/components/kanban/card-chat-timeline.tsx`: Replaced `messagesEndRef` and `scrollIntoView()` with a direct `streamContainerRef` on the chat scroll container (`overflow-y-auto`). Now sets `scrollTop` directly on the local stream element, completely preventing any scrolling of the parent modal.
- `src/components/kanban/card-modal.tsx`: Added `modalBodyRef` to the scrollable modal container with an effect that resets `scrollTop = 0` whenever the modal opens or switches cards.

## Verification
- `npx vitest run`: Passed (66 test files, 320 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).

## Deployment Notes
- Ready to commit and push.
