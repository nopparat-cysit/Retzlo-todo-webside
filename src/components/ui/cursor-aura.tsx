"use client";

import { useEffect, useRef, useState } from "react";

export function CursorAura() {
  const [enabled, setEnabled] = useState(false);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function readEnabledPreference() {
      if (reducedMotionQuery.matches) return false;
      return window.localStorage.getItem("retrod:cursor-effects") !== "off";
    }

    function syncPreference() {
      setEnabled(readEnabledPreference());
    }

    syncPreference();
    reducedMotionQuery.addEventListener("change", syncPreference);
    window.addEventListener("storage", syncPreference);

    return () => {
      reducedMotionQuery.removeEventListener("change", syncPreference);
      window.removeEventListener("storage", syncPreference);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let pendingX = -9999;
    let pendingY = -9999;
    let hasScheduledFrame = false;

    function updateCursor(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      pendingX = event.clientX;
      pendingY = event.clientY;

      if (!hasScheduledFrame) {
        hasScheduledFrame = true;
        frame = window.requestAnimationFrame(() => {
          if (auraRef.current) {
            auraRef.current.style.transform = `translate3d(${pendingX}px, ${pendingY}px, 0)`;
          }
          hasScheduledFrame = false;
        });
      }
    }

    window.addEventListener("pointermove", updateCursor, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", updateCursor);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={auraRef} className="cursor-aura" data-cursor-aura aria-hidden="true" />;
}
