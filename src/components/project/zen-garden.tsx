"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Leaf,
  Lock,
  Droplets,
  Check,
  Volume2,
  VolumeX,
  Wind,
  Flower2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Maximize2
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";
import { playZenSingingBowlHarmonic, playZenWaterDrop } from "@/lib/sound";
import {
  BOTANICAL_PLANTS,
  type BotanicalPlant,
  calculateZenGrowth,
  calculateSkyTimeOfDay,
  calculateRealWorldSeason,
  canWaterToday,
  getTodayZenWisdom,
  parseZenGardenState,
  type ZenGardenState
} from "@/lib/zen-garden/zen-state";
import { cn } from "@/lib/utils";
import { ZenFloraRenderer, ZenTerrariumBackdrop } from "./zen-garden/zen-vector-art";
import { ZenSanctuaryModal } from "./zen-garden/zen-sanctuary-modal";

type ActiveTab = "sanctuary" | "botanical" | "breath";

interface RipplePoint {
  id: number;
  x: number;
  y: number;
}

export function ZenGarden({ onOpenSanctuary }: { onOpenSanctuary?: () => void } = {}) {
  const { isEn } = useLanguage();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [globalCoins, setGlobalCoins] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("sanctuary");
  const [isNourishing, setIsNourishing] = useState(false);
  const [ripples, setRipples] = useState<RipplePoint[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<BotanicalPlant | null>(null);
  const [isSanctuaryModalOpen, setIsSanctuaryModalOpen] = useState(false);

  // Persistent Zen Garden State
  const [zenState, setZenState] = useState<ZenGardenState>(() => parseZenGardenState(null));

  // Box Breathing State (4-4-4-4: 16s per cycle, 4 cycles = 64s)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathSecond, setBreathSecond] = useState(0);
  const [breathCycle, setBreathCycle] = useState(1);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchZenData = useCallback(async () => {
    try {
      const res = await fetch("/api/zen-garden");
      if (res.ok) {
        const data = (await res.json()) as { globalCoins: number; zenGarden: ZenGardenState };
        if (data.globalCoins !== undefined) setGlobalCoins(data.globalCoins);
        if (data.zenGarden) setZenState(parseZenGardenState(data.zenGarden));
      }
    } catch {
      // Graceful offline/error fallback
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void fetchZenData();

    const handleUpdate = () => void fetchZenData();
    window.addEventListener("coins-updated", handleUpdate);
    window.addEventListener("zen-updated", handleUpdate);
    return () => {
      window.removeEventListener("coins-updated", handleUpdate);
      window.removeEventListener("zen-updated", handleUpdate);
    };
  }, [fetchZenData]);

  // Box breathing interval ticker
  useEffect(() => {
    if (isBreathingActive) {
      breathTimerRef.current = setInterval(() => {
        setBreathSecond((prev) => {
          const next = (prev + 1) % 16;
          if (next === 0) {
            setBreathCycle((c) => {
              if (c >= 4) {
                // Completed 1 minute session
                setIsBreathingActive(false);
                playZenSingingBowlHarmonic(!zenState.soundMuted, 528);
                toast({
                  message: isEn
                    ? "Mindful Breath completed. +1 Mindful Minute recorded."
                    : "ฝึกสมาธิลมหายใจเสร็จสิ้น บันทึก 1 นาทีแห่งสติแล้ว",
                  type: "success"
                });
                void fetch("/api/zen-garden", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "complete-breath", minutes: 1 })
                }).then(() => void fetchZenData());
                return 1;
              }
              return c + 1;
            });
          }
          return next;
        });
      }, 1000);
    } else {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    }
    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isBreathingActive, isEn, toast, zenState.soundMuted, fetchZenData]);

  // Ripple creation helper
  const handleTerrariumClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();

    setRipples((prev) => [...prev.slice(-4), { id, x, y }]);
    playZenWaterDrop(!zenState.soundMuted);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  // Nurture sanctuary action
  const handleNurture = async () => {
    if (isNourishing) return;
    setIsNourishing(true);

    const activeGuardian =
      BOTANICAL_PLANTS.find((p) => p.id === zenState.activeGuardianId) || BOTANICAL_PLANTS[0];
    playZenSingingBowlHarmonic(!zenState.soundMuted, activeGuardian.solfeggioFreq);

    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "nurture" })
      });
      const data = (await res.json()) as {
        success: boolean;
        alreadyNurturedToday?: boolean;
        awardedCoins?: number;
        globalCoins?: number;
        zenGarden?: ZenGardenState;
        message?: string;
      };

      if (data.success) {
        toast({
          message: isEn
            ? `Sanctuary nourished! +${data.awardedCoins} serenity coins gained.`
            : `รดน้ำและตีระฆังทิเบตแล้ว! ได้รับ +${data.awardedCoins} เหรียญแห่งสติ`,
          type: "success"
        });
        if (data.globalCoins !== undefined) setGlobalCoins(data.globalCoins);
        if (data.zenGarden) setZenState(parseZenGardenState(data.zenGarden));
        window.dispatchEvent(new Event("coins-updated"));
      } else if (data.alreadyNurturedToday) {
        toast({
          message: isEn
            ? "Already watered today! The sanctuary continues to flourish."
            : "รดน้ำและตีระฆังวันนี้แล้ว สวนบงกชกำลังเบ่งบานอย่างสงบ",
          type: "info"
        });
      }
    } catch {
      toast({
        message: isEn ? "Failed to nurture sanctuary." : "เกิดข้อผิดพลาดในการบันทึก",
        type: "error"
      });
    } finally {
      setTimeout(() => setIsNourishing(false), 2400);
    }
  };

  // Set active guardian
  const handleSelectGuardian = async (plant: BotanicalPlant) => {
    if (globalCoins < plant.cost) return;
    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-guardian", guardianId: plant.id })
      });
      if (res.ok) {
        setZenState((prev) => ({ ...prev, activeGuardianId: plant.id }));
        playZenSingingBowlHarmonic(!zenState.soundMuted, plant.solfeggioFreq);
        toast({
          message: isEn
            ? `${plant.name} is now your Sanctuary Guardian!`
            : `ตั้งให้ ${plant.nameTh} เป็นผู้พิทักษ์สวนบงกชแล้ว`,
          type: "success"
        });
      }
    } catch {
      toast({
        message: isEn ? "Failed to set guardian." : "ไม่สามารถเปลี่ยนผู้พิทักษ์ได้",
        type: "error"
      });
    }
  };

  // Toggle sound
  const toggleSound = () => {
    setZenState((prev) => ({ ...prev, soundMuted: !prev.soundMuted }));
  };

  const handleOpenSanctuary = () => {
    if (onOpenSanctuary) {
      onOpenSanctuary();
    } else {
      window.dispatchEvent(new CustomEvent("open-zen-sanctuary"));
      setIsSanctuaryModalOpen(true);
    }
  };

  if (!mounted) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const canWater = canWaterToday(zenState.lastWateredDate, todayStr);
  const growth = calculateZenGrowth(globalCoins);
  const activeGuardian =
    BOTANICAL_PLANTS.find((p) => p.id === zenState.activeGuardianId) || BOTANICAL_PLANTS[0];
  const todayWisdom = getTodayZenWisdom();
  const timeOfDay = calculateSkyTimeOfDay();
  const season = calculateRealWorldSeason();

  // Breathing phase calculation (0-4: Inhale, 4-8: Hold, 8-12: Exhale, 12-16: Hold)
  let breathPhase = "Inhale";
  let breathPhaseTh = "สูดลมหายใจเข้าช้าๆ";
  let breathScale = 1;
  let breathProgress = 0;

  if (breathSecond < 4) {
    breathPhase = "Inhale";
    breathPhaseTh = "สูดลมหายใจเข้าลึกๆ";
    breathScale = 1 + (breathSecond / 4) * 0.45;
    breathProgress = ((breathSecond + 1) / 4) * 100;
  } else if (breathSecond < 8) {
    breathPhase = "Hold";
    breathPhaseTh = "กักลมหายใจไว้อย่างสงบ";
    breathScale = 1.45;
    breathProgress = ((breathSecond - 3) / 4) * 100;
  } else if (breathSecond < 12) {
    breathPhase = "Exhale";
    breathPhaseTh = "ผ่อนลมหายใจออกช้าๆ";
    breathScale = 1.45 - ((breathSecond - 8) / 4) * 0.45;
    breathProgress = ((breathSecond - 7) / 4) * 100;
  } else {
    breathPhase = "Rest";
    breathPhaseTh = "พักจิตใจให้ปลอดโปร่ง";
    breathScale = 1.0;
    breathProgress = ((breathSecond - 11) / 4) * 100;
  }

  return (
    <section className="lofi-panel flex flex-col rounded-2xl p-3 sm:p-3.5 space-y-3 select-none text-stone-800 dark:text-stone-200">
      {/* ─── Header: 2-Tier Balanced Layout ──────────────────────────────────── */}
      <div className="border-b border-stone-200/80 dark:border-white/10 pb-2.5 space-y-2">
        {/* Row 1: Brand title & quick actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Leaf className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 truncate">
                Solitary Zen Garden
              </h4>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/10 text-stone-700 dark:text-stone-300 shrink-0">
                Tier {growth.currentTier}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={zenState.soundMuted ? "Unmute sound" : "Mute sound"}
              title={zenState.soundMuted ? (isEn ? "Unmute ambient sounds" : "เปิดเสียงประกอบ") : (isEn ? "Mute sounds" : "ปิดเสียง")}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg border transition-colors cursor-pointer",
                zenState.soundMuted
                  ? "border-stone-200 dark:border-white/10 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
              )}
            >
              {zenState.soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleOpenSanctuary}
              aria-label={isEn ? "Open 3x3 Full Sanctuary" : "เปิดสวนเซน 3x3 เต็มจอ"}
              title={isEn ? "Open 3x3 Full Sanctuary" : "เปิดสวนเซน 3x3 เต็มจอ"}
              className="grid h-7 w-7 place-items-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Status Subtitle + Dewdrops & Coins Pills */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal truncate min-w-0">
            {growth.unlockedCount === BOTANICAL_PLANTS.length
              ? isEn
                ? "Sanctuary fully bloomed"
                : "พฤกษาเบ่งบานครบทุกต้นแล้ว"
              : growth.nextPlant
              ? isEn
                ? `${growth.nextPlant.cost - globalCoins}c to unlock ${growth.nextPlant.name}`
                : `ขาดอีก ${growth.nextPlant.cost - globalCoins}c เพื่อปลดล็อก ${growth.nextPlant.nameTh}`
              : isEn
              ? "Mindful sanctuary"
              : "วิหารแห่งสติและความสงบ"}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="flex items-center gap-1 rounded-full border border-sky-300/80 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-sky-700 dark:text-sky-300 shadow-2xs"
              title={isEn ? "Dewdrops: Earned by completing Kanban tasks" : "หยดน้ำทิพย์: ได้จากการเคลียร์งานใน Kanban"}
            >
              <Droplets className="h-3 w-3 text-sky-500" />
              <span>{zenState.dewdrops}</span>
            </div>

            <div
              className="flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 shadow-2xs"
              title={isEn ? "Serenity Coins" : "เหรียญแห่งสติ"}
            >
              <span>✦</span>
              <span>{globalCoins}c</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Growth Progress Bar ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono">
          <span className="flex items-center gap-1">
            <span>{isEn ? "Sanctuary Growth" : "ระดับความเจริญเติบโต"}</span>
            {zenState.nurtureStreak > 0 && (
              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                <Flame className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                <span>{zenState.nurtureStreak}d</span>
              </span>
            )}
          </span>
          <span className="text-stone-700 dark:text-stone-300 font-semibold">
            {growth.unlockedCount}/{growth.totalCount} ({growth.percentage}%)
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200/80 dark:bg-white/10 border border-stone-200 dark:border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-dusk-lavender transition-all duration-700"
            style={{ width: `${growth.percentage}%` }}
          />
        </div>
      </div>

      {/* ─── Tab Sub-Bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-200/60 dark:bg-white/[0.04] p-1 text-xs font-medium border border-stone-200/80 dark:border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab("sanctuary")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
            activeTab === "sanctuary"
              ? "bg-white dark:bg-white/10 text-stone-900 dark:text-stone-100 font-semibold shadow-xs"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          )}
        >
          <Flower2 className="h-3.5 w-3.5" />
          <span>{isEn ? "Sanctuary" : "สวนบงกช"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("botanical")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
            activeTab === "botanical"
              ? "bg-white dark:bg-white/10 text-stone-900 dark:text-stone-100 font-semibold shadow-xs"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          )}
        >
          <Leaf className="h-3.5 w-3.5" />
          <span>{isEn ? "Flora" : "พฤกษา"} ({growth.unlockedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("breath")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
            activeTab === "breath"
              ? "bg-white dark:bg-white/10 text-stone-900 dark:text-stone-100 font-semibold shadow-xs"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          )}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>{isEn ? "Breathe" : "ฝึกสติ"}</span>
        </button>
      </div>

      {/* ─── TAB 1: Sanctuary Terrarium Bed ─────────────────────────────────── */}
      {activeTab === "sanctuary" && (
        <div className="space-y-2.5">
          {/* Living Terrarium Sandbox Canvas */}
          <div
            onClick={handleTerrariumClick}
            className="group relative h-44 w-full overflow-hidden rounded-xl border border-stone-300/80 dark:border-white/10 shadow-inner cursor-pointer"
            title={isEn ? "Click to rake sand ripples & ring bowl" : "คลิกเพื่อกวาดระลอกคลื่นทรายและสัมผัสสติ"}
          >
            {/* Bespoke Hand-Drawn Japanese Garden Landscape Backdrop */}
            <ZenTerrariumBackdrop timeOfDay={timeOfDay} season={season} isNourishing={isNourishing} />

            {/* Click ripple animations: Dual Concentric Reverberations */}
            {ripples.map((rip) => (
              <span key={rip.id}>
                <span
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-500/60 dark:border-emerald-400/50 animate-ping"
                  style={{
                    left: rip.x,
                    top: rip.y,
                    width: "48px",
                    height: "48px",
                    animationDuration: "1.1s"
                  }}
                />
                <span
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/60 dark:border-amber-300/60 animate-ping"
                  style={{
                    left: rip.x,
                    top: rip.y,
                    width: "24px",
                    height: "24px",
                    animationDuration: "0.8s"
                  }}
                />
              </span>
            ))}

            {/* Central Guardian Flora Positioned on Stone Dais */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2.5">
              <div
                className="relative flex h-20 w-20 items-center justify-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  filter: `drop-shadow(0 0 16px ${activeGuardian.auraColor})`
                }}
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <ZenFloraRenderer plantId={activeGuardian.id} className="w-16 h-16" />
                </div>

                {/* Frequency badge */}
                <span className="absolute -bottom-1 font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full border border-stone-200/90 dark:border-white/10 bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 shadow-xs backdrop-blur-xs">
                  {activeGuardian.solfeggioFreq} Hz
                </span>
              </div>
            </div>

            {/* Bottom-right interactive prompt hint */}
            <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-stone-500 dark:text-stone-400 bg-white/70 dark:bg-stone-950/70 px-1.5 py-0.5 rounded backdrop-blur-xs pointer-events-none">
              {isEn ? "Tap to rake sand" : "แตะเพื่อสร้างระลอกทราย"}
            </div>
          </div>

          {/* Active Guardian Description Card */}
          <div className="rounded-xl border border-stone-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-2.5 space-y-1.5 backdrop-blur-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 shrink-0 grid place-items-center">
                  <ZenFloraRenderer plantId={activeGuardian.id} stage={4} className="h-6 w-6" />
                </div>
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                  {isEn ? activeGuardian.name : activeGuardian.nameTh}
                </span>
                <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 shrink-0">
                  ({isEn ? activeGuardian.tierName : activeGuardian.tierNameTh})
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  {activeGuardian.solfeggioFreq} Hz
                </span>
                <span className={cn("text-xs font-mono font-semibold", activeGuardian.tone)}>
                  {activeGuardian.cost}c
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 italic leading-relaxed pl-8">
              &ldquo;{isEn ? activeGuardian.tagline : activeGuardian.taglineTh}&rdquo;
            </p>
          </div>

          {/* Tend & Water Action Button */}
          <button
            type="button"
            onClick={handleNurture}
            disabled={isNourishing}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-xs",
              isNourishing
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.25)]"
                : canWater
                ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500/60"
                : "border-stone-200 dark:border-white/10 bg-stone-100/80 dark:bg-white/[0.03] text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-white/5"
            )}
          >
            {isNourishing ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span>
                  {isEn
                    ? `Sanctuary Nourished · ${activeGuardian.solfeggioFreq} Hz Harmonic`
                    : `สวนเบ่งบานแล้ว · คลื่นเสียงบริสุทธิ์ ${activeGuardian.solfeggioFreq} Hz`}
                </span>
              </>
            ) : canWater ? (
              <>
                <Droplets className="h-4 w-4 text-emerald-500" />
                <span>
                  {isEn
                    ? "Ring Singing Bowl & Nurture (+5c Bonus)"
                    : "ตีระฆังทิเบต & รดน้ำประจำวัน (+5c แห่งสติ)"}
                </span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span>
                  {isEn
                    ? `Watered Today · Day ${zenState.nurtureStreak} Streak`
                    : `รดน้ำวันนี้แล้ว · สตรีมต่อเนื่อง ${zenState.nurtureStreak} วัน`}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── TAB 2: Botanical Flora Catalog ──────────────────────────────────── */}
      {activeTab === "botanical" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-0.5">
            <span>{isEn ? "Select a plant to cultivate as Guardian" : "เลือกพฤกษาเพื่อตั้งเป็นผู้พิทักษ์สวน"}</span>
            <span className="font-mono font-semibold">{growth.unlockedCount}/{growth.totalCount}</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {BOTANICAL_PLANTS.map((plant) => {
              const isUnlocked = globalCoins >= plant.cost;
              const isGuardian = zenState.activeGuardianId === plant.id;
              const isSelected = selectedPlant?.id === plant.id;

              return (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlant(isSelected ? null : plant)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl p-2.5 border transition-all cursor-pointer",
                    isGuardian
                      ? "border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/[0.08]"
                      : isSelected
                      ? "border-dusk-lavender/50 bg-dusk-lavender/10"
                      : "border-stone-200/90 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] hover:bg-stone-100/70 dark:hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-lg transition-transform group-hover:scale-105",
                        isUnlocked
                          ? "border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.04]"
                          : "border-stone-200 dark:border-white/5 bg-stone-100 dark:bg-white/[0.02] opacity-40"
                      )}
                      style={{
                        boxShadow: isUnlocked ? `0 0 10px ${plant.auraColor}` : undefined
                      }}
                    >
                      {isUnlocked ? (
                        <ZenFloraRenderer plantId={plant.id} stage={3} className="h-6 w-6" />
                      ) : (
                        <Lock className="h-3 w-3 text-stone-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {isEn ? plant.name : plant.nameTh}
                        </span>
                        {isGuardian && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                            {isEn ? "Guardian" : "ผู้พิทักษ์"}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate leading-snug">
                        {isEn ? plant.tagline : plant.taglineTh}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold",
                        isUnlocked ? plant.tone : "text-stone-400"
                      )}
                    >
                      {plant.cost}c
                    </span>

                    {isUnlocked && !isGuardian && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleSelectGuardian(plant);
                        }}
                        className="rounded-lg border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        {isEn ? "Set" : "ตั้ง"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: Mindful Box Breathing (4-4-4-4) ───────────────────────────── */}
      {activeTab === "breath" && (
        <div className="space-y-3 py-1">
          {/* Visual Breathing Mandala Container */}
          <div className="relative flex flex-col items-center justify-center h-44 rounded-xl border border-stone-200/90 dark:border-white/10 bg-gradient-to-b from-indigo-50/30 via-white to-purple-50/30 dark:from-[#090b1c] dark:via-[#0c0f28] dark:to-[#080a18] p-4 overflow-hidden shadow-inner">
            {/* Ambient Background Aura */}
            <div
              className="absolute h-36 w-36 rounded-full bg-dusk-lavender/10 dark:bg-dusk-lavender/15 blur-2xl transition-transform duration-1000"
              style={{ transform: `scale(${breathScale})` }}
            />

            {/* Sacred Lotus Mandala (Pure Vector SVG) */}
            <div
              className="relative grid place-items-center h-24 w-24 rounded-full border border-dusk-lavender/40 bg-white/90 dark:bg-white/[0.06] shadow-md transition-transform duration-1000 ease-in-out"
              style={{
                transform: `scale(${breathScale})`,
                boxShadow: isBreathingActive ? "0 0 24px rgba(169, 162, 255, 0.45)" : undefined
              }}
            >
              <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12 text-dusk-lavender">
                {/* Outer Petals */}
                <path d="M 24,6 C 21,14 18,22 24,32 C 30,22 27,14 24,6 Z" className="fill-purple-300/80 dark:fill-purple-400/70" />
                <path d="M 12,14 C 13,22 17,28 24,32 C 18,27 13,22 12,14 Z" className="fill-purple-400/70 dark:fill-purple-500/60" />
                <path d="M 36,14 C 35,22 31,28 24,32 C 30,27 35,22 36,14 Z" className="fill-purple-400/70 dark:fill-purple-500/60" />
                <path d="M 6,24 C 11,27 17,30 24,32 C 16,30 11,27 6,24 Z" className="fill-pink-400/70 dark:fill-pink-500/60" />
                <path d="M 42,24 C 37,27 31,30 24,32 C 32,30 37,27 42,24 Z" className="fill-pink-400/70 dark:fill-pink-500/60" />
                {/* Inner Lotus Pod */}
                <ellipse cx="24" cy="31" rx="4" ry="2" className="fill-amber-400" />
              </svg>
            </div>

            {/* Prompt & Phase Subtext */}
            <div className="mt-3 text-center z-10 space-y-0.5">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 tracking-wide">
                {isBreathingActive ? (isEn ? breathPhase : breathPhaseTh) : isEn ? "Box Breathing (4-4-4-4)" : "ฝึกสมาธิลมหายใจ 4 จังหวะ"}
              </p>
              <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                {isBreathingActive
                  ? `${isEn ? "Phase" : "จังหวะ"}: ${breathProgress.toFixed(0)}% · ${isEn ? "Cycle" : "รอบที่"} ${breathCycle}/4`
                  : isEn
                  ? "4s Inhale · 4s Hold · 4s Exhale · 4s Rest"
                  : "เข้า 4 วิ · กลั้น 4 วิ · ออก 4 วิ · พัก 4 วิ"}
              </p>
            </div>
          </div>

          {/* Breathing Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 px-3 text-xs font-medium transition-all cursor-pointer shadow-xs",
                isBreathingActive
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-dusk-lavender/40 bg-dusk-lavender/10 hover:bg-dusk-lavender/20 text-dusk-lavender"
              )}
            >
              {isBreathingActive ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>{isEn ? "Pause Session" : "หยุดชั่วคราว"}</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isEn ? "Start 1-Min Mindful Reset" : "เริ่มฝึกสติ 1 นาที"}</span>
                </>
              )}
            </button>

            {isBreathingActive && (
              <button
                type="button"
                onClick={() => {
                  setIsBreathingActive(false);
                  setBreathSecond(0);
                  setBreathCycle(1);
                }}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 dark:border-white/10 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                title={isEn ? "Reset" : "รีเซ็ต"}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Footer: Daily Zen Wisdom Koan ──────────────────────────────────── */}
      <div className="border-t border-stone-200/80 dark:border-white/10 pt-2 flex items-start gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500/80 mt-0.5" />
        <p className="line-clamp-2 leading-relaxed">
          {isEn ? todayWisdom.en : todayWisdom.th}
        </p>
      </div>

      {/* ─── Full-Screen 3x3 Living Terrarium Modal (Fallback) ─── */}
      {!onOpenSanctuary && (
        <ZenSanctuaryModal
          isOpen={isSanctuaryModalOpen}
          onClose={() => setIsSanctuaryModalOpen(false)}
          zenState={zenState}
          globalCoins={globalCoins}
          onRefreshData={fetchZenData}
        />
      )}
    </section>
  );
}
