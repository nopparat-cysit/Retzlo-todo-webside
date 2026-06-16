"use client";

import { useEffect, useState } from "react";
import { getSoundVolume } from "@/lib/sound"; // just a helper to test imports

export function ZenGarden() {
  const [mounted, setMounted] = useState(false);
  const [globalCoins, setGlobalCoins] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Fetch user's profile to get global coins balance
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

    // Listen for custom "coins-updated" event so the garden grows in real-time!
    const handleUpdate = () => void fetchCoins();
    window.addEventListener("coins-updated", handleUpdate);
    return () => window.removeEventListener("coins-updated", handleUpdate);
  }, []);

  if (!mounted) return null;

  // Plant milestones
  const showSucculent = globalCoins >= 10;
  const showLavender = globalCoins >= 30;
  const showBonsai = globalCoins >= 60;
  const showAloe = globalCoins >= 100;

  return (
    <section className="lofi-panel flex flex-col rounded-lg p-3 bg-white/[0.015] border-white/5 mt-4 space-y-2 select-none">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-dusk-lavender block">Solitary Zen Garden</span>
        <span className="text-[9px] text-stone-500 block">Plants grow as your Global Coins accumulate</span>
      </div>

      {/* Glass shelf showcase display */}
      <div className="relative flex justify-around items-end bg-ink-950/40 rounded border border-white/[0.03] px-2 pt-6 pb-2.5 min-h-[76px] overflow-hidden">
        {/* Mirror shelf line */}
        <div className="absolute inset-x-2 bottom-2 h-[2px] bg-white/10 rounded pointer-events-none" />

        {/* Plant 1: Succulent (>=10 Coins) */}
        <div className="flex flex-col items-center justify-end z-10 w-8 transition-transform duration-300 hover:-translate-y-1">
          {showSucculent ? (
            <>
              <span className="text-xl leading-none" title="Succulent (Unlocked at 10 Coins)">🌱</span>
              <span className="text-[9px] text-dusk-amber font-mono font-semibold mt-1">10c</span>
            </>
          ) : (
            <>
              <span className="text-xs text-stone-700 font-mono" title="LOCKED (Requires 10 Coins)">🔒</span>
              <span className="text-[9px] text-stone-600 font-mono mt-1">10c</span>
            </>
          )}
        </div>

        {/* Plant 2: Lavender (>=30 Coins) */}
        <div className="flex flex-col items-center justify-end z-10 w-8 transition-transform duration-300 hover:-translate-y-1">
          {showLavender ? (
            <>
              <span className="text-xl leading-none" title="Lavender (Unlocked at 30 Coins)">🪻</span>
              <span className="text-[9px] text-dusk-lavender font-mono font-semibold mt-1">30c</span>
            </>
          ) : (
            <>
              <span className="text-xs text-stone-700 font-mono" title="LOCKED (Requires 30 Coins)">🔒</span>
              <span className="text-[9px] text-stone-600 font-mono mt-1">30c</span>
            </>
          )}
        </div>

        {/* Plant 3: Bonsai (>=60 Coins) */}
        <div className="flex flex-col items-center justify-end z-10 w-8 transition-transform duration-300 hover:-translate-y-1">
          {showBonsai ? (
            <>
              <span className="text-xl leading-none" title="Bonsai (Unlocked at 60 Coins)">🪴</span>
              <span className="text-[9px] text-dusk-cyan font-mono font-semibold mt-1">60c</span>
            </>
          ) : (
            <>
              <span className="text-xs text-stone-700 font-mono" title="LOCKED (Requires 60 Coins)">🔒</span>
              <span className="text-[9px] text-stone-600 font-mono mt-1">60c</span>
            </>
          )}
        </div>

        {/* Plant 4: Golden Aloe (>=100 Coins) */}
        <div className="flex flex-col items-center justify-end z-10 w-8 transition-transform duration-300 hover:-translate-y-1">
          {showAloe ? (
            <>
              <span className="text-xl leading-none animate-soft-float" title="Golden Aloe (Unlocked at 100 Coins)" style={{ animationDuration: "3s" }}>🌵</span>
              <span className="text-[9px] text-yellow-300 font-mono font-semibold mt-1">100c</span>
            </>
          ) : (
            <>
              <span className="text-xs text-stone-700 font-mono" title="LOCKED (Requires 100 Coins)">🔒</span>
              <span className="text-[9px] text-stone-600 font-mono mt-1">100c</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
