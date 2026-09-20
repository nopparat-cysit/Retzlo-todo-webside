"use client";

import { useEffect, useState, useCallback } from "react";
import { Leaf, Lock, Droplets, Check } from "lucide-react";
import { playZenChimeSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface PlantInfo {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  tone: string;
  auraColor: string;
  tagline: string;
}

const PLANTS: PlantInfo[] = [
  {
    id: "sprout",
    name: "Sprout",
    emoji: "🌱",
    cost: 10,
    tone: "text-emerald-400",
    auraColor: "rgba(52, 211, 153, 0.25)",
    tagline: "First spark of focus and discipline"
  },
  {
    id: "blossom",
    name: "Cherry Blossom",
    emoji: "🌸",
    cost: 30,
    tone: "text-dusk-lavender",
    auraColor: "rgba(169, 162, 255, 0.25)",
    tagline: "Quiet serenity and mindful flow"
  },
  {
    id: "bamboo",
    name: "Zen Bamboo",
    emoji: "🎋",
    cost: 60,
    tone: "text-dusk-cyan",
    auraColor: "rgba(125, 211, 252, 0.25)",
    tagline: "Resilient perseverance through adversity"
  },
  {
    id: "aloe",
    name: "Golden Aloe",
    emoji: "🌵",
    cost: 100,
    tone: "text-dusk-amber",
    auraColor: "rgba(229, 189, 114, 0.3)",
    tagline: "Master of steady, enduring productivity"
  }
];

export function ZenGarden() {
  const [mounted, setMounted] = useState(false);
  const [globalCoins, setGlobalCoins] = useState(0);
  const [isNourished, setIsNourished] = useState(false);
  const [activePlant, setActivePlant] = useState<PlantInfo | null>(null);

  useEffect(() => {
    setMounted(true);
    async function fetchCoins() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = (await res.json()) as { user?: { globalCoins?: number } };
          if (data.user?.globalCoins !== undefined) {
            setGlobalCoins(data.user.globalCoins);
          }
        }
      } catch (err) {
        console.error("Failed to fetch coins for zen garden:", err);
      }
    }
    void fetchCoins();

    const handleUpdate = () => void fetchCoins();
    window.addEventListener("coins-updated", handleUpdate);
    return () => window.removeEventListener("coins-updated", handleUpdate);
  }, []);

  const handleNourish = useCallback(() => {
    playZenChimeSound();
    setIsNourished(true);
    setTimeout(() => setIsNourished(false), 2400);
  }, []);

  if (!mounted) return null;

  const nextPlant = PLANTS.find((p) => globalCoins < p.cost);
  const unlockedCount = PLANTS.filter((p) => globalCoins >= p.cost).length;

  return (
    <section className="lofi-panel flex flex-col rounded-xl p-3 bg-white/[0.02] border-white/10 space-y-3 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <Leaf className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-100 truncate">
              Solitary Zen Garden
            </h4>
            <p className="text-[9px] text-stone-400 truncate">
              {unlockedCount === PLANTS.length
                ? "Sanctuary fully bloomed"
                : nextPlant
                ? `${nextPlant.cost - globalCoins}c to ${nextPlant.name}`
                : "Mindful sanctuary"}
            </p>
          </div>
        </div>

        {/* Global Coins Balance */}
        <div className="flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-dusk-amber shrink-0 shadow-[0_0_8px_rgba(229,189,114,0.15)]">
          <span>✦</span>
          <span>{globalCoins}c</span>
        </div>
      </div>

      {/* Growth Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono">
          <span>Sanctuary Growth</span>
          <span className="text-stone-300 font-semibold">{unlockedCount}/{PLANTS.length} Unlocked</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-dusk-cyan to-dusk-lavender transition-all duration-700"
            style={{ width: `${(unlockedCount / PLANTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Terrarium Shrine Shelf */}
      <div className="relative rounded-lg border border-white/10 bg-ink-950/60 p-2 overflow-hidden">
        {/* Ambient mist glow on nourish */}
        {isNourished && (
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-400/15 via-dusk-lavender/10 to-transparent pointer-events-none animate-pulse" />
        )}

        {/* Pedestal Grid */}
        <div className="relative grid grid-cols-4 gap-1.5 pt-1 pb-1">
          {PLANTS.map((plant) => {
            const isUnlocked = globalCoins >= plant.cost;
            const isSelected = activePlant?.id === plant.id;

            return (
              <button
                key={plant.id}
                type="button"
                onClick={() => setActivePlant(isSelected ? null : plant)}
                className={cn(
                  "group relative flex flex-col items-center justify-between rounded-lg p-1.5 transition-all duration-300 cursor-pointer",
                  isSelected
                    ? "bg-white/10 ring-1 ring-dusk-lavender/50"
                    : "hover:bg-white/5"
                )}
              >
                {/* Plant Icon / Lock */}
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border text-xl transition-all duration-300",
                    isUnlocked
                      ? "border-white/10 bg-white/[0.04] group-hover:scale-110 shadow-sm"
                      : "border-white/5 bg-white/[0.02] opacity-40"
                  )}
                  style={{
                    boxShadow: isUnlocked ? `0 0 14px ${plant.auraColor}` : undefined
                  }}
                >
                  {isUnlocked ? (
                    <span className="leading-none select-none">{plant.emoji}</span>
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-stone-500" />
                  )}
                </div>

                {/* Cost Label */}
                <span
                  className={cn(
                    "mt-1 text-[9px] font-mono font-semibold transition-colors",
                    isUnlocked ? plant.tone : "text-stone-500"
                  )}
                >
                  {plant.cost}c
                </span>

                {/* Tiny Name */}
                <span className="truncate text-[8px] text-stone-400 max-w-[54px]">
                  {plant.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shelf reflection bar */}
        <div className="mt-1 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* Selected plant spotlight details */}
      {activePlant ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-200 flex items-center gap-1.5 text-[11px]">
              <span>{activePlant.emoji}</span>
              <span>{activePlant.name}</span>
            </span>
            <span className={cn("text-[10px] font-mono font-medium", activePlant.tone)}>
              {globalCoins >= activePlant.cost ? "✓ Unlocked" : `Need ${activePlant.cost - globalCoins}c more`}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5">{activePlant.tagline}</p>
        </div>
      ) : null}

      {/* Interaction Footer: Tend the Sanctuary */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={handleNourish}
          disabled={isNourished}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-lg border py-1.5 px-3 text-[11px] font-medium transition-all duration-300 active:scale-[0.98] select-none cursor-pointer",
            isNourished
              ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
              : "border-white/10 bg-white/[0.04] text-stone-300 hover:border-emerald-400/35 hover:bg-emerald-400/10 hover:text-emerald-300"
          )}
        >
          {isNourished ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sanctuary Nourished · 432 Hz Chime</span>
            </>
          ) : (
            <>
              <Droplets className="h-3.5 w-3.5 text-emerald-400/80" />
              <span>Ring Singing Bowl & Tend Garden</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

