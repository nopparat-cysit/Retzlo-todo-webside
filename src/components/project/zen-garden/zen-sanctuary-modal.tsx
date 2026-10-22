"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Droplets,
  Flame,
  Flower2,
  Plus,
  Sun,
  Trash2,
  Volume2,
  X,
  Sparkles,
  BellRing
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ModalPortal } from "@/components/ui/modal-portal";
import { cn } from "@/lib/utils";
import {
  type ZenGardenState,
  parseZenGardenState,
  calculateRealWorldSeason,
  calculateSkyTimeOfDay
} from "@/lib/zen-garden/zen-state";
import {
  ZenFloraRenderer,
  ZenTerrariumBackdrop,
  ZenGardenPlotBasin,
  ZenGameToolLadle,
  ZenGameToolSun,
  ZenGameToolTrowel,
  ZenGameToolSeedBag,
  ZenIncenseBrazier
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

const AVAILABLE_SEEDS = [
  { id: "bonsai", name: "Bonsai Pine", nameTh: "บอนไซสนโบราณ", category: "flora" as const, desc: "5-stage ancient growth" },
  { id: "blossom", name: "Cherry Blossom", nameTh: "ซากุระสมาธิ", category: "flora" as const, desc: "Drifting pink petals" },
  { id: "bamboo", name: "Zen Bamboo", nameTh: "ไผ่เซนหยั่งราก", category: "flora" as const, desc: "Resilient wind culms" },
  { id: "lotus", name: "Sacred Lotus", nameTh: "บัวสวรรค์ & สระน้ำ", category: "flora" as const, desc: "Basin with swimming koi" },
  { id: "ginkgo", name: "Golden Ginkgo", nameTh: "แปะก๊วยทองคำ", category: "flora" as const, desc: "Radiant autumn gold" },
  { id: "sprout", name: "Fresh Sprout", nameTh: "ต้นกล้าแรกผลิ", category: "flora" as const, desc: "Tender green seedling" },
  { id: "aloe", name: "Golden Aloe", nameTh: "ว่านหางจระเข้ทอง", category: "flora" as const, desc: "Enduring desert rosette" },
  { id: "pampas", name: "Silver Pampas", nameTh: "หญ้าพริ้วสายลม", category: "flora" as const, desc: "Silvery feathered plumes" },
  { id: "fungi", name: "Moonlight Fungi", nameTh: "เห็ดเรืองแสงราตรี", category: "flora" as const, desc: "Bioluminescent caps" },
  { id: "willow", name: "Spirit Willow", nameTh: "หลิวทิพย์สมานฉันท์", category: "flora" as const, desc: "Celestial weeping tendrils" },
];

const AVAILABLE_DECORS = [
  { id: "lantern", name: "Stone Toro", nameTh: "โคมไฟหินเซน", desc: "Flickering inner flame" },
  { id: "cat", name: "Sleepy Cat", nameTh: "เจ้าแมวส้มหลับปุ๋ย", desc: "Gentle breathing cat" },
  { id: "torii", name: "Torii Gate", nameTh: "เสาโทริอิแดง", desc: "Sacred shrine portal" },
  { id: "bridge", name: "Moon Bridge", nameTh: "สะพานไม้พระจันทร์", desc: "Arched wooden bridge" },
  { id: "basin", name: "Tsukubai Basin", nameTh: "อ่างน้ำหินซึคุบาอิ", desc: "Bamboo water trickle" },
];

function getNextStageRequirement(waterCount: number, currentStage: number): { nextThreshold: number; remaining: number } | null {
  if (currentStage >= 5) return null;
  const thresholds = [2, 6, 12, 25];
  const target = thresholds[currentStage - 1] ?? 25;
  return { nextThreshold: target, remaining: Math.max(1, target - waterCount) };
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

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(4);
  const [isWatering, setIsWatering] = useState(false);
  const [isBasking, setIsBasking] = useState(false);
  const [showSeedPicker, setShowSeedPicker] = useState(false);
  const [seedPickerTab, setSeedPickerTab] = useState<"flora" | "decor">("flora");
  const [showWorryBrazier, setShowWorryBrazier] = useState(false);
  const [worryText, setWorryText] = useState("");
  const [isBurningWorry, setIsBurningWorry] = useState(false);
  const [plotToClear, setPlotToClear] = useState<number | null>(null);
  const [isRingingChime, setIsRingingChime] = useState(false);

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
    }
  }, [isOpen, fetchGardenData]);

  if (!isOpen) return null;

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

  const selectedPlot =
    selectedSlotIndex !== null
      ? activeZen.plots.find((p) => p.slotIndex === selectedSlotIndex) || null
      : null;

  // 1. Water Plot with Dewdrop
  const handleWaterPlot = async (slotIdx: number) => {
    if (activeZen.dewdrops < 1) {
      toast({
        message: isEn
          ? "No dewdrops left! Complete tasks on your Kanban board to collect dew."
          : "หยดน้ำค้างหมดแล้ว! ทำการ์ดใน Kanban ให้เสร็จเพื่อเก็บน้ำค้างยามเช้า",
        type: "warning"
      });
      return;
    }

    setIsWatering(true);
    playZenWaterDrop(!activeZen.soundMuted);

    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "water-plot", slotIndex: slotIdx })
      });

      if (res.ok) {
        const data = (await res.json()) as { success: boolean; leveledUp: boolean; zenGarden: ZenGardenState };
        if (data.zenGarden) setActiveZen(parseZenGardenState(data.zenGarden));
        toast({
          message: data.leveledUp
            ? isEn
              ? "✨ Flora has flourished to the next growth stage!"
              : "✨ พฤกษาเติบโตสู่ระยะใหม่แล้ว!"
            : isEn
            ? "💧 Nourished plot with morning dew (-1 dewdrop)"
            : "💧 รดน้ำพฤกษาด้วยหยดน้ำทิพย์ (-1 หยดน้ำ)",
          type: "success"
        });
        window.dispatchEvent(new Event("zen-updated"));
        if (onRefreshData) await onRefreshData();
      }
    } catch {
      // Graceful
    } finally {
      setIsWatering(false);
    }
  };

  // 2. Bask Plot in Sunlight
  const handleBaskPlot = async (slotIdx: number) => {
    if (activeZen.sunlight < 1) {
      toast({
        message: isEn
          ? "No sunlight left! Complete Pomodoro focus blocks to absorb solar energy."
          : "พลังแสงแดดหมดแล้ว! จดจ่อกับงานใน Pomodoro เพื่อรับพลังแสงแดด",
        type: "warning"
      });
      return;
    }

    setIsBasking(true);
    playZenSingingBowlHarmonic(!activeZen.soundMuted, 528);

    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bask-plot", slotIndex: slotIdx })
      });

      if (res.ok) {
        const data = (await res.json()) as { success: boolean; leveledUp: boolean; zenGarden: ZenGardenState };
        if (data.zenGarden) setActiveZen(parseZenGardenState(data.zenGarden));
        toast({
          message: data.leveledUp
            ? isEn
              ? "☀️ Warm sunlight caused rapid growth to the next stage!"
              : "☀️ แสงแดดอบอุ่นเร่งให้พฤกษาเติบโตสู่ขั้นใหม่!"
            : isEn
            ? "☀️ Plot basked in warm solar energy (+2 growth)"
            : "☀️ พฤกษาดูดซับพลังแสงแดดอบอุ่น (+2 พลังเติบโต)",
          type: "success"
        });
        window.dispatchEvent(new Event("zen-updated"));
        if (onRefreshData) await onRefreshData();
      }
    } catch {
      // Graceful
    } finally {
      setIsBasking(false);
    }
  };

  // 3. Plant Seed or Place Decor
  const handlePlantSeed = async (itemId: string, itemType: "flora" | "decor", slotIdx: number) => {
    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plant-plot",
          slotIndex: slotIdx,
          itemType,
          itemId
        })
      });

      if (res.ok) {
        const data = (await res.json()) as { success: boolean; zenGarden: ZenGardenState };
        if (data.zenGarden) setActiveZen(parseZenGardenState(data.zenGarden));
        toast({
          message: isEn ? "Specimen cultivated in sanctuary plot!" : "เพาะเมล็ดพันธุ์ลงแปลงเรียบร้อยแล้ว!",
          type: "success"
        });
        setShowSeedPicker(false);
        playZenWaterDrop(!activeZen.soundMuted);
        window.dispatchEvent(new Event("zen-updated"));
        if (onRefreshData) await onRefreshData();
      }
    } catch {
      // Graceful
    }
  };

  // 4. Confirm Clear / Dig Up Plot
  const handleConfirmClearPlot = async () => {
    if (plotToClear === null) return;
    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-plot", slotIndex: plotToClear })
      });

      if (res.ok) {
        const data = (await res.json()) as { success: boolean; zenGarden: ZenGardenState };
        if (data.zenGarden) setActiveZen(parseZenGardenState(data.zenGarden));
        toast({
          message: isEn ? "Plot cleared and raked clean." : "ถอนพืชพรรณและกวาดลานทรายเรียบร้อยแล้ว",
          type: "success"
        });
        window.dispatchEvent(new Event("zen-updated"));
        if (onRefreshData) await onRefreshData();
      }
    } catch {
      // Graceful
    } finally {
      setPlotToClear(null);
    }
  };

  // 5. Burn the Worry Ritual
  const handleBurnWorry = async () => {
    if (!worryText.trim() || isBurningWorry) return;
    setIsBurningWorry(true);
    playZenSingingBowlHarmonic(!activeZen.soundMuted, 432);

    setTimeout(async () => {
      setIsBurningWorry(false);
      setShowWorryBrazier(false);
      setWorryText("");

      toast({
        message: isEn
          ? "Your burden has dissolved into sacred ash. +2 Serenity Dewdrops awarded."
          : "ความกังวลมอดไหม้กลายเป็นเถ้าถ่านบริสุทธิ์แล้ว ได้รับ +2 หยดน้ำค้างแห่งความสงบ",
        type: "success"
      });

      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "award-dewdrop", count: 2 })
      });
      if (res.ok) {
        const data = (await res.json()) as { zenGarden: ZenGardenState };
        if (data.zenGarden) setActiveZen(parseZenGardenState(data.zenGarden));
      }
      window.dispatchEvent(new Event("zen-updated"));
      if (onRefreshData) await onRefreshData();
    }, 1800);
  };

  // 6. Ring Singing Bowl Chime
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

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[1600] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
      >
        <div
          className={cn(
            "relative flex flex-col w-full max-w-4xl h-[92vh] max-h-[820px] rounded-3xl border border-stone-200/90 dark:border-white/10 overflow-hidden shadow-2xl transition-all duration-500 bg-gradient-to-b",
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
                  <h3 className="text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100 uppercase truncate">
                    {isEn ? "Solitary Zen Sanctuary" : "วิหารสวนเซนแห่งสติ"}
                  </h3>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                    3×3 Living Terrarium
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {isEn ? seasonLabels.en : seasonLabels.th}
                </p>
              </div>
            </div>

            {/* Resources Status Pills & Header Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Dewdrops Pill */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 text-xs font-mono font-bold shadow-2xs"
                title={isEn ? "Dewdrops: Earned from Kanban Done tasks" : "หยดน้ำค้าง: ได้จากการเคลียร์งานใน Kanban"}
              >
                <Droplets className="h-3.5 w-3.5 text-sky-500" />
                <span>{activeZen.dewdrops}</span>
              </div>

              {/* Sunlight Pill */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-dusk-amber text-xs font-mono font-bold shadow-2xs"
                title={isEn ? "Sunlight: Earned from Pomodoro focus sessions" : "พลังแสงแดด: ได้จากโหมดโฟกัสงาน Pomodoro"}
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>{activeZen.sunlight}</span>
              </div>

              {/* Coins Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-stone-700 dark:text-stone-300 text-xs font-mono font-bold shadow-2xs">
                <span>✦</span>
                <span>{coins}c</span>
              </div>

              {/* Ring Singing Bowl Button */}
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
                title={isEn ? "Ring Tibetan Singing Bowl (432 Hz)" : "ตีขันธิเบตสมาธิ (432 Hz)"}
              >
                <BellRing className="h-4 w-4" />
              </button>

              {/* Burn Worry Button */}
              <button
                type="button"
                onClick={() => setShowWorryBrazier(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl border border-rose-300/80 bg-rose-50/90 text-rose-800 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 text-xs font-semibold transition cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                title={isEn ? "Burn & Release Work Anxiety" : "เตาเผาหินปล่อยวางความกังวล"}
              >
                <ZenIncenseBrazier className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">{isEn ? "Release Worry" : "ปล่อยวาง"}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 dark:border-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/10 transition cursor-pointer"
                title="Close Sanctuary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Stage & 3x3 Living Terrarium Grid */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center justify-between space-y-3">
            {/* Subtle Ambient Instruction Hint */}
            <div className="text-center space-y-0.5">
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                {isEn ? "Tap any plot to inspect, water with dewdrops, or cultivate flora" : "แตะที่แปลงดินเพื่อตรวจสอบ รดน้ำด้วยหยดน้ำทิพย์ หรือเพาะเมล็ดพันธุ์"}
              </p>
              <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                {isEn ? "Karesansui Sand Bed · Real-Time Ambient Cycle" : "ลานทรายเซนคาเรซันซุย · วัฏจักรธรรมชาติเคลื่อนไหวสด"}
              </p>
            </div>

            {/* 3x3 Grid Landscaping Sand Bed */}
            <div className="relative p-4 sm:p-6 rounded-3xl border border-stone-300/90 dark:border-white/10 bg-gradient-to-b from-stone-100/95 via-stone-200/85 to-stone-300/95 dark:from-[#0d1024] dark:via-[#0f1228] dark:to-[#090b1c] shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Authentic Japanese Garden Panoramic Landscape Backdrop */}
              <div className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none">
                <ZenTerrariumBackdrop timeOfDay={timeOfDay} season={season} showPedestal={false} />
              </div>

              {/* Raked Wave Chime Rings */}
              {isRingingChime && (
                <div className="absolute inset-0 grid place-items-center pointer-events-none z-30">
                  <div className="h-48 w-48 rounded-full border-2 border-amber-400/60 animate-ping" />
                  <div className="h-72 w-72 rounded-full border border-amber-300/40 animate-ping" style={{ animationDelay: "0.4s" }} />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 sm:gap-4 relative z-10 p-1">
                {activeZen.plots.map((plot) => {
                  const isSelected = selectedSlotIndex === plot.slotIndex;
                  const isPlanted = plot.itemType !== "empty" && plot.itemId;

                  return (
                    <div
                      key={plot.slotIndex}
                      onClick={() => setSelectedSlotIndex(plot.slotIndex)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Sanctuary Plot #${plot.slotIndex + 1}`}
                      className={cn(
                        "relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer select-none group",
                        isSelected
                          ? "scale-105 z-20 filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.35)]"
                          : "hover:scale-[1.03] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
                      )}
                    >
                      {/* Hand-Drawn Ceramic Planter Pot Basin Background */}
                      <ZenGardenPlotBasin
                        isSelected={isSelected}
                        isPlanted={Boolean(isPlanted)}
                        waterCount={plot.waterCount}
                        stage={plot.stage}
                        slotIndex={plot.slotIndex}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />

                      {/* Planted Specimen vs Empty Soil Well */}
                      {isPlanted ? (
                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pb-2.5 pointer-events-none">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-md">
                            <ZenFloraRenderer
                              plantId={plot.itemId!}
                              stage={plot.stage}
                              className="w-full h-full"
                            />
                          </div>
                          {/* 5-Stage Gem Dots Indicator */}
                          {plot.itemType === "flora" && (
                            <div className="flex items-center gap-1 mt-0.5 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10 shadow-xs">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                    i < plot.stage
                                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] ring-1 ring-white/60"
                                      : "bg-stone-500/50"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative z-10 flex flex-col items-center justify-center gap-1 text-amber-800/80 dark:text-amber-200/80 group-hover:text-amber-950 dark:group-hover:text-amber-100 transition-colors pointer-events-none pb-2">
                          <div className="p-1.5 rounded-full bg-amber-500/15 border border-amber-600/30 group-hover:border-amber-500 group-hover:scale-110 transition-transform shadow-2xs">
                            <Plus className="h-4 w-4" />
                          </div>
                          <span className="text-[9px] font-mono font-bold tracking-wider uppercase opacity-85">
                            {isEn ? "Open Soil" : "แปลงว่าง"}
                          </span>
                        </div>
                      )}

                      {/* Interactive Action Animation Splash right on the selected plot */}
                      {isSelected && isWatering && (
                        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-full border-2 border-sky-400/80 animate-ping" />
                          <ZenGameToolLadle className="w-12 h-12 -mt-10 animate-bounce filter drop-shadow-[0_4px_10px_rgba(56,189,248,0.7)]" />
                        </div>
                      )}
                      {isSelected && isBasking && (
                        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-amber-400/30 animate-ping" />
                          <ZenGameToolSun className="w-14 h-14 -mt-8 animate-spin filter drop-shadow-[0_0_16px_rgba(245,158,11,0.9)]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inspector Plaque (Kifuda) HUD for Selected Plot */}
            {selectedPlot && (
              <div className="w-full max-w-lg rounded-2xl border-2 border-amber-900/20 dark:border-amber-500/20 bg-gradient-to-r from-amber-50/95 via-stone-50/95 to-amber-100/90 dark:from-[#191526]/95 dark:via-[#141020]/95 dark:to-[#0f0c1a]/95 p-3.5 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 relative overflow-hidden">
                {/* Traditional Hanko Stamp watermark accent */}
                <div className="absolute right-2 -bottom-2 select-none pointer-events-none opacity-10 dark:opacity-5 text-4xl font-serif text-amber-900">
                  庭
                </div>

                <div className="space-y-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-950 dark:text-amber-100">
                      {isEn ? `Plot Basin #${selectedPlot.slotIndex + 1}` : `แปลงปลูกศิลา #${selectedPlot.slotIndex + 1}`}
                    </span>
                    {selectedPlot.itemType !== "empty" ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">
                        {selectedPlot.itemType === "flora"
                          ? isEn
                            ? `Stage ${selectedPlot.stage}/5`
                            : `ขั้นการเติบโต ${selectedPlot.stage}/5`
                          : isEn
                          ? "Sacred Decor"
                          : "ของตกแต่งมงคล"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                        {isEn ? "Virgin Loam · Ready for Cultivation" : "ดินภูเขาไฟบริสุทธิ์ · พร้อมเพาะปลูก"}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate leading-snug">
                    {selectedPlot.itemType === "flora" ? (
                      (() => {
                        const req = getNextStageRequirement(selectedPlot.waterCount, selectedPlot.stage);
                        if (!req) {
                          return isEn
                            ? `Fully bloomed ancient heritage (${selectedPlot.waterCount} total waterings).`
                            : `เจริญเติบโตเต็มที่สู่พฤกษาโบราณแล้ว (รดน้ำรวม ${selectedPlot.waterCount} ครั้ง)`;
                        }
                        return isEn
                          ? `Nourished ${selectedPlot.waterCount} times · ${req.remaining} dewdrop${req.remaining > 1 ? "s" : ""} to Stage ${selectedPlot.stage + 1}`
                          : `ดูแลแล้ว ${selectedPlot.waterCount} ครั้ง · รดน้ำอีก ${req.remaining} ครั้งเพื่อสู่ขั้นที่ ${selectedPlot.stage + 1}`;
                      })()
                    ) : selectedPlot.itemType === "decor" ? (
                      isEn
                        ? "Sacred zen garden ornament bringing aesthetic harmony and serenity."
                        : "ของตกแต่งสวนเซน เสริมสร้างความสงบและความงามอันบริสุทธิ์"
                    ) : (
                      isEn
                        ? "Select a seed pouch from the herbarium to begin cultivation."
                        : "เลือกเมล็ดพันธุ์จากหีบพฤกษศาสตร์เพื่อเริ่มการเพาะปลูก"
                    )}
                  </p>
                </div>

                {/* Tactile Japanese Artisan Tool Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 relative z-10">
                  {selectedPlot.itemType !== "empty" ? (
                    <>
                      {/* Water Button with Bamboo Water Ladle (Hishaku) */}
                      <button
                        type="button"
                        onClick={() => handleWaterPlot(selectedPlot.slotIndex)}
                        disabled={isWatering}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400 bg-gradient-to-b from-sky-500 to-sky-600 text-white hover:from-sky-400 hover:to-sky-500 active:scale-95 text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                        title={isEn ? "Water plot with 1 dewdrop" : "รดน้ำด้วย 1 หยดน้ำค้าง"}
                      >
                        <ZenGameToolLadle className="w-4 h-4 shrink-0" />
                        <span>{isEn ? "Water (-1)" : "รดน้ำ (-1)"}</span>
                      </button>

                      {/* Bask Button with Sacred Solar Mirror (Nichirin) */}
                      <button
                        type="button"
                        onClick={() => handleBaskPlot(selectedPlot.slotIndex)}
                        disabled={isBasking}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400 bg-gradient-to-b from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 active:scale-95 text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                        title={isEn ? "Bask plot in warm solar energy (+2 growth)" : "อาบแสงแดดอบอุ่นเร่งโต (+2 การเติบโต)"}
                      >
                        <ZenGameToolSun className="w-4 h-4 shrink-0" />
                        <span>{isEn ? "Sunlight" : "แสงแดด"}</span>
                      </button>

                      {/* Dig Up Button with Weeding Trowel (Hori-hori) */}
                      <button
                        type="button"
                        onClick={() => setPlotToClear(selectedPlot.slotIndex)}
                        className="flex items-center justify-center h-8 w-8 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 transition cursor-pointer shadow-2xs active:scale-95"
                        title={isEn ? "Dig up / Replant plot" : "ถอนพืชพรรณเพื่อปลูกใหม่"}
                      >
                        <ZenGameToolTrowel className="w-4 h-4 shrink-0" />
                      </button>
                    </>
                  ) : (
                    /* Plant Seed Button with Washi Seed Pouch (Tane-bukuro) */
                    <button
                      type="button"
                      onClick={() => setShowSeedPicker(true)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      <ZenGameToolSeedBag className="w-5 h-5 shrink-0" />
                      <span>{isEn ? "Plant Seed Pouch" : "เปิดถุงเมล็ดพันธุ์"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── Seed Picker Modal Overlay (Sanctuary Herbarium) ─── */}
          {showSeedPicker && selectedPlot && (
            <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
              <div className="w-full max-w-lg rounded-3xl border-2 border-amber-900/30 dark:border-amber-500/20 bg-stone-50 dark:bg-[#151221] p-4 sm:p-5 shadow-2xl space-y-3.5">
                {/* Herbarium Header */}
                <div className="flex items-center justify-between border-b border-amber-900/15 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <ZenGameToolSeedBag className="h-7 w-7 shrink-0 drop-shadow-xs" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                        {isEn ? "Botanical Herbarium & Seed Chest" : "หีบเมล็ดพันธุ์และสมุดภาพพฤกษศาสตร์"}
                      </h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isEn ? `Select specimen for Plot #${selectedPlot.slotIndex + 1}` : `เลือกพืชพรรณเพาะปลูกในแปลง #${selectedPlot.slotIndex + 1}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSeedPicker(false)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Category Tabs: Botanical Flora vs Zen Decor */}
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-stone-200/60 dark:bg-white/[0.05] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSeedPickerTab("flora")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
                      seedPickerTab === "flora"
                        ? "bg-white dark:bg-white/15 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                        : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                    )}
                  >
                    <Flower2 className="h-3.5 w-3.5" />
                    <span>{isEn ? "Botanical Flora (10)" : "พฤกษาพรรณ (10)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeedPickerTab("decor")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
                      seedPickerTab === "decor"
                        ? "bg-white dark:bg-white/15 text-amber-700 dark:text-amber-300 shadow-xs font-bold"
                        : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isEn ? "Zen Decor (5)" : "ของตกแต่งเซน (5)"}</span>
                  </button>
                </div>

                {/* Illustrated Items Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {(seedPickerTab === "flora" ? AVAILABLE_SEEDS : AVAILABLE_DECORS).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handlePlantSeed(
                          item.id,
                          seedPickerTab === "flora" ? "flora" : "decor",
                          selectedPlot.slotIndex
                        )
                      }
                      className="flex items-center gap-3 p-2.5 rounded-2xl border border-stone-200/90 dark:border-white/10 bg-white/90 dark:bg-white/[0.03] hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] active:scale-98 transition-all text-left cursor-pointer group"
                    >
                      <div className="h-12 w-12 shrink-0 grid place-items-center rounded-xl bg-amber-50/80 dark:bg-white/5 border border-amber-900/10 dark:border-white/10 group-hover:border-emerald-500/50 shadow-2xs">
                        <ZenFloraRenderer plantId={item.id} stage={3} className="h-10 w-10" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {isEn ? item.name : item.nameTh}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {isEn ? item.desc : "แตะเพื่อเพาะปลูก"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Worry Brazier Modal Overlay (Sacred Koro Incense Altar) ─── */}
          {showWorryBrazier && (
            <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
              <div className="w-full max-w-md rounded-3xl border-2 border-rose-900/30 dark:border-rose-500/20 bg-gradient-to-b from-stone-50 to-amber-50/50 dark:from-[#191322] dark:to-[#110c18] p-5 shadow-2xl space-y-4">
                {/* Altar Burner Artwork & Header */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <ZenIncenseBrazier className="w-16 h-16 shrink-0 drop-shadow-md" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100 uppercase tracking-wide">
                      {isEn ? "Sacred Koro Incense Altar" : "เตากำยานปล่อยวางความกังวล"}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mt-0.5">
                      {isEn
                        ? "Transcribe what burdens your mind onto washi paper. Let it dissolve into pure serenity."
                        : "เขียนสิ่งที่ติดค้างหรือเหนื่อยล้าในใจลงบนกระดาษวาชิ แล้วปล่อยให้มอดไหม้กลายเป็นเถ้าถ่านแห่งความสงบ"}
                    </p>
                  </div>
                </div>

                {/* Washi Paper (Tanzaku) Textarea */}
                <div className="relative rounded-2xl border-2 border-amber-900/20 dark:border-white/10 bg-amber-50/70 dark:bg-black/40 p-3 shadow-inner">
                  <textarea
                    value={worryText}
                    onChange={(e) => setWorryText(e.target.value)}
                    placeholder={
                      isEn
                        ? "Type any frustration, bugs, deadlines, or fatigue here... (Instantly purified, never stored in database)"
                        : "พิมพ์ความเครียด อุปสรรค บั๊กงาน หรือความกังวลใจลงที่นี่... (ไม่มีการบันทึกข้อมูลใดๆ)"
                    }
                    rows={3}
                    className="w-full bg-transparent text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none resize-none leading-relaxed"
                  />
                  {/* Hanko Stamp Watermark */}
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-amber-700/40 dark:text-amber-400/30 select-none pointer-events-none">
                    短冊 · Washi Tanzaku
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowWorryBrazier(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-white/10 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    {isEn ? "Cancel" : "ยกเลิก"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBurnWorry}
                    disabled={!worryText.trim() || isBurningWorry}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white text-xs font-bold shadow-md hover:from-rose-500 hover:to-amber-500 active:scale-95 transition cursor-pointer disabled:opacity-50"
                  >
                    <Flame className={cn("h-4 w-4", isBurningWorry && "animate-spin")} />
                    <span>
                      {isBurningWorry
                        ? isEn
                          ? "Dissolving into Ash..."
                          : "กำลังมอดไหม้เป็นเถ้าบริสุทธิ์..."
                        : isEn
                        ? "Ignite & Let Go (+2 Dew)"
                        : "เผาปล่อยวางสู่เวหา (+2 น้ำค้าง)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Safe Confirm Modal for Digging Up / Clearing a Plot */}
        <ConfirmModal
          isOpen={plotToClear !== null}
          title={isEn ? "Dig up Flora from Plot?" : "ถอนพืชพรรณออกจากแปลงปลูก?"}
          message={
            isEn
              ? "Are you sure you want to dig up this flora specimen? The plot will be raked clean and ready for new cultivation."
              : "คุณแน่ใจหรือไม่ว่าต้องการถอนพืชพรรณนี้ออกจากแปลง? แปลงดินจะถูกกวาดเรียบเพื่อเตรียมเพาะปลูกใหม่"
          }
          confirmLabel={isEn ? "Dig Up" : "ถอนออก"}
          variant="danger"
          onConfirm={handleConfirmClearPlot}
          onClose={() => setPlotToClear(null)}
        />
      </div>
    </ModalPortal>
  );
}
