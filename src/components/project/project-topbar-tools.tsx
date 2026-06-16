"use client";

import { Leaf, Moon, Timer, Volume2 } from "lucide-react";
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

  return (
    <TooltipProvider delayDuration={250}>
      <div className="relative z-[220] flex items-center gap-1.5">
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
                className="w-72 overflow-hidden rounded-xl border-white/15 bg-[#020208] p-2 shadow-[0_24px_64px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] [&>*]:!mt-0"
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
