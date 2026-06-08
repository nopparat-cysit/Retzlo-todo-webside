"use client";

import { Leaf, Moon, Timer, Volume2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { LofiPlayer } from "@/components/project/lofi-player";
import { NixiePomodoro } from "@/components/project/nixie-pomodoro";
import { PixelMoon } from "@/components/project/pixel-moon";
import { ZenGarden } from "@/components/project/zen-garden";
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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setActiveTool(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const activePanel = tools.find((tool) => tool.id === activeTool)?.panel;

  return (
    <div ref={rootRef} className="relative z-[220] flex items-center gap-1.5">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <button
            key={tool.id}
            type="button"
            aria-label={tool.label}
            title={tool.label}
            aria-expanded={isActive}
            onClick={() => setActiveTool((current) => (current === tool.id ? null : tool.id))}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl border text-stone-400 transition",
              isActive
                ? "border-dusk-lavender/45 bg-dusk-lavender/12 text-dusk-lavender"
                : "border-white/10 bg-white/[0.045] hover:border-dusk-lavender/45 hover:text-dusk-lavender"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      {activePanel ? (
        <div className="absolute right-0 top-12 z-[220] w-72 overflow-hidden rounded-2xl border border-white/15 bg-[#020208] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.86),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl [&>*]:!mt-0">
          {activePanel}
        </div>
      ) : null}
    </div>
  );
}
