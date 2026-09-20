"use client";

import { useEffect, useState } from "react";
import { Moon, Orbit } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoonPhaseData {
  phaseIndex: number;
  label: string;
  icon: string;
  illuminationPct: number;
  daysIntoCycle: number;
  cycleLength: number;
  status: "Waxing" | "Waning" | "Full" | "New";
  description: string;
  quote: string;
  daysToFullMoon: number;
  daysToNewMoon: number;
}

const ALL_PHASES = [
  { index: 0, label: "New Moon", icon: "🌑", desc: "Clean slate & new intentions" },
  { index: 1, label: "Waxing Crescent", icon: "🌒", desc: "Building initial momentum" },
  { index: 2, label: "First Quarter", icon: "🌓", desc: "Balance, decisions & focused action" },
  { index: 3, label: "Waxing Gibbous", icon: "🌔", desc: "Refining details & polishing work" },
  { index: 4, label: "Full Moon", icon: "🌕", desc: "Peak illumination & completion" },
  { index: 5, label: "Waning Gibbous", icon: "🌖", desc: "Gratitude, reviewing & sharing" },
  { index: 6, label: "Last Quarter", icon: "🌗", desc: "Clearing backlogs & letting go" },
  { index: 7, label: "Waning Crescent", icon: "🌘", desc: "Rest, surrender & replenishment" },
];

function calculateMoonPhase(date: Date = new Date()): MoonPhaseData {
  const lp = 2551442.8; // Synodic month in seconds (29.530588 days)
  const newMoon = new Date(1970, 0, 7, 20, 35, 0).getTime();
  const phaseSeconds = ((date.getTime() - newMoon) / 1000) % lp;
  const daysIntoCycle = (phaseSeconds / (24 * 3600)) % 29.53;
  const cycleLength = 29.53;

  // Illumination calculation (geometric phase angle approximation)
  const phaseAngle = (daysIntoCycle / cycleLength) * 2 * Math.PI;
  const illuminationPct = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);

  let phaseIndex = 0;
  let label = "New Moon";
  let icon = "🌑";
  let status: "Waxing" | "Waning" | "Full" | "New" = "New";
  let description = "A quiet sky. Clean slate to plan and begin.";
  let quote = "Plant seeds for what you wish to create.";

  if (daysIntoCycle < 1.84) {
    phaseIndex = 0;
    label = "New Moon";
    icon = "🌑";
    status = "New";
    description = "A quiet sky. Clean slate to plan and begin.";
    quote = "Plant seeds for what you wish to create.";
  } else if (daysIntoCycle < 5.53) {
    phaseIndex = 1;
    label = "Waxing Crescent";
    icon = "🌒";
    status = "Waxing";
    description = "First sliver of light. Building initial momentum.";
    quote = "Take small, deliberate steps forward.";
  } else if (daysIntoCycle < 9.22) {
    phaseIndex = 2;
    label = "First Quarter";
    icon = "🌓";
    status = "Waxing";
    description = "Half illuminated, half dark. Focused commitment.";
    quote = "Overcome friction and maintain your rhythm.";
  } else if (daysIntoCycle < 12.91) {
    phaseIndex = 3;
    label = "Waxing Gibbous";
    icon = "🌔";
    status = "Waxing";
    description = "Approaching fullness. Refining your craft.";
    quote = "Persevere; completion is on the near horizon.";
  } else if (daysIntoCycle < 16.60) {
    phaseIndex = 4;
    label = "Full Moon";
    icon = "🌕";
    status = "Full";
    description = "Brilliant light. Peak clarity and achievement.";
    quote = "Celebrate completed tasks and harvest results.";
  } else if (daysIntoCycle < 20.29) {
    phaseIndex = 5;
    label = "Waning Gibbous";
    icon = "🌖";
    status = "Waning";
    description = "Light gently waning. Reflect and organize notes.";
    quote = "Share your learnings and declutter.";
  } else if (daysIntoCycle < 23.98) {
    phaseIndex = 6;
    label = "Last Quarter";
    icon = "🌗";
    status = "Waning";
    description = "Half dark. Releasing what is no longer needed.";
    quote = "Clear backlogs and discard dead weight.";
  } else {
    phaseIndex = 7;
    label = "Waning Crescent";
    icon = "🌘";
    status = "Waning";
    description = "The last quiet sliver. Rest and surrender to stillness.";
    quote = "Recharge energy for the upcoming cycle.";
  }

  const fullMoonDay = 14.76;
  const daysToFullMoon = Math.round(
    daysIntoCycle <= fullMoonDay
      ? fullMoonDay - daysIntoCycle
      : cycleLength - daysIntoCycle + fullMoonDay
  );
  const daysToNewMoon = Math.round(cycleLength - daysIntoCycle);

  return {
    phaseIndex,
    label,
    icon,
    illuminationPct,
    daysIntoCycle: Number(daysIntoCycle.toFixed(1)),
    cycleLength: 29.5,
    status,
    description,
    quote,
    daysToFullMoon,
    daysToNewMoon
  };
}

