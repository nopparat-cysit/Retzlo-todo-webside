"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BellRing,
  Check,
  Droplets,
  Flower2,
  ScrollText,
  Sparkles,
  Volume2,
  VolumeX,
  X
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";
import { ModalPortal } from "@/components/ui/modal-portal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import {
  type ZenGardenState,
  parseZenGardenState,
  calculateRealWorldSeason,
  calculateSkyTimeOfDay,
  canWaterToday,
  BOTANICAL_PLANTS
} from "@/lib/zen-garden/zen-state";
import {
  ZenFloraRenderer,
  ZenTerrariumBackdrop,
  ZenGameToolLadle,
  ZenOmikujiScroll
} from "./zen-vector-art";
import {
  playZenWaterDrop,
  playZenSingingBowlHarmonic
} from "@/lib/sound";

interface ZenSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  zenState?: ZenGardenState;
  globalCoins?: number;
  onRefreshData?: () => Promise<void>;
}

export function ZenSanctuaryModal({
  isOpen,
  onClose,
  zenState: initialZenState,
  globalCoins: initialCoins = 0,
  onRefreshData
}: ZenSanctuaryModalProps) {
  const { isEn } = useLanguage();
  const { toast } = useToast();

  const [activeZen, setActiveZen] = useState<ZenGardenState>(
    () => initialZenState || parseZenGardenState(null)
  );
  const [coins, setCoins] = useState(initialCoins);
  const [isWatering, setIsWatering] = useState(false);
  const [isWaterConfirmOpen, setIsWaterConfirmOpen] = useState(false);
  const [isRingingChime, setIsRingingChime] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync state if initial prop changes
  useEffect(() => {
    if (initialZenState) {
      setActiveZen(initialZenState);
    }
  }, [initialZenState]);

  useEffect(() => {
    if (initialCoins !== undefined) {
      setCoins(initialCoins);
    }
  }, [initialCoins]);

  // Self-contained fetch on modal open
  const fetchGardenData = useCallback(async () => {
    try {
      const res = await fetch("/api/zen-garden");
      if (res.ok) {
        const data = (await res.json()) as { globalCoins: number; zenGarden: ZenGardenState };
        if (data.globalCoins !== undefined) setCoins(data.globalCoins);
        if (data.zenGarden) setActiveZen(parseZenGardenState(data.zenGarden));
      }
    } catch {
      // Graceful offline fallback
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void fetchGardenData();
      window.setTimeout(() => closeButtonRef.current?.focus(), 80);
    }
  }, [isOpen, fetchGardenData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isWaterConfirmOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isWaterConfirmOpen, onClose]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const canWater = canWaterToday(activeZen.lastWateredDate, todayStr);
  const hasWateredToday = !canWater;
  const currentFortune = activeZen.dailyFortune;

  const season = calculateRealWorldSeason();
  const timeOfDay = calculateSkyTimeOfDay();

  const seasonLabels = {
    spring: { en: "Spring Season · Sakura Bloom & New Growth", th: "ฤดูใบไม้ผลิ · ซากุระผลิบานและต้นกล้าแรกเกิด" },
    summer: { en: "Summer Season · Verdant Bamboo & Lotus Streams", th: "ฤดูร้อน · สายธารไผ่และบัวสวรรค์เขียวขจี" },
    autumn: { en: "Autumn Season · Golden Ginkgo Foliage", th: "ฤดูใบไม้ร่วง · แปะก๊วยทองคำและใบไม้ปลิดปลิว" },
    winter: { en: "Winter Season · Tranquil Snow on Stone Toro", th: "ฤดูหนาว · หิมะขาวบริสุทธิ์บนโคมหินโบราณ" },
  }[season];

  const skyThemes = {
    dawn: "from-amber-200/40 via-orange-100/30 to-sky-100/40 dark:from-[#1b1429] dark:via-[#16122a] dark:to-[#0d0d1a]",
    day: "from-sky-100/50 via-teal-50/30 to-stone-100/60 dark:from-[#0d1627] dark:via-[#0c1220] dark:to-[#070b14]",
    dusk: "from-rose-200/40 via-purple-100/30 to-indigo-100/40 dark:from-[#261324] dark:via-[#191024] dark:to-[#0c0915]",
    night: "from-indigo-950/40 via-slate-900/30 to-black/50 dark:from-[#060814] dark:via-[#04060f] dark:to-[#020308]",
  };
  const skyTheme = skyThemes[timeOfDay];

  const activeGuardian =
    BOTANICAL_PLANTS.find((p) => p.id === activeZen.activeGuardianId) || BOTANICAL_PLANTS[0];

  // Daily Water & Reveal Fortune Handler
  const handleDailyWater = async () => {
    if (isWatering) return;
    setIsWatering(true);

    playZenWaterDrop(!activeZen.soundMuted);
    playZenSingingBowlHarmonic(!activeZen.soundMuted, activeGuardian.solfeggioFreq || 528);

    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "nurture" })
      });

      const data = (await res.json()) as {
          success?: boolean;
          alreadyNurturedToday?: boolean;
          awardedCoins?: number;
          globalCoins?: number;
          zenGarden?: ZenGardenState;
          message?: string;
        };
      if (!res.ok) throw new Error(data.message || "Unable to water the garden.");

      if (data.zenGarden) setActiveZen(parseZenGardenState(data.zenGarden));
      if (data.globalCoins !== undefined) setCoins(data.globalCoins);

      if (data.success) {
        toast({
          message: isEn
            ? `✨ Daily watering complete! +${data.awardedCoins ?? 5}c gained. Today's fortune revealed!`
            : `✨ รดน้ำประจำวันแล้ว! ได้รับ +${data.awardedCoins ?? 5}c เปิดม้วนคำทำนายแล้ว`,
          type: "success"
        });

        window.dispatchEvent(new Event("zen-updated"));
        window.dispatchEvent(new Event("coins-updated"));
        if (onRefreshData) await onRefreshData();
        setIsWaterConfirmOpen(false);
      } else if (data.alreadyNurturedToday) {
        toast({
          message: isEn
            ? "Already watered today. Your fortune is ready to read."
            : "รดน้ำวันนี้แล้ว เปิดอ่านคำทำนายได้เลย",
          type: "info"
        });
        if (onRefreshData) await onRefreshData();
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
      setIsWatering(false);
    }
  };

  // Ring Tibetan Singing Bowl Chime
  const handleRingSingingBowl = () => {
    if (isRingingChime) return;
    setIsRingingChime(true);
    playZenSingingBowlHarmonic(true, 432);
    toast({
      message: isEn
        ? "Singing bowl sounded at 432 Hz. Feel the calm reverberate."
        : "ตีระฆังทิเบต 432 Hz คลื่นเสียงบริสุทธิ์สะท้อนความสงบสู่จิตใจ",
      type: "info"
    });
    setTimeout(() => setIsRingingChime(false), 2200);
  };

  // Toggle sound
  const handleToggleSound = () => {
    setActiveZen((prev) => ({ ...prev, soundMuted: !prev.soundMuted }));
  };

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="zen-sanctuary-title"
        className="fixed inset-0 z-[1600] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
      >
        <div
          className={cn(
            "relative flex flex-col w-full max-w-2xl max-h-[92vh] rounded-3xl border border-stone-200/90 dark:border-white/10 overflow-hidden shadow-2xl transition-all duration-500 bg-gradient-to-b",
            skyTheme
          )}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-stone-200/80 dark:border-white/10 bg-white/75 dark:bg-ink-950/70 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
                <Flower2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 id="zen-sanctuary-title" className="text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100 uppercase truncate">
                    {isEn ? "Solitary Zen Sanctuary" : "วิหารคำทำนายแห่งสติ"}
                  </h3>
                  <span className="font-mono text-[9.5px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-400/30 shrink-0">
                    {isEn ? "Daily Omikuji" : "เซียมซีประจำวัน"}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {isEn ? seasonLabels.en : seasonLabels.th}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Streak Pill */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 text-xs font-mono font-bold shadow-2xs"
                title={isEn ? "Consecutive Daily Waterings" : "สตรีมการรดน้ำต่อเนื่อง"}
              >
                <span>🔥</span>
                <span>{activeZen.nurtureStreak}d</span>
              </div>

              {/* Coins Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-stone-700 dark:text-stone-300 text-xs font-mono font-bold shadow-2xs">
                <span>✦</span>
                <span>{coins}c</span>
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition cursor-pointer"
                aria-label={activeZen.soundMuted ? (isEn ? "Unmute sounds" : "เปิดเสียง") : (isEn ? "Mute sounds" : "ปิดเสียง")}
                title={activeZen.soundMuted ? "Unmute" : "Mute"}
              >
                {activeZen.soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Ring Singing Bowl */}
              <button
                type="button"
                onClick={handleRingSingingBowl}
                disabled={isRingingChime}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-xl border transition cursor-pointer shadow-2xs",
                  isRingingChime
                    ? "border-amber-400 bg-amber-400/20 text-amber-500 animate-pulse"
                    : "border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10"
                )}
                aria-label={isEn ? "Ring the singing bowl" : "ตีระฆังสมาธิ"}
                title={isEn ? "Ring Tibetan Singing Bowl (432 Hz)" : "ตีขันธิเบตสมาธิ (432 Hz)"}
              >
                <BellRing className="h-4 w-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                ref={closeButtonRef}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 dark:border-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/10 transition cursor-pointer"
                aria-label={isEn ? "Close garden" : "ปิดสวน"}
                title={isEn ? "Close garden" : "ปิดสวน"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Stage: Terrarium Landscape + Fortune Scroll Reveal */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start space-y-4">
            {/* Visual Terrarium Canvas */}
            <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-stone-300/80 dark:border-white/10 shadow-inner group shrink-0">
              <ZenTerrariumBackdrop timeOfDay={timeOfDay} season={season} isNourishing={isWatering} />

              {/* Ring Chime Visual Wave */}
              {isRingingChime && (
                <div className="absolute inset-0 grid place-items-center pointer-events-none z-30">
                  <div className="h-40 w-40 rounded-full border-2 border-amber-400/60 animate-ping" />
                  <div className="h-60 w-60 rounded-full border border-amber-300/40 animate-ping" style={{ animationDelay: "0.4s" }} />
                </div>
              )}

              {/* Central Guardian Tree Flora */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                <div
                  className="relative flex h-24 w-24 items-center justify-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    filter: `drop-shadow(0 0 20px ${activeGuardian.auraColor})`
                  }}
                >
                  <ZenFloraRenderer plantId={activeGuardian.id} className="w-20 h-20" />
                </div>
              </div>

              {/* Watering Animation Overlay */}
              {isWatering && (
                <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-sky-400 animate-ping" />
                  <ZenGameToolLadle className="w-12 h-12 -mt-12 animate-bounce filter drop-shadow-[0_4px_12px_rgba(56,189,248,0.9)]" />
                </div>
              )}

              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-stone-600 dark:text-stone-300 bg-white/80 dark:bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                {isEn ? activeGuardian.name : activeGuardian.nameTh} · {activeGuardian.solfeggioFreq} Hz
              </div>
            </div>

            {/* Daily Watering Action vs Revealed Omikuji Scroll */}
            {!hasWateredToday ? (
              <div className="w-full max-w-lg rounded-2xl border border-theme-border bg-theme-paper p-4 sm:p-5 shadow-xl text-center space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-800 dark:text-sky-200">
                    <Droplets className="h-3.5 w-3.5" />
                    <span>{isEn ? "Ready for today" : "พร้อมดูแลสวนวันนี้"}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold text-xs border border-amber-500/20">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isEn ? "Daily Fortune Awaits" : "คำทำนายประจำวันรอการเปิดเผย"}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {isEn ? "Water Your Sanctuary to Draw Today's Omikuji" : "รดน้ำพฤกษาประจำวันเพื่อรับคำทำนายแห่งสติ"}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                    {isEn
                      ? "Nourish the sacred tree with morning dew to receive your daily Japanese fortune slip and +5 serenity coins."
                      : "ใช้น้ำทิพย์รดต้นไม้ประจำวัน เพื่อเปิดม้วนเซียมซีทำนายทิศทางงาน สมาธิ และรับโบนัส +5 เหรียญ"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWaterConfirmOpen(true)}
                  disabled={isWatering}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white font-bold text-sm shadow-lg hover:from-emerald-500 hover:to-sky-500 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  <ZenGameToolLadle className="w-5 h-5 shrink-0" />
                  <span>
                    {isWatering
                      ? isEn
                        ? "Saving today's ritual…"
                        : "กำลังบันทึกกิจวัตรวันนี้…"
                      : isEn
                      ? "Water today · +5 coins"
                      : "รดน้ำวันนี้ · +5 เหรียญ"}
                  </span>
                </button>
              </div>
            ) : currentFortune ? (
              /* Revealed Japanese Omikuji Fortune Scroll */
              <div className="w-full max-w-lg space-y-2.5">
                <ZenOmikujiScroll grade={currentFortune.grade}>
                  <div className="space-y-4 text-center relative z-10">
                    {/* Top Grade Badge & Japanese Heading */}
                    <div className="flex flex-col items-center gap-1 border-b border-rose-600/20 dark:border-rose-400/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-2xl font-black text-rose-700 dark:text-rose-400 tracking-widest">
                          {currentFortune.grade === "daikichi"
                            ? "大吉"
                            : currentFortune.grade === "chukichi"
                            ? "中吉"
                            : currentFortune.grade === "kichi"
                            ? "吉"
                            : currentFortune.grade === "shokichi"
                            ? "小吉"
                            : "末吉"}
                        </span>
                        <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300">
                          {isEn ? currentFortune.gradeNameEn : currentFortune.gradeName}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                        {isEn ? `Revealed on ${currentFortune.date} · Day ${activeZen.nurtureStreak} Streak` : `คำทำนายวันที่ ${currentFortune.date} · สตรีมต่อเนื่อง ${activeZen.nurtureStreak} วัน`}
                      </p>
                    </div>

                    {/* Poetic Stanza */}
                    <div className="px-2 py-1 bg-amber-50/60 dark:bg-white/[0.03] rounded-xl border border-amber-900/10 dark:border-white/5">
                      <p className="text-sm sm:text-base font-serif italic text-amber-950 dark:text-amber-100 leading-relaxed">
                        &ldquo;{isEn ? currentFortune.verse : currentFortune.verseTh}&rdquo;
                      </p>
                    </div>

                    {/* Deep Oracle Reading */}
                    <div className="text-left space-y-1 px-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <ScrollText className="h-3 w-3" />
                        <span>{isEn ? "Zen Oracle" : "คำทำนายแห่งสติ"}</span>
                      </span>
                      <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                        {isEn ? currentFortune.oracle : currentFortune.oracleTh}
                      </p>
                    </div>

                    {/* Actionable Productivity / Focus Guidance */}
                    <div className="text-left space-y-1 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{isEn ? "Daily Work & Focus Guidance" : "แนวทางสร้างสรรค์งานวันนี้"}</span>
                      </span>
                      <p className="text-sm text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                        {isEn ? currentFortune.workGuidance : currentFortune.workGuidanceTh}
                      </p>
                    </div>

                    {/* Lucky Companion */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-stone-600 dark:text-stone-300 border-t border-rose-600/15 dark:border-rose-400/15">
                      <span className="font-semibold text-rose-700 dark:text-rose-400">
                        {isEn ? "Lucky Focus Item:" : "สิ่งมงคลเสริมพลังใจ:"}
                      </span>
                      <span className="font-mono text-stone-700 dark:text-stone-300">
                        {isEn ? currentFortune.luckyFocus : currentFortune.luckyFocusTh}
                      </span>
                    </div>
                  </div>
                </ZenOmikujiScroll>

                {/* Bottom Status & Singing Bowl Button */}
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    <Check className="h-4 w-4" />
                    <span>{isEn ? "Sanctuary watered today" : "รดน้ำและรับคำทำนายวันนี้แล้ว"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRingSingingBowl}
                    disabled={isRingingChime}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/80 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <BellRing className="h-3.5 w-3.5" />
                    <span>{isEn ? "Ring Bowl" : "ตีระฆังทิเบต"}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={isWaterConfirmOpen}
        layer="above-modal"
        title={isEn ? "Water the garden today?" : "รดน้ำสวนวันนี้ไหม?"}
        message={isEn
          ? "This daily ritual reveals your Omikuji fortune and adds 5 serenity coins."
          : "กิจวัตรนี้จะเปิดคำทำนายประจำวันและเพิ่มเหรียญแห่งสติ 5 เหรียญ"}
        confirmLabel={isEn ? "Water today" : "รดน้ำวันนี้"}
        cancelLabel={isEn ? "Cancel" : "ยกเลิก"}
        loadingLabel={isEn ? "Saving…" : "กำลังบันทึก…"}
        isLoading={isWatering}
        onConfirm={() => void handleDailyWater()}
        onClose={() => setIsWaterConfirmOpen(false)}
      />
    </ModalPortal>
  );
}
