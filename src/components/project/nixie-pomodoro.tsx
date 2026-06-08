"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { playCardDoneSound, playCardCreateSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const timerPresets = [
  { id: "classic", label: "25 / 5", focus: 25, break: 5 },
  { id: "deep", label: "50 / 10", focus: 50, break: 10 },
  { id: "long", label: "90 / 15", focus: 90, break: 15 }
] as const;

function minutesToSeconds(minutes: number) {
  return Math.max(1, Math.min(99, minutes)) * 60;
}

export function NixiePomodoro() {
  const [mounted, setMounted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("classic");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(minutesToSeconds(25));
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer expired!
            handleExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode]);

  function handleExpire() {
    setIsRunning(false);
    playCardDoneSound(); // Ring alarm chime!
    
    // Switch modes automatically
    if (mode === "focus") {
      setMode("break");
      setTimeLeft(minutesToSeconds(breakMinutes));
    } else {
      setMode("focus");
      setTimeLeft(minutesToSeconds(focusMinutes));
    }
  }

  function handleToggle() {
    playCardCreateSound();
    setIsRunning(!isRunning);
  }

  function handleReset() {
    playCardCreateSound();
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? minutesToSeconds(focusMinutes) : minutesToSeconds(breakMinutes));
  }

  function switchMode(newMode: "focus" | "break") {
    playCardCreateSound();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? minutesToSeconds(focusMinutes) : minutesToSeconds(breakMinutes));
  }

  function updateDuration(nextMode: "focus" | "break", value: string) {
    const minutes = Math.max(1, Math.min(99, Number(value) || 1));

    if (nextMode === "focus") {
      setFocusMinutes(minutes);
    } else {
      setBreakMinutes(minutes);
    }

    if (!isRunning && mode === nextMode) {
      setTimeLeft(minutesToSeconds(minutes));
    }
  }

  function applyPreset(preset: (typeof timerPresets)[number]) {
    playCardCreateSound();
    setSelectedPreset(preset.id);
    setIsRunning(false);
    setFocusMinutes(preset.focus);
    setBreakMinutes(preset.break);
    setTimeLeft(mode === "focus" ? minutesToSeconds(preset.focus) : minutesToSeconds(preset.break));
  }

  function enableCustom() {
    playCardCreateSound();
    setSelectedPreset("custom");
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? minutesToSeconds(focusMinutes) : minutesToSeconds(breakMinutes));
  }

  if (!mounted) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  
  // Format Nixie numbers: e.g. "25:00"
  const m1 = Math.floor(mins / 10);
  const m2 = mins % 10;
  const s1 = Math.floor(secs / 10);
  const s2 = secs % 10;

  return (
    <section className="lofi-panel flex flex-col rounded-lg p-3 bg-white/[0.015] border-white/5 mt-4 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 text-dusk-amber" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-dusk-amber">Focus Timer</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => switchMode("focus")}
            className={cn(
              "text-[9px] px-1.5 py-0.5 rounded font-mono font-medium transition",
              mode === "focus" 
                ? "bg-dusk-amber/15 text-dusk-amber border border-dusk-amber/30" 
                : "bg-white/5 text-stone-500 hover:text-stone-300"
            )}
          >
            FOCUS
          </button>
          <button
            onClick={() => switchMode("break")}
            className={cn(
              "text-[9px] px-1.5 py-0.5 rounded font-mono font-medium transition",
              mode === "break" 
                ? "bg-dusk-cyan/15 text-dusk-cyan border border-dusk-cyan/30" 
                : "bg-white/5 text-stone-500 hover:text-stone-300"
            )}
          >
            REST
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          {timerPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isRunning}
              onClick={() => applyPreset(preset)}
              className={cn(
                "h-7 rounded border px-2 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
                selectedPreset === preset.id
                  ? "border-dusk-amber/45 bg-dusk-amber/15 text-dusk-amber"
                  : "border-white/10 bg-white/[0.045] text-stone-400 hover:border-white/20 hover:text-stone-200"
              )}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            disabled={isRunning}
            onClick={enableCustom}
            className={cn(
              "h-7 rounded border px-2 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
              selectedPreset === "custom"
                ? "border-dusk-cyan/45 bg-dusk-cyan/15 text-dusk-cyan"
                : "border-white/10 bg-white/[0.045] text-stone-400 hover:border-white/20 hover:text-stone-200"
            )}
          >
            Custom
          </button>
        </div>

        {selectedPreset === "custom" ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">
              <span>Focus</span>
              <input
                type="number"
                min={1}
                max={99}
                disabled={isRunning}
                value={focusMinutes}
                onChange={(event) => updateDuration("focus", event.target.value)}
                className="h-8 w-full rounded-lg border border-white/10 bg-ink-950/70 px-2 text-center font-mono text-xs text-dusk-amber outline-none transition focus:border-dusk-amber/60 disabled:cursor-not-allowed disabled:opacity-45"
              />
            </label>
            <label className="space-y-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">
              <span>Rest</span>
              <input
                type="number"
                min={1}
                max={99}
                disabled={isRunning}
                value={breakMinutes}
                onChange={(event) => updateDuration("break", event.target.value)}
                className="h-8 w-full rounded-lg border border-white/10 bg-ink-950/70 px-2 text-center font-mono text-xs text-dusk-cyan outline-none transition focus:border-dusk-cyan/60 disabled:cursor-not-allowed disabled:opacity-45"
              />
            </label>
          </div>
        ) : null}
      </div>

      {/* Nixie tube panel container */}
      <div className="flex justify-center items-center gap-2.5 bg-ink-950/70 rounded border border-white/[0.04] p-3 shadow-inner">
        {/* Nixie Digit tube */}
        <NixieDigit num={m1} mode={mode} />
        <NixieDigit num={m2} mode={mode} />
        {/* Colon separator */}
        <span className={cn(
          "text-xl font-bold font-mono select-none transition-opacity duration-500",
          mode === "focus" ? "text-dusk-amber" : "text-dusk-cyan",
          isRunning ? "animate-pulse" : ""
        )}
        style={{
          textShadow: mode === "focus" 
            ? "0 0 10px rgba(229,189,114,0.6)" 
            : "0 0 10px rgba(137,199,214,0.6)"
        }}>
          :
        </span>
        <NixieDigit num={s1} mode={mode} />
        <NixieDigit num={s2} mode={mode} />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 select-none">
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center justify-center gap-1.5 h-7 w-20 rounded border text-xs font-semibold shadow transition-all",
            isRunning
              ? "bg-dusk-rose/10 border-dusk-rose/30 text-dusk-rose hover:bg-dusk-rose/20"
              : mode === "focus"
              ? "bg-dusk-amber/15 border-dusk-amber/30 text-dusk-amber hover:bg-dusk-amber/25"
              : "bg-dusk-cyan/15 border-dusk-cyan/30 text-dusk-cyan hover:bg-dusk-cyan/25"
          )}
        >
          {isRunning ? (
            <>
              <Pause className="h-3 w-3" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Start
            </>
          )}
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center justify-center h-7 w-10 rounded border border-white/10 bg-white/5 text-stone-400 hover:text-stone-200 hover:border-white/20 transition-all"
          title="Reset Timer"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
    </section>
  );
}

// Single Nixie Digit Subcomponent
function NixieDigit({ num, mode }: { num: number; mode: "focus" | "break" }) {
  return (
    <div className="relative h-12 w-8 rounded-md bg-stone-900 border border-white/5 flex items-center justify-center overflow-hidden">
      {/* Glossy glass reflection element */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-black/30 pointer-events-none z-10" />
      <div className="absolute inset-x-0.5 top-0.5 h-1 bg-white/[0.08] rounded pointer-events-none z-10" />

      {/* Behind glowing number display */}
      <span
        className={cn(
          "font-mono text-3xl font-bold select-none transition-all duration-300",
          mode === "focus" ? "text-dusk-amber" : "text-dusk-cyan"
        )}
        style={{
          textShadow: mode === "focus"
            ? "0 0 12px rgba(229,189,114,0.85), 0 0 24px rgba(229,189,114,0.3)"
            : "0 0 12px rgba(137,199,214,0.85), 0 0 24px rgba(137,199,214,0.3)"
        }}
      >
        {num}
      </span>
    </div>
  );
}
