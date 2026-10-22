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
import gardenSkin from "./zen-garden/zen-garden-skin.module.css";

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
    <section className={cn(gardenSkin.skin, "lofi-panel flex max-h-[calc(100dvh-5rem)] flex-col space-y-3.5 overflow-y-auto overscroll-contain rounded-2xl p-3.5 scrollbar-thin sm:p-4")}>
      {/* ─── Garden identity ────────────────────────────────────────────────── */}
      <div className={cn(gardenSkin.identity, "relative overflow-hidden rounded-2xl border px-3.5 py-3")}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full border border-emerald-500/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 h-16 w-16 rounded-full border border-dusk-lavender/10" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn(gardenSkin.guardianIcon, "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border text-emerald-700 shadow-sm dark:text-emerald-300")}>
              <Leaf className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-theme-muted">
                {isEn ? "Retzlo · mindful corner" : "Retzlo · มุมพักใจ"}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <h4 className="truncate font-serif text-[15px] font-semibold leading-tight text-theme-foreground">
                  {isEn ? "Zen Garden" : "สวนแห่งสติ"}
                </h4>
                <span className="shrink-0 rounded-full border border-dusk-lavender/20 bg-dusk-lavender/10 px-2 py-0.5 text-[9px] font-semibold text-theme-foreground">
                  {isEn ? `Lv. ${growth.currentTier}` : `ระดับ ${growth.currentTier}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {zenState.nurtureStreak > 0 && (
              <span
                className="inline-flex h-8 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 text-[10px] font-semibold text-amber-800 dark:text-amber-200"
                title={isEn ? "Daily watering streak" : "รดน้ำต่อเนื่อง"}
              >
                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                {zenState.nurtureStreak}
              </span>
            )}
            <span
              className="inline-flex h-8 items-center gap-1 rounded-full border border-theme-border bg-theme-paper/80 px-2 text-[10px] font-semibold text-theme-foreground"
              title={isEn ? "Serenity coins" : "เหรียญแห่งสติ"}
            >
              <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-300" />
              {globalCoins}
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={zenState.soundMuted ? (isEn ? "Unmute sound" : "เปิดเสียง") : (isEn ? "Mute sound" : "ปิดเสียง")}
              title={zenState.soundMuted ? (isEn ? "Unmute ambient sounds" : "เปิดเสียงประกอบ") : (isEn ? "Mute sounds" : "ปิดเสียง")}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70",
                zenState.soundMuted
                  ? "border-theme-border bg-theme-paper/70 text-theme-muted hover:text-theme-foreground"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
              )}
            >
              {zenState.soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleOpenSanctuary}
              aria-label={isEn ? "Open today's full fortune" : "เปิดคำทำนายฉบับเต็ม"}
              title={isEn ? "Open today's full fortune" : "เปิดคำทำนายฉบับเต็ม"}
              className="grid h-8 w-8 place-items-center rounded-xl border border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender transition hover:bg-dusk-lavender/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70"
            >
              <ScrollText className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="relative mt-2.5 flex min-w-0 items-center justify-between gap-3 border-t border-theme-border/70 pt-2">
          <p className="min-w-0 truncate text-[10px] leading-relaxed text-theme-muted">
            {growth.unlockedCount === BOTANICAL_PLANTS.length
              ? isEn
                ? "Every little corner is in bloom."
                : "พฤกษาทุกต้นผลิบานเต็มสวนแล้ว"
              : growth.nextPlant
              ? isEn
                ? `${growth.nextPlant.cost - globalCoins} more coins to welcome ${growth.nextPlant.name}.`
                : `อีก ${growth.nextPlant.cost - globalCoins} เหรียญ เพื่อเชิญ${growth.nextPlant.nameTh}เข้ามาในสวน`
              : isEn
              ? "A quiet place to grow, one day at a time."
              : "ค่อย ๆ เติบโตไปทีละวัน ในจังหวะของคุณ"}
          </p>
          <span className="shrink-0 font-mono text-[9px] text-theme-muted">{isEn ? "GROW AT YOUR PACE" : "เติบโตในจังหวะของคุณ"}</span>
        </div>
      </div>

      {/* ─── Growth Progress Bar ─────────────────────────────────────────────── */}
      <div className="space-y-1.5 px-0.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-medium text-theme-muted">{isEn ? "Garden collection" : "พฤกษาในสวน"}</span>
          <span className="font-mono font-semibold text-theme-foreground">{growth.unlockedCount}<span className="mx-0.5 text-theme-muted">/</span>{growth.totalCount}<span className="ml-1.5 text-theme-muted">{growth.percentage}%</span></span>
        </div>
        <div className={cn(gardenSkin.progressTrack, "h-1.5 w-full overflow-hidden rounded-full ring-1 ring-inset ring-theme-border/70")}>
          <div
            className={cn(gardenSkin.progressFill, "h-full rounded-full transition-all duration-700")}
            style={{ width: `${growth.percentage}%` }}
          />
        </div>
      </div>

      {/* ─── Tab Sub-Bar ─────────────────────────────────────────────────────── */}
      <div role="tablist" aria-label={isEn ? "Zen Garden sections" : "ส่วนต่าง ๆ ของสวนเซน"} className={cn(gardenSkin.tabList, "grid grid-cols-3 gap-1 rounded-2xl border p-1 text-xs font-medium shadow-inner")}>
        <button
          type="button"
          role="tab"
          id="zen-tab-today"
          aria-controls="zen-panel-today"
          aria-selected={activeTab === "sanctuary"}
          onClick={() => setActiveTab("sanctuary")}
          className={cn(
            gardenSkin.tab,
            "flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-transparent px-1.5 py-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70",
            activeTab === "sanctuary"
              ? cn(gardenSkin.tabSelected, "font-semibold")
              : "text-theme-muted hover:bg-theme-paper/60 hover:text-theme-foreground"
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
            gardenSkin.tab,
            "flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-transparent px-1.5 py-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70",
            activeTab === "botanical"
              ? cn(gardenSkin.tabSelected, "font-semibold")
              : "text-theme-muted hover:bg-theme-paper/60 hover:text-theme-foreground"
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
            gardenSkin.tab,
            "flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-transparent px-1.5 py-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70",
            activeTab === "breath"
              ? cn(gardenSkin.tabSelected, "font-semibold")
              : "text-theme-muted hover:bg-theme-paper/60 hover:text-theme-foreground"
          )}
        >
          <Wind className="h-3.5 w-3.5" />
          <span>{isEn ? "Rest" : "พักใจ"}</span>
        </button>
      </div>

      {/* ─── TAB 1: Today's garden ritual ────────────────────────────────────── */}
      {activeTab === "sanctuary" && (
        <div id="zen-panel-today" role="tabpanel" aria-labelledby="zen-tab-today" className="space-y-2.5">
          <div className={cn(gardenSkin.ritualCard, "relative isolate overflow-hidden rounded-2xl border p-3.5 shadow-sm")}>
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />
            <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-sky-500/20 bg-theme-paper/75 text-sky-700 shadow-sm dark:text-sky-300">
                  <Droplets className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-[14px] font-semibold leading-tight text-theme-foreground">
                    {isEn ? "A little care, each day" : "ดูแลสวนวันละนิด"}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-theme-muted">
                    {canWater
                      ? isEn
                        ? "Water your guardian to reveal today's fortune."
                        : "รดน้ำผู้พิทักษ์ เพื่อเปิดคำทำนายประจำวัน"
                      : isEn
                      ? "Today's care is complete. Your fortune is here when you need it."
                      : "วันนี้ดูแลสวนแล้ว คำทำนายรอคุณอยู่ตรงนี้"}
                  </p>
                </div>
              </div>
              <span className={cn(
                "mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold",
                canWater
                  ? "border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-200"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              )}>
                <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", canWater ? "bg-sky-500" : "bg-emerald-500")} />
                {canWater ? (isEn ? "Ready" : "พร้อมแล้ว") : (isEn ? "Done today" : "เสร็จแล้ววันนี้")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => canWater ? setIsWaterConfirmOpen(true) : handleOpenSanctuary()}
              disabled={isNourishing}
              className={cn(
                canWater ? gardenSkin.primaryAction : gardenSkin.secondaryAction,
                "w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70 disabled:cursor-wait disabled:opacity-70",
                canWater
                  ? "text-white shadow-[0_8px_20px_rgba(16,100,76,0.20)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,100,76,0.26)]"
                  : "text-theme-foreground hover:border-emerald-500/30"
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
          </div>

          {/* Bespoke SVG garden landscape */}
          <button
            type="button"
            onClick={handleTerrariumClick}
            aria-label={isEn ? "Touch the garden to hear a water chime" : "แตะสวนเพื่อฟังเสียงหยดน้ำ"}
            className={cn(gardenSkin.sceneFrame, "group relative block h-40 w-full overflow-hidden rounded-2xl border shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70")}
            title={isEn ? "Touch to create a calming ripple" : "แตะเพื่อสร้างระลอกคลื่นแห่งความสงบ"}
          >
            {/* Bespoke Hand-Drawn Japanese Garden Landscape Backdrop */}
            <ZenTerrariumBackdrop timeOfDay={timeOfDay} season={season} isNourishing={isNourishing} />
            <div aria-hidden="true" className={cn(gardenSkin.sceneOverlay, "pointer-events-none absolute inset-0")} />

            <div className={cn(gardenSkin.sceneLabel, "absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur-md")}>
              <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-300" />
              {isEn ? "Your quiet corner" : "มุมสงบของคุณ"}
            </div>

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
                <span className={cn(gardenSkin.sceneBadge, "absolute -bottom-1 rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold shadow-xs backdrop-blur-xs")}>
                  {activeGuardian.solfeggioFreq} Hz
                </span>
              </div>
            </div>

            {/* Bottom-right interactive prompt hint */}
            <div className={cn(gardenSkin.sceneHint, "pointer-events-none absolute bottom-2 right-2 rounded-full border px-2.5 py-1 text-[9px] font-medium text-white shadow-sm backdrop-blur-md")}>
              {isEn ? "Touch to make a ripple" : "แตะเพื่อสร้างระลอกน้ำ"}
            </div>
          </button>

          <div className={cn(gardenSkin.guardianCard, "flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 shadow-2xs")}>
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-theme-border/70 bg-theme-paper/75 shadow-inner">
                <ZenFloraRenderer plantId={activeGuardian.id} stage={4} className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
                  {isEn ? "Your garden guardian" : "ผู้พิทักษ์ประจำสวน"}
                </p>
                <p className="truncate font-serif text-[13px] font-semibold leading-tight text-theme-foreground">
                  {isEn ? activeGuardian.name : activeGuardian.nameTh}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-theme-muted">
                  {activeGuardian.solfeggioFreq} Hz · {isEn ? "calming tone" : "เสียงแห่งความสงบ"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("botanical")}
              className={cn(gardenSkin.changeButton, "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70")}
            >
              <Flower2 className="h-3 w-3" />
              {isEn ? "Change" : "เปลี่ยน"}
            </button>
          </div>

          {/* Short daily fortune preview */}
          {zenState.dailyFortune && !canWater && (
            <article className={cn(gardenSkin.fortuneCard, "relative isolate overflow-hidden rounded-2xl border p-3.5 shadow-sm")}>
              <span aria-hidden="true" className={cn(gardenSkin.fortuneWatermark, "pointer-events-none absolute -right-2 -top-7 select-none font-serif text-[92px] leading-none")}>縁</span>
              <div className="relative space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn(gardenSkin.fortuneStamp, "grid h-8 w-8 shrink-0 place-items-center rounded-full border font-serif font-black")}>
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
                  <span className="truncate font-serif text-[13px] font-semibold text-theme-foreground">
                    {isEn ? zenState.dailyFortune.gradeNameEn : zenState.dailyFortune.gradeName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenSanctuary}
                  className={cn(gardenSkin.fortuneLink, "inline-flex min-h-8 shrink-0 items-center gap-1 rounded-xl border px-2.5 text-[10px] font-semibold shadow-2xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70")}
                >
                  <ScrollText className="h-3 w-3" />
                  <span>{isEn ? "Full reading" : "อ่านฉบับเต็ม"}</span>
                </button>
              </div>

              <p className={cn(gardenSkin.fortuneVerse, "border-l-2 pl-2.5 text-sm font-serif italic leading-relaxed")}>
                &ldquo;{isEn ? zenState.dailyFortune.verse : zenState.dailyFortune.verseTh}&rdquo;
              </p>
              <p className="text-[11px] leading-relaxed text-theme-muted line-clamp-2">
                {isEn ? zenState.dailyFortune.workGuidance : zenState.dailyFortune.workGuidanceTh}
              </p>
              </div>
            </article>
          )}
        </div>
      )}

      {/* ─── TAB 2: Botanical collection ──────────────────────────────────────── */}
      {activeTab === "botanical" && (
        <div id="zen-panel-plants" role="tabpanel" aria-labelledby="zen-tab-plants" className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-theme-muted">{isEn ? "A living collection" : "คอลเลกชันมีชีวิต"}</p>
              <p className="font-serif text-[15px] font-semibold text-theme-foreground">{isEn ? "Choose your guardian" : "เลือกผู้พิทักษ์สวน"}</p>
              <p className="mt-0.5 text-[10px] text-theme-muted">{isEn ? "Each plant brings its own quiet presence." : "พืชแต่ละต้นมีเสน่ห์และเสียงสงบในแบบของตัวเอง"}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-theme-border bg-theme-paper px-2.5 py-1.5 text-[10px] font-mono font-semibold text-theme-foreground shadow-2xs">
              <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-300" />
              {globalCoins}c <span className="text-theme-muted">·</span> {growth.unlockedCount}/{growth.totalCount}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {BOTANICAL_PLANTS.map((plant) => {
              const isUnlocked = globalCoins >= plant.cost;
              const isGuardian = zenState.activeGuardianId === plant.id;

              return (
                <article
                  key={plant.id}
                  className={cn(
                    gardenSkin.plantRow,
                    "flex items-center justify-between gap-2 rounded-2xl border p-2.5 shadow-2xs transition-all",
                    isGuardian
                      ? cn(gardenSkin.plantCurrent, "shadow-sm")
                      : "bg-theme-paper hover:border-dusk-lavender/30 hover:shadow-xs"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        gardenSkin.plantThumbnail,
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-transform",
                        isUnlocked
                          ? "border-theme-border/80 bg-theme-background/70"
                          : "border-theme-border/60 bg-theme-background/40 opacity-55"
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
                        <span className="truncate font-serif text-[13px] font-semibold text-theme-foreground">
                          {isEn ? plant.name : plant.nameTh}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-snug">
                        {isEn ? plant.tagline : plant.taglineTh}
                      </p>
                      <p className={cn("mt-1 text-[10px] font-medium", isGuardian ? "text-emerald-700 dark:text-emerald-300" : "text-theme-muted")}>
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
                        gardenSkin.price,
                        "rounded-lg border px-2 py-1 text-[10px] font-mono font-semibold",
                        isUnlocked ? cn("border-theme-border/70 bg-theme-background/60", plant.tone) : "border-theme-border bg-theme-background/50 text-theme-muted"
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
                        className={cn(gardenSkin.setGuardian, "min-h-8 rounded-xl border px-2.5 py-1 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50")}
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
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-theme-muted">{isEn ? "A softer rhythm" : "กลับมาหาจังหวะของตัวเอง"}</p>
            <p className="font-serif text-[15px] font-semibold text-theme-foreground">{isEn ? "Take a mindful minute" : "พักใจหนึ่งนาที"}</p>
            <p className="mt-0.5 text-[10px] text-theme-muted">{isEn ? "A small pause to return to your own rhythm." : "หยุดพักสั้น ๆ แล้วกลับมาหาจังหวะของตัวเอง"}</p>
          </div>
          {/* Visual Breathing Mandala Container */}
          <div className={cn(gardenSkin.breathCard, "relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-2xl border p-4 shadow-inner")}>
            <div aria-hidden="true" className={cn(gardenSkin.breathOrbit, "absolute h-40 w-40 rounded-full border")} />
            <div aria-hidden="true" className={cn(gardenSkin.breathOrbit, "absolute h-32 w-32 rounded-full border")} />
            <span className="absolute right-3 top-3 rounded-full border border-theme-border/70 bg-theme-paper/65 px-2 py-1 font-mono text-[9px] tracking-widest text-theme-muted">
              4 · 4 · 4 · 4
            </span>
            {/* Ambient Background Aura */}
            <div
              className="absolute h-36 w-36 rounded-full bg-dusk-lavender/10 dark:bg-dusk-lavender/15 blur-2xl transition-transform duration-1000"
              style={{ transform: `scale(${breathScale})` }}
            />

            {/* Sacred Lotus Mandala (Pure Vector SVG) */}
            <div
              className={cn(gardenSkin.breathMedallion, "relative grid h-24 w-24 place-items-center rounded-full border transition-transform duration-1000 ease-in-out")}
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
              <p className="text-xs font-semibold tracking-wide text-theme-foreground">
                {isBreathingActive ? (isEn ? breathPhase : breathPhaseTh) : isEn ? "Box Breathing (4-4-4-4)" : "ฝึกสมาธิลมหายใจ 4 จังหวะ"}
              </p>
              <p className="text-[10px] font-mono text-theme-muted">
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
                gardenSkin.breathAction,
                isBreathingActive ? gardenSkin.breathActionActive : "",
                "flex-1 flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70"
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
      <div className={cn(gardenSkin.wisdomNote, "flex items-start gap-2 rounded-xl border px-2.5 py-2 text-[11px] text-theme-muted")}>
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/80" />
        <p className="line-clamp-2 leading-relaxed font-serif italic">
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
