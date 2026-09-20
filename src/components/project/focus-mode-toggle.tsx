"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FocusModeToggle() {
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsFocusMode(document.body.classList.contains("focus-mode"));
    }

    const handleFocusModeEvent = (e: CustomEvent<{ isFocusMode: boolean }>) => {
      setIsFocusMode(Boolean(e.detail?.isFocusMode));
    };

    window.addEventListener("focus-mode-toggle" as any, handleFocusModeEvent);
    return () => {
      window.removeEventListener("focus-mode-toggle" as any, handleFocusModeEvent);
      if (typeof document !== "undefined") {
        document.body.classList.remove("focus-mode");
      }
    };
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        document.body.classList.toggle("focus-mode", next);
      }
      window.dispatchEvent(
        new CustomEvent("focus-mode-toggle", { detail: { isFocusMode: next } })
      );
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never intercept browser combinations like Ctrl+F, Cmd+F, or Alt shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isInput) return;

      // Don't intercept when a modal, dialog, or radix portal is open
      if (typeof document !== "undefined") {
        const hasOpenDialog = Boolean(
          document.querySelector("[role='dialog'], [data-radix-portal], .confirm-modal")
        );
        if (hasOpenDialog || target.closest("[role='dialog'], [data-radix-portal]")) {
          return;
        }
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFocusMode]);

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleFocusMode}
            aria-label={isFocusMode ? "Exit focus mode" : "Focus mode"}
            className={cn(
              "h-9 w-9 shrink-0 rounded-lg border text-stone-400 transition cursor-pointer select-none",
              isFocusMode
                ? "border-dusk-lavender/45 bg-dusk-lavender/15 text-dusk-lavender shadow-[0_0_12px_rgba(169,162,255,0.2)]"
                : "border-white/10 bg-white/[0.045] hover:border-dusk-lavender/45 hover:bg-dusk-lavender/10 hover:text-dusk-lavender"
            )}
          >
            {isFocusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          <p className="text-xs">
            {isFocusMode ? "Exit focus mode (F)" : "Focus mode (F)"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
