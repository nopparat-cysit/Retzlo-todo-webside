"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOmikujiSettings } from "@/lib/omikuji/omikuji-settings";
import { OmikujiModal } from "./omikuji-modal";
import { cn } from "@/lib/utils";

interface OmikujiTriggerProps {
  projectId?: string | null;
  className?: string;
  variant?: "icon" | "button";
}

export function OmikujiTrigger({
  projectId,
  className,
  variant = "icon"
}: OmikujiTriggerProps) {
  const { settings, mounted } = useOmikujiSettings();
  const [open, setOpen] = useState(false);

  // Listen to custom window event
  useEffect(() => {
    const handleOpen = () => {
      if (settings.enabled) {
        setOpen(true);
      }
    };
    window.addEventListener("open-omikuji", handleOpen);
    return () => window.removeEventListener("open-omikuji", handleOpen);
  }, [settings.enabled]);

  // If not mounted yet or feature toggle is disabled, render nothing
  if (!mounted || !settings.enabled) {
    return null;
  }

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            {variant === "icon" ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Asakusa Omikuji Fortune"
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 transition hover:bg-amber-500/20 hover:text-amber-700 hover:border-amber-500/40 dark:text-amber-400 dark:hover:text-amber-300 dark:border-amber-400/20 shadow-xs",
                  className
                )}
              >
                <span className="font-serif text-xs font-bold leading-none select-none">
                  籤
                </span>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
              </button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className={cn(
                  "flex items-center gap-1.5 border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
                  className
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>เซียมซี 100 ใบ</span>
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p className="font-semibold">Creative Fortune & Omikuji (เซียมซี 100 ใบ)</p>
            <p className="text-[10px] text-theme-muted">
              {settings.drawMode === "daily" ? "เซียมซีรายวัน · วันละ 1 ใบ" : "สุ่มอิสระ"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Omikuji Modal */}
      <OmikujiModal open={open} onClose={() => setOpen(false)} projectId={projectId} />
    </>
  );
}
