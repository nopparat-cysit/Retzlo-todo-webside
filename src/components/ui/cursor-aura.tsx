"use client";

import { useEffect } from "react";

export function CursorAura() {
  useEffect(() => {
    let frame = 0;

    function updateCursor(event: PointerEvent) {
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
  }, []);

  return <div className="cursor-aura" aria-hidden="true" />;
}
