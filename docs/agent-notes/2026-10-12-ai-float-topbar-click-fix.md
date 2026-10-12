# Fix Topbar & Board Toolbar Click Interception in AI Float Mode

**Date:** 2026-10-12  
**Objective:** Fix issue where opening Retzlo AI in small floating mode prevented users from clicking topbar navigation controls (theme, language, notification bell, command palette, AI sparkle trigger, user profile, help button) and board toolbar actions (AI Summary, Notes, Export, ••• More menu, + Column).

---

## Root Cause Analysis

When Retzlo AI opened in floating window mode, `FabHub` was shifted upward to `bottom-[calc(min(560px,85vh)+2rem)]` at high z-index `z-[120]`. Although the inner action buttons container had `opacity-0` when closed (`!isOpen`), its child `<PinnedDisplayPanel>` (~384px wide by ~400px tall) remained unconditionally rendered in the DOM layout. Furthermore, the outer `containerRef` element had no `pointer-events-none` rule.

Consequently, `containerRef` formed an invisible 384px-wide by 500px-tall rectangular barrier extending from 592px above the bottom of the screen off the top edge of the viewport. Because `containerRef` (`z-[120]`) sat above the topbar header (`z-40`) and board toolbar (`z-10`), any click aimed at the topbar or board actions hit this invisible container, rendering the entire top navigation unresponsive.

---

## Files Modified

- `src/components/hub/fab-hub.tsx`:
  - Added `pointer-events-none` to the outer `containerRef` so any unused space or boundaries pass clicks through unconditionally.
  - Added `pointer-events-auto` strictly to the interactive FAB button (`#fab-hub-btn`) and open panel container.
  - Conditionally rendered `<PinnedDisplayPanel>` only when `isOpen && redStar` is truthy, and added `hidden` when closed so the panel occupies zero physical DOM layout height when inactive.
  - Added `if (!isOpen) return;` guard to the outside-click listener so document-level pointer listeners do not run when `FabHub` is closed.
- `src/components/ai/ai-chat-widget.tsx`:
  - Added top clearance to floating mode max height (`max-h-[min(85vh,calc(100dvh-5.5rem))]`), ensuring the floating chat window never reaches into the topbar header area even on small-height laptop screens.
- `src/components/ai/ai-chat-responsive-layout.test.ts`:
  - Added assertions to verify non-blocking `pointer-events-none` on `containerRef`, `pointer-events-auto` on the FAB button, and `isOpen && redStar ?` conditional rendering of the pinned panel.

---

## Behavior Changes

1. **Top Navigation Clickability:**
   - With AI Chat open in small floating mode, all topbar actions (theme toggle, language switcher, command palette, notification bell, AI chat toggle, user avatar, help guide) and board actions (AI Summary, Notes, Export, ••• More menu, + Column) are 100% responsive and clickable.
2. **FAB Hub Safety:**
   - When FAB Hub is closed, it consumes strictly 56px x 56px of layout space at its button position, leaving all space above it transparent to pointer events.
   - When FAB Hub is opened, the pinned panel renders properly with full interactive controls, and AI Chat shifts left (`sm:right-[calc(24rem+2rem)]`).
3. **Responsive Height Protection:**
   - Floating AI chat dynamically caps its height on short screens to guarantee topbar clearance.

---

## Database / Schema Changes

None.

---

## Verification Results

1. **TypeScript Check:**
   ```bash
   npx tsc --noEmit
   # Exit code 0, 0 errors
   ```
2. **ESLint:**
   ```bash
   npm run lint
   # Exit code 0, No ESLint warnings or errors
   ```
3. **Unit & Regression Tests:**
   ```bash
   npx vitest run
   # Test Files: 95 passed (95)
   # Tests: 498 passed | 3 skipped (501)
   ```
4. **Next.js Production Build:**
   ```bash
   npm run build
   # Compiled successfully, 40/40 static pages generated, Exit code 0
   ```
5. **Prisma Schema Validation:**
   ```bash
   npx prisma validate
   # The schema at prisma\schema.prisma is valid
   ```

---

## Deployment & Follow-ups

- Changes are fully self-contained and backwards compatible with both floating and sidepanel view modes.
