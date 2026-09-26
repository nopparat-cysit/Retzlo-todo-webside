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
    <div className="flex flex-col space-y-3.5 select-none">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-stone-200/90 bg-stone-100/70 p-1 dark:border-white/10 dark:bg-white/[0.03]">
        <button
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition active:scale-[0.98]",
            mode === "focus"
              ? "border border-amber-300/80 bg-white text-amber-900 shadow-2xs dark:border-dusk-amber/40 dark:bg-dusk-amber/20 dark:text-dusk-amber"
              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
          )}
          type="button"
          onClick={() => switchMode("focus")}
        >
          <Timer className="h-3.5 w-3.5 text-amber-600 dark:text-dusk-amber" />
          <span>Focus ({focusMinutes}m)</span>
        </button>
        <button
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition active:scale-[0.98]",
            mode === "break"
              ? "border border-teal-300/80 bg-white text-teal-900 shadow-2xs dark:border-dusk-cyan/40 dark:bg-dusk-cyan/20 dark:text-dusk-cyan"
              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
          )}
          type="button"
          onClick={() => switchMode("break")}
        >
          <Coffee className="h-3.5 w-3.5 text-teal-600 dark:text-dusk-cyan" />
          <span>Rest ({breakMinutes}m)</span>
        </button>
      </div>

      {/* Mode-Specific Duration Presets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          <span>{mode === "focus" ? "Focus Duration" : "Rest Duration"}</span>
          <span className="font-mono lowercase text-stone-500 dark:text-stone-400 font-normal">
            {mode === "focus" ? `${focusMinutes} mins` : `${breakMinutes} mins`}
          </span>
        </div>

        {mode === "focus" ? (
          <div className="grid grid-cols-4 gap-1.5">
            {focusPresets.map((preset) => (
              <button
                key={preset.id}
                className={cn(
                  "h-8 rounded-lg border text-xs font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                  selectedFocusPreset === preset.id
                    ? "border-amber-400/80 bg-amber-100/70 text-amber-900 font-semibold shadow-2xs dark:border-dusk-amber/50 dark:bg-dusk-amber/20 dark:text-dusk-amber"
                    : "border-stone-200/90 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
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
                "h-8 rounded-lg border text-xs font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                selectedFocusPreset === "custom"
                  ? "border-amber-400/80 bg-amber-100/70 text-amber-900 font-semibold shadow-2xs dark:border-dusk-amber/50 dark:bg-dusk-amber/20 dark:text-dusk-amber"
                  : "border-stone-200/90 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
              )}
              disabled={isRunning}
              type="button"
              onClick={() => setSelectedFocusPreset("custom")}
            >
              Custom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {restPresets.map((preset) => (
              <button
                key={preset.id}
                className={cn(
                  "h-8 rounded-lg border text-xs font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                  selectedRestPreset === preset.id
                    ? "border-teal-400/80 bg-teal-100/70 text-teal-900 font-semibold shadow-2xs dark:border-dusk-cyan/50 dark:bg-dusk-cyan/20 dark:text-dusk-cyan"
                    : "border-stone-200/90 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
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
                "h-8 rounded-lg border text-xs font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                selectedRestPreset === "custom"
                  ? "border-teal-400/80 bg-teal-100/70 text-teal-900 font-semibold shadow-2xs dark:border-dusk-cyan/50 dark:bg-dusk-cyan/20 dark:text-dusk-cyan"
                  : "border-stone-200/90 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
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
          <div className="flex items-center justify-between rounded-xl border border-stone-200/90 bg-stone-50/80 px-3 py-2 transition dark:border-white/10 dark:bg-white/[0.025]">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {mode === "focus" ? "Custom Focus (mins):" : "Custom Rest (mins):"}
            </span>
            <input
              className={cn(
                "h-8 w-20 rounded-lg border px-2 text-center font-mono text-xs font-bold outline-none transition disabled:opacity-50",
                mode === "focus"
                  ? "border-amber-300 bg-white text-amber-900 focus:ring-2 focus:ring-amber-500/20 dark:border-dusk-amber/30 dark:bg-ink-950 dark:text-dusk-amber"
                  : "border-teal-300 bg-white text-teal-900 focus:ring-2 focus:ring-teal-500/20 dark:border-dusk-cyan/30 dark:bg-ink-950 dark:text-dusk-cyan"
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

      {/* Nixie Tube Container (Rich vintage dark chamber in both light & dark modes) */}
      <div
        className="relative flex flex-col items-center justify-center rounded-2xl p-4 overflow-hidden select-none"
        style={{
          backgroundColor: "#110f1d",
          border: mode === "focus" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(20, 184, 166, 0.3)",
          boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.7), 0 4px 16px rgba(0, 0, 0, 0.15)"
        }}
      >
        {/* Subtle vintage cathode grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "8px 8px"
          }}
        />

        {/* Phase status indicator */}
        <div className="relative mb-3 flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isRunning && "animate-ping"
            )}
            style={{
              backgroundColor: mode === "focus" ? "#f59e0b" : "#2dd4bf",
              boxShadow: mode === "focus" ? "0 0 8px #f59e0b" : "0 0 8px #2dd4bf"
            }}
          />
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{
              color: mode === "focus" ? "#fbbf24" : "#2dd4bf",
              textShadow: mode === "focus" ? "0 0 8px rgba(251,191,36,0.6)" : "0 0 8px rgba(45,212,191,0.6)"
            }}
          >
            {mode === "focus" ? (isRunning ? "Focusing..." : "Ready to Focus") : (isRunning ? "Resting..." : "Rest Break")}
          </span>
        </div>

        {/* Glowing Tubes Display */}
        <div className="relative flex items-center gap-2">
          <NixieDigit mode={mode} num={m1} />
          <NixieDigit mode={mode} num={m2} />
          <span
            className={cn(
              "select-none font-mono text-2xl font-bold transition-opacity duration-500",
              isRunning && "animate-pulse"
            )}
            style={{
              color: mode === "focus" ? "#ffbe53" : "#5eead4",
              textShadow: mode === "focus"
                ? "0 0 10px rgba(255,190,83,0.9), 0 0 20px rgba(245,158,11,0.6)"
                : "0 0 10px rgba(94,234,212,0.9), 0 0 20px rgba(20,184,166,0.6)"
            }}
          >
            :
          </span>
          <NixieDigit mode={mode} num={s1} />
          <NixieDigit mode={mode} num={s2} />
        </div>
      </div>

      {/* Cycle Preview & Session Counter */}
      <div className="flex items-center justify-between px-0.5 text-xs text-stone-500 dark:text-stone-400">
        <span className="font-mono text-[11px]">
          Completed: <strong className="text-stone-800 dark:text-stone-100 font-bold">{completedSessions}</strong>
        </span>
        <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
          Cycle: {focusMinutes}m ➔ {breakMinutes}m
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-2 select-none pt-0.5">
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold shadow-xs transition-all active:scale-[0.98]",
            isRunning
              ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300"
              : mode === "focus"
              ? "border-amber-300/80 bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-[0_2px_8px_rgba(245,158,11,0.25)] dark:border-dusk-amber/40 dark:bg-dusk-amber/20 dark:text-dusk-amber dark:hover:bg-dusk-amber/30"
              : "border-teal-300/80 bg-teal-500 hover:bg-teal-600 text-white shadow-[0_2px_8px_rgba(20,184,166,0.25)] dark:border-dusk-cyan/40 dark:bg-dusk-cyan/20 dark:text-dusk-cyan dark:hover:bg-dusk-cyan/30"
          )}
          type="button"
          onClick={handleToggle}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>{mode === "focus" ? "Start Focus" : "Start Rest"}</span>
            </>
          )}
        </button>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-600 shadow-2xs transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
          title={mode === "focus" ? "Skip to Rest Break" : "Skip to Focus Session"}
          type="button"
          onClick={skipToNextMode}
        >
          <SkipForward className="h-4 w-4" />
        </button>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-600 shadow-2xs transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
          title="Reset Timer"
          type="button"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Single Nixie Digit Subcomponent
function NixieDigit({ num, mode }: { num: number; mode: "focus" | "break" }) {
  const isFocus = mode === "focus";
  const glowColor = isFocus ? "#ffbe53" : "#5eead4";
  const haloColor = isFocus ? "rgba(245, 158, 11, 0.45)" : "rgba(20, 184, 166, 0.45)";

  return (
    <div
      className="relative h-14 w-10 rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#181528",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)"
      }}
    >
      {/* Soft glass cylindrical reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/40 pointer-events-none z-10" />
      <div className="absolute left-1 top-1 bottom-1 w-0.5 bg-white/[0.06] rounded-full pointer-events-none z-10" />

      {/* Warm background filament glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${haloColor}, transparent 70%)`
        }}
      />

      {/* Glowing number display */}
      <span
        className="relative z-0 font-mono text-3xl font-extrabold select-none transition-all duration-300"
        style={{
          color: glowColor,
          textShadow: `0 0 10px ${glowColor}, 0 0 20px ${haloColor}, 0 0 35px ${isFocus ? "rgba(217, 119, 6, 0.4)" : "rgba(13, 148, 136, 0.4)"}`
        }}
      >
        {num}
      </span>
    </div>
  );
}
