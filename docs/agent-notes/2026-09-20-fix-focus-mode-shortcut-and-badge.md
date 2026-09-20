# Work Note: Fix Focus Mode Shortcut Hijacking and Interactive Board Badge

**Date:** 2026-09-20  
**Objective:** Fix focus mode bugs where standard browser shortcuts (`Ctrl+F`/`Cmd+F`) were intercepted, typing in modals toggled focus mode, the `FOCUS ACTIVE` badge on the Kanban board was static/unclickable, and board helper text contradicted the active focus state.

## 1. Issues & Root Causes

1. **Browser Search Shortcut Hijacking:**  
   In `src/components/project/focus-mode-toggle.tsx`, the `keydown` listener checked `e.key === "f" || e.key === "F"` without checking for modifier keys (`e.ctrlKey`, `e.metaKey`, `e.altKey`). When users pressed `Ctrl+F` or `Cmd+F` to search for text on the page in Google Chrome or other browsers, the listener intercepted the shortcut, called `e.preventDefault()`, and unexpectedly toggled Focus Mode.
2. **Modal Context Awareness:**  
   Pressing `F` while a modal, dialog, or popover was open would toggle focus mode behind the modal.
3. **Non-interactive `FOCUS ACTIVE` Badge:**  
   In `src/components/kanban/board.tsx`, the `FOCUS ACTIVE` badge was rendered as a static `<span>`. When users accidentally entered focus mode or wished to exit, clicking on the badge did nothing.
4. **Contradictory Copy:**  
   Under the board title, the copy continued to state `"Drag cards across columns. Press F for focus."` even when Focus Mode was already active.
5. **Zen Garden Missing Emoji Glyphs on Windows:**  
   In `src/components/project/zen-garden.tsx`, Unicode 13/15 emojis (`🪻`, `🪴`) rendered as missing boxes (`▯`) on Windows fonts; replaced with universally supported Unicode 6 emojis (`🌸`, `🎋`).

## 2. Changes Made

- **`src/components/project/focus-mode-toggle.tsx`:**
  - Added guard: `if (e.ctrlKey || e.metaKey || e.altKey) return;` so browser Find (`Ctrl+F`, `Cmd+F`) works normally.
  - Added modal check: Ignored keydown events when any `[role='dialog']` or `[data-radix-portal]` is open or focused.
- **`src/components/kanban/board.tsx`:**
  - Added `toggleFocusMode` callback dispatching `focus-mode-toggle` event.
  - Transformed `FOCUS ACTIVE` into an interactive, accessible button (`<button onClick={toggleFocusMode} ...>`) with an `✕` exit affordance and hover state.
  - Dynamically updated the helper copy to `"Focus mode active. Press F or click the badge to exit."` when active.
- **`src/components/project/zen-garden.tsx`:**
  - Replaced `🪻` with `🌸` and `🪴` with `🎋` to prevent missing glyph boxes on Windows.
- **`src/components/project/project-shell.test.ts`:**
  - Added unit test assertions verifying shortcut guards and board interactive badge.

## 3. Verification Results

- `npm test`: 61 test files passed, 279 tests passed (100%).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Production build verified successfully for all 35 routes.