export function PixelMoon() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<MoonPhaseData | null>(null);
  const [previewPhaseIndex, setPreviewPhaseIndex] = useState<number | null>(null);

  useEffect(() => {
    setData(calculateMoonPhase(new Date()));
    setMounted(true);
  }, []);

  if (!mounted || !data) return null;

  const activePhase = previewPhaseIndex !== null
    ? ALL_PHASES[previewPhaseIndex]
    : ALL_PHASES[data.phaseIndex];

  const isCurrentActive = previewPhaseIndex === null || previewPhaseIndex === data.phaseIndex;

  const todayStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date());

  return (
    <section className="lofi-panel flex flex-col rounded-xl p-3 bg-white/[0.02] border-white/10 space-y-3 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender">
            <Moon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-100 truncate">
              Lunar Observatory
            </h4>
            <p className="text-[9px] text-stone-400 truncate">
              {data.status === "Full" ? "Peak Brightness" : `${data.status} · ${data.illuminationPct}% illuminated`}
            </p>
          </div>
        </div>

        {/* Today's Date Badge */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono font-medium text-stone-300 shrink-0">
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Main Moon Focus Card */}
      <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-ink-950/60 p-2.5 overflow-hidden">
        {/* Glow backdrop based on illumination */}
        <div
          className="absolute -left-4 -top-4 h-20 w-20 rounded-full blur-xl pointer-events-none opacity-40 transition-all duration-700"
          style={{
            backgroundColor: data.illuminationPct > 70 ? "rgba(229, 189, 114, 0.4)" : "rgba(169, 162, 255, 0.3)"
          }}
        />

        {/* Big Moon Glyph */}
        <div
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-3xl transition-transform duration-500 hover:scale-105"
          style={{
            textShadow: data.illuminationPct > 70
              ? "0 0 16px rgba(229,189,114,0.6)"
              : "0 0 12px rgba(169,162,255,0.4)"
          }}
        >
          <span className="leading-none select-none">{activePhase.icon}</span>
        </div>

        {/* Phase Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h5 className="text-xs font-bold text-stone-100 truncate">
              {activePhase.label}
            </h5>
            {isCurrentActive && (
              <span className="rounded bg-dusk-lavender/15 border border-dusk-lavender/30 px-1.5 py-0.2 text-[9px] font-mono text-dusk-lavender shrink-0">
                Today
              </span>
            )}
          </div>
          <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5 leading-tight">
            {previewPhaseIndex !== null ? activePhase.desc : data.description}
          </p>
        </div>
      </div>

      {/* 8-Phase Orbit Strip (Retro Astrolabe) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono">
          <span className="flex items-center gap-1">
            <Orbit className="h-2.5 w-2.5 text-dusk-lavender" />
            <span>Lunar Orbit (Day {data.daysIntoCycle})</span>
          </span>
          <span className="text-stone-400">{data.illuminationPct}% Light</span>
        </div>

        <div className="grid grid-cols-8 gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {ALL_PHASES.map((phase) => {
            const isToday = phase.index === data.phaseIndex;
            const isHovered = previewPhaseIndex === phase.index;

            return (
              <button
                key={phase.index}
                type="button"
                onMouseEnter={() => setPreviewPhaseIndex(phase.index)}
                onMouseLeave={() => setPreviewPhaseIndex(null)}
                onClick={() => setPreviewPhaseIndex(previewPhaseIndex === phase.index ? null : phase.index)}
                title={`${phase.label} (${phase.desc})`}
                className={cn(
                  "relative flex h-7 items-center justify-center rounded text-sm transition-all duration-200 cursor-pointer",
                  isToday
                    ? "bg-dusk-lavender/25 ring-1 ring-dusk-lavender text-stone-100 shadow-[0_0_8px_rgba(169,162,255,0.3)]"
                    : isHovered
                    ? "bg-white/10 text-white"
                    : "hover:bg-white/5 opacity-60 hover:opacity-100"
                )}
              >
                <span className="leading-none select-none text-xs">{phase.icon}</span>
                {isToday && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-dusk-amber animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Milestones */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px] font-mono">
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.025] px-2 py-1.5 text-stone-300">
          <span className="flex items-center gap-1 text-stone-400">
            <span>🌕</span>
            <span>Full Moon</span>
          </span>
          <span className="font-semibold text-dusk-amber">
            {data.daysToFullMoon === 0 ? "Today" : `~${data.daysToFullMoon}d`}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.025] px-2 py-1.5 text-stone-300">
          <span className="flex items-center gap-1 text-stone-400">
            <span>🌑</span>
            <span>New Moon</span>
          </span>
          <span className="font-semibold text-dusk-lavender">
            {data.daysToNewMoon === 0 ? "Today" : `~${data.daysToNewMoon}d`}
          </span>
        </div>
      </div>
    </section>
  );
}

