"use client";
 
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
 
import { isSoundEnabled, setSoundEnabled, playCardDoneSound, getSoundVolume, setSoundVolume } from "@/lib/sound";
import { cn } from "@/lib/utils";
 
/**
 * Sound toggle for the project settings page.
 * Reads/writes to localStorage via the sound utility.
 * Plays a preview chime when toggled on and when volume is adjusted.
 */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [mounted, setMounted] = useState(false);
 
  // Read from localStorage after mount (SSR-safe)
  useEffect(() => {
    setEnabled(isSoundEnabled());
    setVolume(getSoundVolume());
    setMounted(true);
  }, []);
 
  function handleToggle() {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
 
    // Play a preview chime when enabling so user knows it works
    if (next) {
      setTimeout(() => playCardDoneSound(), 60);
    }
  }

  function handleVolumeChange(nextVolume: number) {
    setSoundVolume(nextVolume);
    setVolume(nextVolume);
  }

  function playPreview() {
    playCardDoneSound();
  }
 
  // Avoid hydration mismatch — render placeholder until mounted
  if (!mounted) {
    return <div className="skeleton-base h-[72px] w-full rounded-lg" />;
  }
 
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center justify-between gap-4 border px-4 py-3 transition-all duration-300 rounded-t-lg",
          enabled
            ? "border-dusk-amber/30 bg-dusk-amber/5 border-b-transparent"
            : "border-white/10 bg-white/[0.03] rounded-b-lg"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-all duration-300",
              enabled
                ? "border-dusk-amber/40 bg-dusk-amber/15 text-dusk-amber"
                : "border-white/10 bg-white/5 text-stone-500"
            )}
          >
            {enabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-100">Sound effects</p>
            <p className="text-xs text-stone-500">
              {enabled
                ? "Chime plays when a card is moved to Done"
                : "Sounds are off — enable for subtle feedback"}
            </p>
          </div>
        </div>
 
        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? "Disable sound effects" : "Enable sound effects"}
          onClick={handleToggle}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-dusk-lavender",
            enabled ? "bg-dusk-amber" : "bg-white/10"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
              enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex flex-col gap-2 rounded-b-lg border border-t-0 border-dusk-amber/30 bg-dusk-amber/5 px-4 pb-4 pt-1 transition-all duration-300">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-[10px] text-stone-500 font-medium select-none">Volume level</span>
            <span className="font-mono text-dusk-amber text-xs font-semibold">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="h-3.5 w-3.5 text-stone-500 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              onMouseUp={playPreview}
              onTouchEnd={playPreview}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-dusk-amber outline-none transition hover:bg-white/15 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dusk-amber [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:bg-dusk-amber/90 active:[&::-webkit-slider-thumb]:scale-110 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-dusk-amber [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-150 hover:[&::-moz-range-thumb]:scale-125 hover:[&::-moz-range-thumb]:bg-dusk-amber/90 active:[&::-moz-range-thumb]:scale-110"
            />
            <Volume2 className="h-3.5 w-3.5 text-dusk-amber shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
