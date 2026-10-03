"use client";

import { useEffect, type RefObject } from "react";

/**
 * Robust click-outside and escape dismiss hook using the capture phase.
 * Works reliably even when parent modals/dialogs intercept or stop event propagation.
 */
export function useOutsideClickDismiss(
  isOpen: boolean,
  onDismiss: () => void,
  contentRef: RefObject<HTMLElement | null>,
  triggerRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      // Click is inside the popover content -> keep open
      if (contentRef.current && contentRef.current.contains(target)) {
        return;
      }

      // Click is inside the trigger button -> let trigger handle toggle
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }

      // Click is outside -> dismiss
      onDismiss();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onDismiss();
      }
    }

    // Capture phase (useCapture = true) ensures this runs before any child or modal stopPropagation()
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onDismiss, contentRef, triggerRef]);
}
