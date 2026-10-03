# Work Note: AI Chat Default Sidebar & Responsive Bottom-Right FAB Displacement

**Date:** 2026-10-04  
**Objective:** Set AI Chat to default to docked right sidebar on first open, automatically render at the bottom-right when shrinking the screen or in float mode, and dynamically displace the bottom-right Star FAB button upward above the chat window to prevent overlap.

---

## 1. Files Created, Modified, or Moved

### Created
- `src/components/ai/ai-chat-responsive-layout.test.ts`: Vitest test suite verifying AI Chat context default `sidepanel`, responsive bottom-right placement for floating/small-screen mode, and Star FAB displacement.
- `docs/agent-notes/2026-10-04-ai-chat-sidebar-responsive-layout.md`: This work note.

### Modified
- `src/components/ai/ai-chat-context.tsx`:
  - Added `viewMode: "sidepanel" | "float"` defaulting to `"sidepanel"`.
  - Added `setViewMode: (mode: "sidepanel" | "float") => void`.
  - Added `isSmallScreen: boolean` tracking `window.innerWidth < 1024`.
- `src/components/ai/ai-chat-widget.tsx`:
  - Consumed `viewMode`, `setViewMode`, and `isSmallScreen` from `useAiChat()`.
  - Changed float mode placement from bottom-left to bottom-right (`bottom-4 right-4 sm:bottom-6 sm:right-6`).
  - Automatically rendered as bottom-right floating card when `viewMode === "float"` or on narrow screens (`isSmallScreen`).
  - Docked as right sidebar panel on desktop (`lg:`) when in `sidepanel` mode (`top-0 right-0 bottom-0 w-[380px] sm:w-[450px]`).
  - Updated toggle button tooltip to reflect bottom-right floating mode (`สลับเป็นกล่องแชทลอย (ขวาล่าง)`).
- `src/components/hub/fab-hub.tsx`:
  - Consumed `useAiChat()`.
  - Dynamically repositioned container with smooth CSS transition (`transition-all duration-300 ease-in-out`):
    - When AI chat is open at bottom right (`viewMode === "float"` or small screen): shifted upward to `bottom-[calc(min(560px,85vh)+1.5rem)] right-4 sm:bottom-[calc(min(560px,85vh)+2rem)] sm:right-6`, sitting directly above the chat window with a 16px gap.
    - When AI chat is in desktop sidebar mode: shifted to the left of the docked sidebar (`lg:bottom-6 lg:right-[calc(450px+1.5rem)]`).
    - When AI chat is closed: returned to resting position (`bottom-4 right-4 sm:bottom-6 sm:right-6`).
  - Added `compactTop` prop to `PinnedDisplayPanel` to constrain maximum height to remaining viewport space and prevent top overflow when the button is shifted up.
- `docs/system-guide.md`: Updated Section 2.1 describing initial sidebar mode, responsive bottom-right float, and automatic Star FAB displacement.
- `src/components/help/help-center-client.tsx`: Updated interactive Knowledge Base topic `ai-assistant` with the new responsive sidebar and floating behavior.

---

## 2. Important Behavior Changes

1. **AI Chat Initial Sidebar Mode:**
   - When the user opens AI Chat for the first time via the topbar trigger (`🤖`), it defaults to `"sidepanel"` docked along the right edge of the screen (Gemini-in-Sheets style).
2. **Responsive Bottom-Right Floating Mode:**
   - When the screen width is narrower than 1024px (mobile, tablet, or resized browser window), AI Chat automatically renders as a rounded floating card at the **bottom-right** of the screen (`bottom-4 right-4 sm:bottom-6 sm:right-6`).
   - On wide desktop screens, users can still toggle between sidebar and bottom-right floating card using the header panel button.
3. **Star Button Displacement:**
   - The Star FAB button (`FabHub`) at the bottom-right glides up smoothly above the chat window whenever AI Chat is open at the bottom-right, keeping both the Star button and the AI chat input accessible without any overlap.
   - On desktop sidebar mode, the Star FAB button moves to the left of the sidebar (`right-[474px]`).

---

## 3. Database / Schema Changes

- None required for this UI layout task.

---

## 4. Verification Commands & Results

- `npx tsc --noEmit`: Passed with 0 errors.
- `npm run lint`: Passed with 0 errors / warnings.
- `npx vitest run src/components/ai/ai-chat-responsive-layout.test.ts`: Passed (4/4 tests).
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests).
- `npx prisma validate`: Schema is valid.
- `npm run build`: Compiled successfully; all 36 routes generated.

---

## 5. Gemini AI Rainbow Icon & Transparent Triggers
- Created `src/components/ai/gemini-sparkle-icon.tsx` with authentic Gemini 4-point astroid star + companion stars with vibrant 5-stop rainbow gradient (`#38bdf8` -> `#818cf8` -> `#c084fc` -> `#f472b6` -> `#fbbf24`).
- Updated `src/components/ai/ai-chat-trigger.tsx` to remove background box and border, rendering the rainbow Gemini sparkle icon with soft hover states.
- Updated `src/components/ui/help-button.tsx` to remove background box and border, rendering a clean ghost icon button matching the AI trigger.
- Updated `src/components/ai/ai-chat-widget.tsx` header to render the Gemini rainbow icon for visual consistency.

---

## 6. Follow-ups & Deployment Notes

- Ready to commit and push to remote repository.
