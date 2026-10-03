# Work Note: Outside-Click Dismiss for Pickers Inside Modals

**Date:** 2026-10-04  
**Objective:** Resolve the issue where clicking outside TimePicker, DatePicker, or DateTimePicker popovers inside modal dialogs (such as CardModal) failed to dismiss them, ensuring clicking outside ("กดขอบนอก") or pressing Escape immediately closes the popover.

---

## 1. Files Created, Modified, or Moved

### Created
- `src/hooks/use-outside-click.ts`: Window capture-phase dismiss hook (`useOutsideClickDismiss`) handling both pointerdown and Escape key without being blocked by parent modal event cancellations.
- `src/components/ui/outside-click-dismiss.test.ts`: Vitest test suite testing hook structure and picker integration contracts.
- `docs/agent-notes/2026-10-04-outside-click-dismiss-pickers.md`: This work note.

### Modified
- `src/components/ui/time-picker.tsx`: Integrated `useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef)` and attached `triggerRef` and `contentRef`.
- `src/components/ui/date-picker.tsx`: Integrated `useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef)` and attached `triggerRef` and `contentRef`.
- `src/components/ui/date-time-picker.tsx`: Integrated `useOutsideClickDismiss(open, () => setOpen(false), contentRef, triggerRef)` and attached `triggerRef` and `contentRef`.

---

## 2. Important Behavior Changes

1. **Root Cause Analysis:** `AppModal` calls `event.stopPropagation()` on both overlay and modal container `pointerdown`/`click` to protect modal interactions. Radix UI Popover relies on bubbling pointerdown events to `document` to detect outside clicks. As a result, when a popover opened inside any modal, outside clicks were swallowed by `AppModal` and Radix never detected them.
2. **Capture-Phase Window Listener:** `useOutsideClickDismiss` attaches to `window.addEventListener("pointerdown", handlePointerDown, true)` with `useCapture: true`. The capture phase executes before child elements or parent modal wrappers can stop propagation.
3. **Safe Trigger & Content Detection:**
   - Clicks inside the popover content (`contentRef.current.contains(target)`) keep the popover open.
   - Clicks on the trigger button (`triggerRef.current.contains(target)`) let the button handle toggle state cleanly without double toggling.
   - Clicks anywhere outside immediately dismiss the popover (`setOpen(false)`).
   - Pressing the Escape key immediately closes the popover and stops propagation so the parent modal does not accidentally close at the same time.

---

## 3. Database / Schema Changes

- None required.

---

## 4. Verification Commands & Results

- `npx vitest run src/components/ui/`: All 9 test files passed (34 tests).
- `npx prisma validate`: Schema is valid.
- `npm run lint`: Passed with 0 errors / warnings.
- `npx tsc --noEmit`: Passed with 0 errors.
- `npm run build`: Compiled successfully; all 36 routes generated.

---

## 5. Follow-ups & Deployment Notes

- Fully compatible with existing modal dialogs and standalone pages.
