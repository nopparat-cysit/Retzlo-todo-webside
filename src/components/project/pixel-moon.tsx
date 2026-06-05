"use client";

import { useEffect, useState } from "react";

function getMoonPhase(date: Date = new Date()) {
  // Known reference New Moon date (January 7, 1970 20:35 UTC)
  const lp = 2551443; // Moon cycle period in seconds
  const newMoon = new Date(1970, 0, 7, 20, 35, 0).getTime();
  const phase = ((date.getTime() - newMoon) / 1000) % lp;
  const days = phase / (24 * 3600);

  if (days < 1.84) return { label: "New Moon", icon: "🌑", description: "A dark sky, clean slate." };
  if (days < 5.53) return { label: "Waxing Crescent", icon: "🌒", description: "First crescent of light." };
  if (days < 9.22) return { label: "First Quarter", icon: "🌓", description: "Half illuminated, half dark." };
  if (days < 12.91) return { label: "Waxing Gibbous", icon: "🌔", description: "Approaching fullness." };
  if (days < 16.60) return { label: "Full Moon", icon: "🌕", description: "Brilliant light, full presence." };
  if (days < 20.29) return { label: "Waning Gibbous", icon: "🌖", description: "Gently waning." };
  if (days < 23.98) return { label: "Last Quarter", icon: "🌗", description: "Half dark, half illuminated." };
  if (days < 27.67) return { label: "Waning Crescent", icon: "🌘", description: "The last sliver of shadow." };
  return { label: "New Moon", icon: "🌑", description: "A dark sky, clean slate." };
}

export function PixelMoon() {
  const [mounted, setMounted] = useState(false);
  const [moon, setMoon] = useState({ label: "Full Moon", icon: "🌕", description: "Full light." });

  useEffect(() => {
    setMoon(getMoonPhase(new Date()));
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="lofi-panel flex items-center gap-3.5 rounded-lg p-2.5 bg-white/[0.015] border-white/5 select-none mt-3">
      <div 
        className="text-2xl shrink-0 transition-all duration-500 hover:scale-110 flex items-center justify-center h-10 w-10 rounded-md border border-white/5 bg-ink-950/40"
        style={{
          textShadow: moon.label.includes("Full") 
            ? "0 0 16px rgba(229,189,114,0.55)"
            : moon.label.includes("New")
            ? "0 0 8px rgba(169,162,255,0.15)"
            : "0 0 12px rgba(169,162,255,0.35)"
        }}
      >
        {moon.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-dusk-lavender">Lunar Phase</span>
          <span className="h-1 w-1 rounded-full bg-dusk-amber/60" />
          <span className="text-[10px] text-stone-100 font-semibold truncate">{moon.label}</span>
        </div>
        <p className="text-[9px] text-stone-500 truncate mt-0.5">{moon.description}</p>
      </div>
    </div>
  );
}
