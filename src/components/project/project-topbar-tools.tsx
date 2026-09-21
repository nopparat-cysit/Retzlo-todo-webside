"use client";

import { Leaf, Moon, Sparkles, Timer, Volume2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { LofiPlayer } from "@/components/project/lofi-player";
import { NixiePomodoro } from "@/components/project/nixie-pomodoro";
import { PixelMoon } from "@/components/project/pixel-moon";
import { ZenGarden } from "@/components/project/zen-garden";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ToolId = "ambience" | "focus" | "phase" | "garden";

const tools: Array<{
  id: ToolId;
  label: string;
  icon: typeof Volume2;
  panel: ReactNode;
}> = [
  { id: "ambience", label: "Ambience", icon: Volume2, panel: <LofiPlayer /> },
  { id: "focus", label: "Focus", icon: Timer, panel: <NixiePomodoro /> },
  { id: "phase", label: "Phase", icon: Moon, panel: <PixelMoon /> },
  { id: "garden", label: "Garden", icon: Leaf, panel: <ZenGarden /> },
];

export function ProjectTopbarTools() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMobileTool, setSelectedMobileTool] = useState<ToolId>("ambience");

  return (
    <TooltipProvider delayDuration={250}>
      {/* Compact (< xl): Single Studio Tools button to avoid topbar overlap */}
      <div className="xl:hidden">
        <Popover open={mobileOpen} onOpenChange={setMobileOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Studio tools"
              className={cn(
                "h-9 w-9 rounded-lg border text-stone-400 transition",
                mobileOpen
                  ? "border-dusk-lavender/45 bg-dusk-lavender/12 text-dusk-lavender"
                  : "border-white/10 bg-white/[0.045] hover:border-dusk-lavender/45 hover:bg-dusk-lavender/10 hover:text-dusk-lavender"
              )}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={10}
            className="w-[min(340px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border-white/15 bg-[#020208] p-2.5 shadow-[0_24px_64px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] [&>*]:!mt-0"
          >
            <div className="grid grid-cols-4 gap-1 border-b border-white/10 pb-2 mb-2">
              {tools.map((t) => {
                const TIcon = t.icon;
                const isCurrent = selectedMobileTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedMobileTool(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition",
                      isCurrent
                        ? "bg-dusk-lavender/20 text-dusk-lavender border border-dusk-lavender/40"
                        : "text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <TIcon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <div>
              {tools.find((t) => t.id === selectedMobileTool)?.panel}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Wide Desktop (xl+): Expanded separate tool buttons */}
      <div className="relative hidden xl:flex items-center gap-1.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <Popover
              key={tool.id}
              open={isActive}
              onOpenChange={(open) => setActiveTool(open ? tool.id : null)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={tool.label}
                      className={cn(
                        "h-9 w-9 rounded-lg border text-stone-400 transition",
                        isActive
                          ? "border-dusk-lavender/45 bg-dusk-lavender/12 text-dusk-lavender"
                          : "border-white/10 bg-white/[0.045] hover:border-dusk-lavender/45 hover:bg-dusk-lavender/10 hover:text-dusk-lavender"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">{tool.label}</TooltipContent>
              </Tooltip>

              <PopoverContent
                align="end"
                sideOffset={10}
                className="w-80 overflow-hidden rounded-xl border-white/15 bg-[#020208] p-2 shadow-[0_24px_64px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] [&>*]:!mt-0"
              >
                {tool.panel}
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
