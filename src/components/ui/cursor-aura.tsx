"use client";

import { useEffect, useState } from "react";

export function CursorAura() {
  const [enabled, setEnabled] = useState(false);

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

    function updateCursor(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
      });
    }

    window.addEventListener("pointermove", updateCursor, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", updateCursor);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div className="cursor-aura" data-cursor-aura aria-hidden="true" />;
}
