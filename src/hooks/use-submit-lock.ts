import { useCallback, useRef, useState } from "react";
import { createSubmitLock } from "@/lib/forms/submit-lock";

export { createSubmitLock };

/**
 * React hook to guard against rapid double-clicks, Enter key repeats, and race conditions.
 *
 * Uses a synchronous ref lock (`isLockedRef`) so subsequent clicks in the very same
 * JavaScript event loop turn are discarded immediately before React re-renders.
 */
export function useSubmitLock() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLockedRef = useRef(false);

  const runWithLock = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
      if (isLockedRef.current) {
        return undefined;
      }

      isLockedRef.current = true;
      setIsSubmitting(true);

      try {
        return await action();
      } finally {
        isLockedRef.current = false;
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    isSubmitting,
    runWithLock,
    isLocked: () => isLockedRef.current
  };
}
