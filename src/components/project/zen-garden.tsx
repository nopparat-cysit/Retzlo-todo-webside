"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Leaf,
  Lock,
  Droplets,
  Volume2,
  VolumeX,
  Wind,
  Flower2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Flame,
  ScrollText
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
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
import { ZenFloraRenderer, ZenTerrariumBackdrop, ZenGameToolLadle } from "./zen-garden/zen-vector-art";
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
  const [isWaterConfirmOpen, setIsWaterConfirmOpen] = useState(false);
  const [guardianToConfirm, setGuardianToConfirm] = useState<BotanicalPlant | null>(null);
  const [isSettingGuardian, setIsSettingGuardian] = useState(false);
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
  const handleTerrariumClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

      if (!res.ok) throw new Error(data.message || "Unable to water the garden.");

      if (data.success) {
        toast({
          message: isEn
            ? `✨ Daily watering complete! +${data.awardedCoins ?? 5}c gained. Today's fortune revealed!`
            : `✨ รดน้ำประจำวันแล้ว! ได้รับ +${data.awardedCoins ?? 5}c เปิดม้วนคำทำนายแล้ว`,
          type: "success"
        });
        if (data.globalCoins !== undefined) setGlobalCoins(data.globalCoins);
        if (data.zenGarden) setZenState(parseZenGardenState(data.zenGarden));
        window.dispatchEvent(new Event("coins-updated"));
        window.dispatchEvent(new Event("zen-updated"));
        setIsWaterConfirmOpen(false);
      } else if (data.alreadyNurturedToday) {
        if (data.zenGarden) setZenState(parseZenGardenState(data.zenGarden));
        toast({
          message: isEn
            ? "Already watered today! Reviewing your active daily fortune."
            : "รดน้ำวันนี้แล้ว ดูคำทำนายประจำวันของคุณได้เลย",
          type: "info"
        });
        setIsWaterConfirmOpen(false);
      } else {
        throw new Error(data.message || "Unable to water the garden.");
      }
    } catch (error) {
      toast({
        message:
          error instanceof Error && error.message !== "Unable to water the garden."
            ? error.message
            : isEn
            ? "Failed to water sanctuary. Please try again."
            : "รดน้ำไม่สำเร็จ กรุณาลองอีกครั้ง",
        type: "error"
      });
    } finally {
      setIsNourishing(false);
    }
  };

  // Set active guardian
  const handleSelectGuardian = async (plant: BotanicalPlant) => {
    if (globalCoins < plant.cost || plant.id === zenState.activeGuardianId || isSettingGuardian) return;
    setIsSettingGuardian(true);
    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-guardian", guardianId: plant.id })
      });
      const data = (await res.json()) as { success?: boolean; zenGarden?: ZenGardenState; message?: string };
      if (!res.ok || !data.success) throw new Error(data.message || "Unable to change the guardian.");

      setZenState(data.zenGarden ? parseZenGardenState(data.zenGarden) : (prev) => ({ ...prev, activeGuardianId: plant.id }));
      playZenSingingBowlHarmonic(!zenState.soundMuted, plant.solfeggioFreq);
      toast({
        message: isEn
          ? `${plant.name} is now your Sanctuary Guardian!`
          : `ตั้งให้ ${plant.nameTh} เป็นผู้พิทักษ์สวนบงกชแล้ว`,
        type: "success"
      });
      setGuardianToConfirm(null);
      window.dispatchEvent(new Event("zen-updated"));
    } catch (error) {
      toast({
        message:
          error instanceof Error && error.message !== "Unable to change the guardian."
            ? error.message
            : isEn
            ? "Failed to set guardian. Please try again."
            : "เปลี่ยนผู้พิทักษ์ไม่สำเร็จ กรุณาลองอีกครั้ง",
        type: "error"
      });
    } finally {
      setIsSettingGuardian(false);
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
              aria-label={isEn ? "Open Daily Omikuji Fortune" : "เปิดดูม้วนคำทำนายประจำวัน"}
              title={isEn ? "Open Daily Omikuji Fortune Scroll" : "เปิดดูม้วนคำทำนายเซียมซีประจำวัน"}
              className="grid h-7 w-7 place-items-center rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition cursor-pointer"
            >
              <ScrollText className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Status Subtitle + Streak & Coins Pills */}
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
              ? "Daily Omikuji Sanctuary"
              : "วิหารคำทำนายแห่งสติ"}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            {zenState.nurtureStreak > 0 && (
              <div
                className="flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 shadow-2xs"
                title={isEn ? "Daily Watering Streak" : "สตรีมรดน้ำต่อเนื่อง"}
              >
                <span>🔥</span>
                <span>{zenState.nurtureStreak}d</span>
              </div>
            )}

            <div
              className="flex items-center gap-1 rounded-full border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] px-2 py-0.5 text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 shadow-2xs"
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
      <div role="tablist" aria-label={isEn ? "Zen Garden sections" : "ส่วนต่าง ๆ ของสวนเซน"} className="grid grid-cols-3 gap-1 rounded-xl bg-stone-200/60 dark:bg-white/[0.04] p-1 text-xs font-medium border border-stone-200/80 dark:border-white/5">
        <button
          type="button"
          role="tab"
          id="zen-tab-today"
          aria-controls="zen-panel-today"
          aria-selected={activeTab === "sanctuary"}
          onClick={() => setActiveTab("sanctuary")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
            activeTab === "sanctuary"
              ? "bg-white dark:bg-white/10 text-stone-900 dark:text-stone-100 font-semibold shadow-xs"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          )}
        >
          <Flower2 className="h-3.5 w-3.5" />
          <span>{isEn ? "Today" : "วันนี้"}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="zen-tab-plants"
          aria-controls="zen-panel-plants"
          aria-selected={activeTab === "botanical"}
          onClick={() => setActiveTab("botanical")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
            activeTab === "botanical"
              ? "bg-white dark:bg-white/10 text-stone-900 dark:text-stone-100 font-semibold shadow-xs"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          )}
        >
          <Leaf className="h-3.5 w-3.5" />
          <span>{isEn ? "Plants" : "พืช"} ({growth.unlockedCount})</span>
        </button>

        <button
          type="button"
          role="tab"
          id="zen-tab-breathe"
          aria-controls="zen-panel-breathe"
          aria-selected={activeTab === "breath"}
          onClick={() => setActiveTab("breath")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
            activeTab === "breath"
              ? "bg-white dark:bg-white/10 text-stone-900 dark:text-stone-100 font-semibold shadow-xs"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          )}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>{isEn ? "Rest" : "พักใจ"}</span>
        </button>
      </div>

      {/* ─── TAB 1: Today's garden ritual ────────────────────────────────────── */}
      {activeTab === "sanctuary" && (
        <div id="zen-panel-today" role="tabpanel" aria-labelledby="zen-tab-today" className="space-y-2.5">
          <div className="rounded-xl border border-theme-border bg-theme-paper p-3 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  <Droplets className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-theme-foreground">
                    {isEn ? "Today's garden ritual" : "กิจวัตรสวนประจำวัน"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-theme-muted">
                    {canWater
                      ? isEn
                        ? "Water once to reveal your fortune and earn 5 coins."
                        : "รดน้ำวันละครั้งเพื่อเปิดคำทำนายและรับ 5 เหรียญ"
                      : isEn
                      ? "Your garden is cared for. Today's fortune is ready to read."
                      : "วันนี้ดูแลสวนแล้ว เปิดอ่านคำทำนายของคุณได้เลย"}
                  </p>
                </div>
              </div>
              <span className={cn(
                "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold",
                canWater
                  ? "border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-200"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              )}>
                {canWater ? (isEn ? "Ready" : "พร้อมแล้ว") : (isEn ? "Done today" : "เสร็จแล้ววันนี้")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => canWater ? setIsWaterConfirmOpen(true) : handleOpenSanctuary()}
              disabled={isNourishing}
              className={cn(
                "w-full inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70 disabled:cursor-wait disabled:opacity-70",
                canWater
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  : "border-theme-border bg-theme-background text-theme-foreground hover:bg-theme-paper"
              )}
            >
              {isNourishing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>{isEn ? "Saving today's ritual…" : "กำลังบันทึกกิจวัตรวันนี้…"}</span>
                </>
              ) : canWater ? (
                <>
                  <ZenGameToolLadle className="h-5 w-5 shrink-0" />
                  <span>{isEn ? "Water today" : "รดน้ำวันนี้"}</span>
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px]">+5c</span>
                </>
              ) : (
                <>
                  <ScrollText className="h-4 w-4" />
                  <span>{isEn ? "Read today's fortune" : "อ่านคำทำนายวันนี้"}</span>
                </>
              )}
            </button>
          </div>

          {/* Bespoke SVG garden landscape */}
          <button
            type="button"
            onClick={handleTerrariumClick}
            aria-label={isEn ? "Touch the garden to hear a water chime" : "แตะสวนเพื่อฟังเสียงหยดน้ำ"}
            className="group relative block h-36 w-full overflow-hidden rounded-xl border border-theme-border shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70"
            title={isEn ? "Touch to create a calming ripple" : "แตะเพื่อสร้างระลอกคลื่นแห่งความสงบ"}
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
              {isEn ? "Tap for a quiet ripple" : "แตะเพื่อสร้างระลอกคลื่น"}
            </div>
          </button>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-theme-border bg-theme-paper px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <ZenFloraRenderer plantId={activeGuardian.id} stage={4} className="h-8 w-8 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-theme-foreground">
                  {isEn ? activeGuardian.name : activeGuardian.nameTh}
                </p>
                <p className="truncate text-[10px] text-theme-muted">
                  {isEn ? "Today's garden guardian" : "ผู้พิทักษ์สวนวันนี้"} · {activeGuardian.solfeggioFreq} Hz
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("botanical")}
              className="shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-dusk-lavender hover:bg-dusk-lavender/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70"
            >
              {isEn ? "Change" : "เปลี่ยน"}
            </button>
          </div>

          {/* Short daily fortune preview */}
          {zenState.dailyFortune && !canWater && (
            <article className="rounded-xl border border-rose-300/70 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-serif font-black text-rose-700 dark:text-rose-400 text-sm">
                    {zenState.dailyFortune.grade === "daikichi"
                      ? "大吉"
                      : zenState.dailyFortune.grade === "chukichi"
                      ? "中吉"
                      : zenState.dailyFortune.grade === "kichi"
                      ? "吉"
                      : zenState.dailyFortune.grade === "shokichi"
                      ? "小吉"
                      : "末吉"}
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {isEn ? zenState.dailyFortune.gradeNameEn : zenState.dailyFortune.gradeName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenSanctuary}
                  className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-[10px] font-semibold text-rose-800 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70 dark:text-rose-200 dark:hover:bg-rose-500/10"
                >
                  <ScrollText className="h-3 w-3" />
                  <span>{isEn ? "Full reading" : "อ่านฉบับเต็ม"}</span>
                </button>
              </div>

              <p className="text-sm font-serif italic text-amber-950 dark:text-amber-100 leading-relaxed">
                &ldquo;{isEn ? zenState.dailyFortune.verse : zenState.dailyFortune.verseTh}&rdquo;
              </p>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-2">
                {isEn ? zenState.dailyFortune.workGuidance : zenState.dailyFortune.workGuidanceTh}
              </p>
            </article>
          )}
        </div>
      )}

      {/* ─── TAB 2: Botanical collection ──────────────────────────────────────── */}
      {activeTab === "botanical" && (
        <div id="zen-panel-plants" role="tabpanel" aria-labelledby="zen-tab-plants" className="space-y-2">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div>
              <p className="text-xs font-semibold text-theme-foreground">{isEn ? "Botanical collection" : "คลังพฤกษา"}</p>
              <p className="text-[10px] text-theme-muted">{isEn ? "Choose an unlocked guardian for your garden." : "เลือกพืชที่ปลดล็อกแล้วมาเป็นผู้พิทักษ์สวน"}</p>
            </div>
            <span className="shrink-0 rounded-full border border-theme-border bg-theme-paper px-2 py-1 text-[10px] font-mono font-semibold text-theme-foreground">
              {growth.unlockedCount}/{growth.totalCount} · {globalCoins}c
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {BOTANICAL_PLANTS.map((plant) => {
              const isUnlocked = globalCoins >= plant.cost;
              const isGuardian = zenState.activeGuardianId === plant.id;

              return (
                <article
                  key={plant.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border p-2.5 transition-colors",
                    isGuardian
                      ? "border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/[0.08]"
                      : "border-theme-border bg-theme-paper"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-transform",
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
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {isEn ? plant.name : plant.nameTh}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-snug">
                        {isEn ? plant.tagline : plant.taglineTh}
                      </p>
                      <p className={cn("mt-0.5 text-[10px] font-medium", isUnlocked ? "text-emerald-700 dark:text-emerald-300" : "text-theme-muted")}>
                        {isGuardian
                          ? (isEn ? "Current guardian" : "ผู้พิทักษ์ปัจจุบัน")
                          : isUnlocked
                          ? (isEn ? "Unlocked" : "ปลดล็อกแล้ว")
                          : (isEn ? `Locked · ${plant.cost - globalCoins}c more needed` : `ล็อกอยู่ · ต้องมีอีก ${plant.cost - globalCoins} เหรียญ`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold",
                        isUnlocked ? plant.tone : "text-stone-400"
                      )}
                    >
                      <span aria-label={isEn ? `Requires ${plant.cost} coins` : `ต้องมี ${plant.cost} เหรียญ`}>{plant.cost}c</span>
                    </span>

                    {isUnlocked && !isGuardian && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGuardianToConfirm(plant);
                        }}
                        className="min-h-8 rounded-lg border border-emerald-600/40 bg-emerald-600/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50 dark:text-emerald-200"
                        aria-label={isEn ? `Set ${plant.name} as guardian` : `ตั้ง${plant.nameTh}เป็นผู้พิทักษ์`}
                      >
                        {isEn ? "Set guardian" : "ตั้งผู้พิทักษ์"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: Mindful Box Breathing (4-4-4-4) ───────────────────────────── */}
      {activeTab === "breath" && (
        <div id="zen-panel-breathe" role="tabpanel" aria-labelledby="zen-tab-breathe" className="space-y-3 py-1">
          <div className="px-0.5">
            <p className="text-xs font-semibold text-theme-foreground">{isEn ? "One-minute reset" : "พักใจหนึ่งนาที"}</p>
            <p className="text-[10px] text-theme-muted">{isEn ? "A small pause to return to your own rhythm." : "หยุดพักสั้น ๆ แล้วกลับมาหาจังหวะของตัวเอง"}</p>
          </div>
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

            {(isBreathingActive || breathSecond > 0 || breathCycle > 1) && (
              <button
                type="button"
                onClick={() => {
                  setIsBreathingActive(false);
                  setBreathSecond(0);
                  setBreathCycle(1);
                }}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 dark:border-white/10 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                title={isEn ? "Reset" : "รีเซ็ต"}
                aria-label={isEn ? "Reset breathing session" : "รีเซ็ตการฝึกลมหายใจ"}
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

      <ConfirmModal
        open={isWaterConfirmOpen}
        title={isEn ? "Water the garden today?" : "รดน้ำสวนวันนี้ไหม?"}
        message={isEn
          ? "This daily ritual reveals your Omikuji fortune and adds 5 serenity coins."
          : "กิจวัตรนี้จะเปิดคำทำนายประจำวันและเพิ่มเหรียญแห่งสติ 5 เหรียญ"}
        confirmLabel={isEn ? "Water today" : "รดน้ำวันนี้"}
        cancelLabel={isEn ? "Cancel" : "ยกเลิก"}
        loadingLabel={isEn ? "Saving…" : "กำลังบันทึก…"}
        isLoading={isNourishing}
        onConfirm={() => void handleNurture()}
        onClose={() => setIsWaterConfirmOpen(false)}
      />

      <ConfirmModal
        open={guardianToConfirm !== null}
        title={isEn ? "Change garden guardian?" : "เปลี่ยนผู้พิทักษ์สวนไหม?"}
        message={guardianToConfirm
          ? isEn
            ? `Set ${guardianToConfirm.name} as your active guardian? The plant will appear in your garden scene and guide its ambient tone.`
            : `ตั้ง${guardianToConfirm.nameTh}เป็นผู้พิทักษ์หลักไหม? พืชต้นนี้จะแสดงในฉากสวนและกำหนดเสียงบรรยากาศ`
          : ""}
        confirmLabel={isEn ? "Set guardian" : "ตั้งผู้พิทักษ์"}
        cancelLabel={isEn ? "Cancel" : "ยกเลิก"}
        loadingLabel={isEn ? "Changing…" : "กำลังเปลี่ยน…"}
        isLoading={isSettingGuardian}
        onConfirm={() => guardianToConfirm && void handleSelectGuardian(guardianToConfirm)}
        onClose={() => setGuardianToConfirm(null)}
      />

      {/* ─── Full-Screen daily fortune modal (Fallback) ─── */}
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
