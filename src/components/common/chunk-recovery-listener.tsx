"use client";

import { useEffect } from "react";
import {
  isChunkLoadError,
  triggerChunkReload,
  clearChunkReloadFlag,
} from "@/lib/chunk-recovery";

export function ChunkRecoveryListener(): null {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const errorCandidate = event.error || event.message;
      if (isChunkLoadError(errorCandidate) || isChunkLoadError(event)) {
        triggerChunkReload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason) || isChunkLoadError(event)) {
        triggerChunkReload();
      }
    };

    window.addEventListener("error", handleGlobalError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    // After 5 seconds of stable execution, clear the reload cooldown flag
    const timer = window.setTimeout(() => {
      clearChunkReloadFlag();
    }, 5000);

    return () => {
      window.removeEventListener("error", handleGlobalError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
