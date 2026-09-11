"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer, Coffee, SkipForward } from "lucide-react";
import { playCardDoneSound, playCardCreateSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const focusPresets = [
  { id: "15", label: "15m", minutes: 15 },
  { id: "25", label: "25m", minutes: 25 },
  { id: "50", label: "50m", minutes: 50 },
] as const;

const restPresets = [
  { id: "5", label: "5m", minutes: 5 },
  { id: "10", label: "10m", minutes: 10 },
  { id: "15", label: "15m", minutes: 15 },
] as const;

function minutesToSeconds(minutes: number) {
  return Math.max(1, Math.min(99, minutes)) * 60;
}

export function NixiePomodoro() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [selectedFocusPreset, setSelectedFocusPreset] = useState<string>("25");
  const [selectedRestPreset, setSelectedRestPreset] = useState<string>("5");
  const [timeLeft, setTimeLeft] = useState(minutesToSeconds(25));
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    // Restore saved durations if available
    try {
      const savedFocus = localStorage.getItem("retrod-pomodoro-focus");
      const savedRest = localStorage.getItem("retrod-pomodoro-rest");
      if (savedFocus) {
        const parsed = Number(savedFocus);
        if (parsed > 0 && parsed <= 99) {
          setFocusMinutes(parsed);
          setTimeLeft(minutesToSeconds(parsed));
          setSelectedFocusPreset(["15", "25", "50"].includes(savedFocus) ? savedFocus : "custom");
        }
      }
      if (savedRest) {
        const parsed = Number(savedRest);
        if (parsed > 0 && parsed <= 99) {
          setBreakMinutes(parsed);
          setSelectedRestPreset(["5", "10", "15"].includes(savedRest) ? savedRest : "custom");
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
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
  }, [isRunning, mode, focusMinutes, breakMinutes]);

  function handleExpire() {
    setIsRunning(false);
    playCardDoneSound();

    if (mode === "focus") {
      setCompletedSessions((c) => c + 1);
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
    if (mode === newMode) return;
    playCardCreateSound();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? minutesToSeconds(focusMinutes) : minutesToSeconds(breakMinutes));
  }

  function skipToNextMode() {
    playCardCreateSound();
    setIsRunning(false);
    const nextMode = mode === "focus" ? "break" : "focus";
    if (mode === "focus") {
      setCompletedSessions((c) => c + 1);
    }
    setMode(nextMode);
    setTimeLeft(nextMode === "focus" ? minutesToSeconds(focusMinutes) : minutesToSeconds(breakMinutes));
  }

  function applyFocusPreset(mins: number, presetId: string) {
    playCardCreateSound();
    setSelectedFocusPreset(presetId);
    setFocusMinutes(mins);
    try {
      localStorage.setItem("retrod-pomodoro-focus", String(mins));
    } catch {
      // Ignore
    }
    if (!isRunning && mode === "focus") {
      setTimeLeft(minutesToSeconds(mins));
    }
  }

  function applyRestPreset(mins: number, presetId: string) {
    playCardCreateSound();
    setSelectedRestPreset(presetId);
    setBreakMinutes(mins);
    try {
      localStorage.setItem("retrod-pomodoro-rest", String(mins));
    } catch {
      // Ignore
    }
    if (!isRunning && mode === "break") {
      setTimeLeft(minutesToSeconds(mins));
    }
  }

  function updateCustomDuration(targetMode: "focus" | "break", value: string) {
    const mins = Math.max(1, Math.min(99, Number(value) || 1));
    if (targetMode === "focus") {
      setFocusMinutes(mins);
      setSelectedFocusPreset("custom");
      try {
        localStorage.setItem("retrod-pomodoro-focus", String(mins));
      } catch {
        // Ignore
      }
      if (!isRunning && mode === "focus") {
        setTimeLeft(minutesToSeconds(mins));
      }
    } else {
      setBreakMinutes(mins);
      setSelectedRestPreset("custom");
      try {
        localStorage.setItem("retrod-pomodoro-rest", String(mins));
      } catch {
        // Ignore
      }
      if (!isRunning && mode === "break") {
        setTimeLeft(minutesToSeconds(mins));
      }
    }
  }

  if (!mounted) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const m1 = Math.floor(mins / 10);
  const m2 = mins % 10;
  const s1 = Math.floor(secs / 10);
  const s2 = secs % 10;

  return (
    <section className="lofi-panel mt-4 flex flex-col space-y-3 rounded-lg border-white/5 bg-white/[0.015] p-3">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/8 bg-white/[0.03] p-1">
        <button
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition active:scale-[0.98]",
            mode === "focus"
              ? "border border-dusk-amber/40 bg-dusk-amber/20 text-dusk-amber shadow-[0_0_12px_rgba(229,189,114,0.15)]"
              : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
          )}
          type="button"
          onClick={() => switchMode("focus")}
        >
          <Timer className="h-3.5 w-3.5" />
          <span>Focus ({focusMinutes}m)</span>
        </button>
        <button
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition active:scale-[0.98]",
            mode === "break"
              ? "border border-dusk-cyan/40 bg-dusk-cyan/20 text-dusk-cyan shadow-[0_0_12px_rgba(137,199,214,0.15)]"
              : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
          )}
          type="button"
          onClick={() => switchMode("break")}
        >
          <Coffee className="h-3.5 w-3.5" />
          <span>Rest ({breakMinutes}m)</span>
        </button>
      </div>

      {/* Mode-Specific Duration Presets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500">
          <span>{mode === "focus" ? "Focus Duration" : "Rest Duration"}</span>
          <span className="font-mono lowercase text-stone-400">
            {mode === "focus" ? `${focusMinutes} mins` : `${breakMinutes} mins`}
          </span>
        </div>

        {mode === "focus" ? (
          <div className="grid grid-cols-4 gap-1">
            {focusPresets.map((preset) => (
              <button
                key={preset.id}
                className={cn(
                  "h-7 rounded border text-[11px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                  selectedFocusPreset === preset.id
                    ? "border-dusk-amber/50 bg-dusk-amber/20 text-dusk-amber font-bold"
                    : "border-white/10 bg-white/[0.04] text-stone-400 hover:border-white/20 hover:text-stone-200"
                )}
                disabled={isRunning}
                type="button"
                onClick={() => applyFocusPreset(preset.minutes, preset.id)}
              >
                {preset.label}
              </button>
            ))}
            <button
              className={cn(
                "h-7 rounded border text-[11px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                selectedFocusPreset === "custom"
                  ? "border-dusk-amber/50 bg-dusk-amber/20 text-dusk-amber font-bold"
                  : "border-white/10 bg-white/[0.04] text-stone-400 hover:border-white/20 hover:text-stone-200"
              )}
              disabled={isRunning}
              type="button"
              onClick={() => setSelectedFocusPreset("custom")}
            >
              Custom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {restPresets.map((preset) => (
              <button
                key={preset.id}
                className={cn(
                  "h-7 rounded border text-[11px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                  selectedRestPreset === preset.id
                    ? "border-dusk-cyan/50 bg-dusk-cyan/20 text-dusk-cyan font-bold"
                    : "border-white/10 bg-white/[0.04] text-stone-400 hover:border-white/20 hover:text-stone-200"
                )}
                disabled={isRunning}
                type="button"
                onClick={() => applyRestPreset(preset.minutes, preset.id)}
              >
                {preset.label}
              </button>
            ))}
            <button
              className={cn(
                "h-7 rounded border text-[11px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                selectedRestPreset === "custom"
                  ? "border-dusk-cyan/50 bg-dusk-cyan/20 text-dusk-cyan font-bold"
                  : "border-white/10 bg-white/[0.04] text-stone-400 hover:border-white/20 hover:text-stone-200"
              )}
              disabled={isRunning}
              type="button"
              onClick={() => setSelectedRestPreset("custom")}
            >
              Custom
            </button>
          </div>
        )}

        {/* Inline Custom Input */}
        {((mode === "focus" && selectedFocusPreset === "custom") ||
          (mode === "break" && selectedRestPreset === "custom")) && (
          <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-2.5 py-1.5 transition">
            <span className="text-[11px] text-stone-400">
              {mode === "focus" ? "Custom Focus (mins):" : "Custom Rest (mins):"}
            </span>
            <input
              className={cn(
                "h-7 w-16 rounded border bg-ink-950 px-1 text-center font-mono text-xs outline-none transition disabled:opacity-50",
                mode === "focus"
                  ? "border-dusk-amber/30 text-dusk-amber focus:border-dusk-amber/70"
                  : "border-dusk-cyan/30 text-dusk-cyan focus:border-dusk-cyan/70"
              )}
              disabled={isRunning}
              max={99}
              min={1}
              type="number"
              value={mode === "focus" ? focusMinutes : breakMinutes}
              onChange={(e) => updateCustomDuration(mode, e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Nixie Tube Container */}
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-white/6 bg-ink-950/80 p-3 shadow-inner">
        {/* Phase status indicator */}
        <div className="mb-2.5 flex items-center gap-1.5 select-none">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              mode === "focus" ? "bg-dusk-amber" : "bg-dusk-cyan",
              isRunning && "animate-ping"
            )}
          />
          <span
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
              mode === "focus" ? "text-dusk-amber" : "text-dusk-cyan"
            )}
          >
            {mode === "focus" ? (isRunning ? "Focusing..." : "Ready to Focus") : (isRunning ? "Resting..." : "Rest Break")}
          </span>
        </div>

        {/* Glowing Tubes */}
        <div className="flex items-center gap-2">
          <NixieDigit mode={mode} num={m1} />
          <NixieDigit mode={mode} num={m2} />
          <span
            className={cn(
              "select-none font-mono text-xl font-bold transition-opacity duration-500",
              mode === "focus" ? "text-dusk-amber" : "text-dusk-cyan",
              isRunning && "animate-pulse"
            )}
            style={{
              textShadow:
                mode === "focus"
                  ? "0 0 10px rgba(229,189,114,0.6)"
                  : "0 0 10px rgba(137,199,214,0.6)"
            }}
          >
            :
          </span>
          <NixieDigit mode={mode} num={s1} />
          <NixieDigit mode={mode} num={s2} />
        </div>
      </div>

      {/* Cycle Preview & Session Counter */}
      <div className="flex items-center justify-between px-0.5 text-[10px] text-stone-400">
        <span className="font-mono">
          Completed: <strong className="text-stone-200">{completedSessions}</strong>
        </span>
        <span className="font-mono text-stone-500">
          Cycle: {focusMinutes}m ➔ {breakMinutes}m
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-2 select-none">
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 h-8 rounded-lg border text-xs font-semibold shadow transition-all active:scale-[0.98]",
            isRunning
              ? "border-dusk-rose/30 bg-dusk-rose/10 text-dusk-rose hover:bg-dusk-rose/20"
              : mode === "focus"
              ? "border-dusk-amber/40 bg-dusk-amber/20 text-dusk-amber hover:bg-dusk-amber/30 shadow-[0_0_12px_rgba(229,189,114,0.15)]"
              : "border-dusk-cyan/40 bg-dusk-cyan/20 text-dusk-cyan hover:bg-dusk-cyan/30 shadow-[0_0_12px_rgba(137,199,214,0.15)]"
          )}
          type="button"
          onClick={handleToggle}
        >
          {isRunning ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              {mode === "focus" ? "Start Focus" : "Start Rest"}
            </>
          )}
        </button>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-stone-400 transition-all hover:border-white/20 hover:text-stone-200 active:scale-[0.98]"
          title={mode === "focus" ? "Skip to Rest Break" : "Skip to Focus Session"}
          type="button"
          onClick={skipToNextMode}
        >
          <SkipForward className="h-3.5 w-3.5" />
        </button>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-stone-400 transition-all hover:border-white/20 hover:text-stone-200 active:scale-[0.98]"
          title="Reset Timer"
          type="button"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
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
