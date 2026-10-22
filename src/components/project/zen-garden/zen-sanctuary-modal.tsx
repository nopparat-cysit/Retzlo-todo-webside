"use client";

import React, { useState } from "react";
import {
  X,
  Droplets,
  Sun,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  Flower2,
  Plus,
  Compass,
  Check,
  RotateCcw,
  Wind
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  BOTANICAL_PLANTS,
  type BotanicalPlant,
  calculateRealWorldSeason,
  calculateSkyTimeOfDay,
  type GardenPlot,
  type ZenGardenState
} from "@/lib/zen-garden/zen-state";
import {
  ZenFloraRenderer,
  ZenBonsaiPine,
  ZenSakuraBlossom,
  ZenBambooGrove,
  ZenLotusPond,
  ZenStoneLantern,
  ZenSleepyCat
} from "./zen-vector-art";
import { playZenWaterDrop, playZenSingingBowlHarmonic } from "@/lib/sound";

interface ZenSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  zenState: ZenGardenState;
  globalCoins: number;
  onRefreshData: () => Promise<void>;
}

export function ZenSanctuaryModal({
  isOpen,
  onClose,
  zenState,
  globalCoins,
  onRefreshData
}: ZenSanctuaryModalProps) {
  const { isEn } = useLanguage();
  const { toast } = useToast();

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(4); // default center
  const [isWatering, setIsWatering] = useState(false);
  const [showSeedPicker, setShowSeedPicker] = useState(false);
  const [showWorryBrazier, setShowWorryBrazier] = useState(false);
  const [worryText, setWorryText] = useState("");
  const [isBurningWorry, setIsBurningWorry] = useState(false);

  if (!isOpen) return null;

  const season = calculateRealWorldSeason();
  const timeOfDay = calculateSkyTimeOfDay();

  const seasonLabels = {
    spring: { en: "Spring Season · Cherry Blossom Bloom", th: "ฤดูใบไม้ผลิ · ดอกซากุระผลิบาน" },
    summer: { en: "Summer Season · Verdant Bamboo & Lotus", th: "ฤดูร้อน · สายธารไผ่และบงกช" },
    autumn: { en: "Autumn Season · Golden Harvest", th: "ฤดูใบไม้ร่วง · แปะก๊วยทองคำ" },
    winter: { en: "Winter Season · Serene Frost & Snow", th: "ฤดูหนาว · เหมันต์อันสงบ" }
  }[season];

  const skyTheme = {
    dawn: "from-amber-100/60 via-rose-50/40 to-indigo-100/60 dark:from-[#131124] dark:via-[#1c183a] dark:to-[#0f0e1f]",
    day: "from-sky-50 via-emerald-50/30 to-amber-50/40 dark:from-[#0d1226] dark:via-[#111936] dark:to-[#0a0e1c]",
    dusk: "from-amber-200/40 via-purple-100/40 to-indigo-200/50 dark:from-[#1f1530] dark:via-[#25153b] dark:to-[#120d22]",
    night: "from-indigo-950/20 via-stone-900/10 to-purple-950/30 dark:from-[#070814] dark:via-[#090b1c] dark:to-[#05060f]"
  }[timeOfDay];

  const selectedPlot =
    selectedSlotIndex !== null ? zenState.plots[selectedSlotIndex] : null;

  // Water the selected plot with 1 dewdrop
  const handleWaterPlot = async (slotIdx: number) => {
    if (isWatering || zenState.dewdrops < 1) {
      if (zenState.dewdrops < 1) {
        toast({
          message: isEn
            ? "No morning dewdrops left! Complete tasks on Kanban to earn dew."
            : "หยดน้ำทิพย์หมดแล้ว! เคลียร์การ์ดในบอร์ด Kanban เพื่อรับน้ำเพิ่ม",
          type: "info"
        });
      }
      return;
    }

    setIsWatering(true);
    playZenWaterDrop(!zenState.soundMuted);

    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "water-plot", slotIndex: slotIdx })
      });

      if (res.ok) {
        const data = await res.json();
        playZenSingingBowlHarmonic(!zenState.soundMuted, 528);
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
        await onRefreshData();
      }
    } catch {
      // Graceful error
    } finally {
      setIsWatering(false);
    }
  };

  // Plant a new seed into the selected plot
  const handlePlantSeed = async (plantId: string, slotIdx: number) => {
    try {
      const res = await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plant-plot",
          slotIndex: slotIdx,
          itemType: plantId === "lantern" || plantId === "cat" ? "decor" : "flora",
          itemId: plantId
        })
      });

      if (res.ok) {
        toast({
          message: isEn ? "Seed cultivated in sanctuary plot!" : "เพาะเมล็ดพันธุ์ลงแปลงเรียบร้อยแล้ว!",
          type: "success"
        });
        setShowSeedPicker(false);
        await onRefreshData();
      }
    } catch {
      // Graceful
    }
  };

  // Burn worry ritual
  const handleBurnWorry = () => {
    if (!worryText.trim() || isBurningWorry) return;
    setIsBurningWorry(true);
    playZenSingingBowlHarmonic(!zenState.soundMuted, 432);

    setTimeout(async () => {
      setIsBurningWorry(false);
      setWorryText("");
      setShowWorryBrazier(false);
      toast({
        message: isEn
          ? "🌬️ Anxiety released into the heavens. Mind is calm and unburdened."
          : "🌬️ ปล่อยวางความกังวลสู่เวหา จิตใจปลอดโปร่งบริสุทธิ์แล้ว",
        type: "success"
      });
      // Award rich soil/dewdrop for mindful release
      await fetch("/api/zen-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "award-dewdrop", count: 2 })
      });
      await onRefreshData();
    }, 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1600] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className={cn(
          "relative flex flex-col w-full max-w-4xl h-[92vh] max-h-[820px] rounded-3xl border border-stone-200/90 dark:border-white/10 overflow-hidden shadow-2xl transition-all duration-500 bg-gradient-to-b",
          skyTheme
        )}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-ink-950/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Flower2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100 uppercase">
                  {isEn ? "Solitary Zen Sanctuary" : "วิหารสวนเซนแห่งสติ"}
                </h3>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                  3×3 Living Terrarium
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {isEn ? seasonLabels.en : seasonLabels.th}
              </p>
            </div>
          </div>

          {/* Resources Status Pills */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 text-xs font-mono font-bold"
              title={isEn ? "Dewdrops: Earned from Kanban Done tasks" : "หยดน้ำทิพย์: ได้จากการเคลียร์งานใน Kanban"}
            >
              <Droplets className="h-3.5 w-3.5 text-sky-500" />
              <span>{zenState.dewdrops}</span>
            </div>

            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-dusk-amber text-xs font-mono font-bold"
              title={isEn ? "Sunlight: Earned from Focus sessions" : "พลังแสงแดด: ได้จากโหมดโฟกัสงาน"}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>{zenState.sunlight}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-stone-700 dark:text-stone-300 text-xs font-mono font-bold">
              <span>✦</span>
              <span>{globalCoins}c</span>
            </div>

            <button
              type="button"
              onClick={() => setShowWorryBrazier(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-rose-300/80 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 text-xs font-semibold transition cursor-pointer"
              title={isEn ? "Burn & Release Work Anxiety" : "เตาเผาหินปล่อยวางความกังวล"}
            >
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span className="hidden sm:inline">{isEn ? "Release Worry" : "ปล่อยวาง"}</span>
            </button>

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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-between space-y-4">
          {/* Subtle Ambient Instruction Hint */}
          <div className="text-center space-y-0.5">
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              {isEn ? "Tap any plot to inspect, water with dewdrops, or cultivate flora" : "แตะที่แปลงดินเพื่อตรวจสอบ รดน้ำด้วยหยดน้ำทิพย์ หรือเพาะเมล็ดพันธุ์"}
            </p>
            <p className="text-[10.5px] font-mono text-stone-500 dark:text-stone-400">
              {isEn ? "Karesansui Sand Bed · Real-Time Ambient Cycle" : "ลานทรายเซนคาเรซันซุย · วัฏจักรธรรมชาติเคลื่อนไหวสด"}
            </p>
          </div>

          {/* 3x3 Grid Landscaping Sand Bed */}
          <div className="relative p-5 sm:p-7 rounded-3xl border border-stone-300/90 dark:border-white/10 bg-gradient-to-b from-stone-100/90 via-stone-200/80 to-stone-300/90 dark:from-[#0d1024] dark:via-[#0f1228] dark:to-[#090b1c] shadow-2xl max-w-xl w-full">
            {/* Raked Sand Ripple Texture */}
            <div
              className="absolute inset-0 rounded-3xl opacity-30 dark:opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 18px, rgba(120, 113, 108, 0.35) 19px, transparent 20px)"
              }}
            />

            <div className="grid grid-cols-3 gap-3.5 sm:gap-4 relative z-10">
              {zenState.plots.map((plot) => {
                const isSelected = selectedSlotIndex === plot.slotIndex;
                const isPlanted = plot.itemType !== "empty" && plot.itemId;

                return (
                  <div
                    key={plot.slotIndex}
                    onClick={() => setSelectedSlotIndex(plot.slotIndex)}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group",
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/40 bg-white/95 dark:bg-white/[0.08] shadow-lg scale-105 z-20"
                        : "border-stone-300/80 bg-white/70 hover:border-emerald-400/70 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] shadow-sm"
                    )}
                  >
                    {/* Plot Slot Number Badge */}
                    <span className="absolute top-1.5 left-2 font-mono text-[8.5px] text-stone-400 dark:text-stone-500 select-none">
                      #{plot.slotIndex + 1}
                    </span>

                    {/* Planted Content vs Empty Plot */}
                    {isPlanted ? (
                      <div className="flex flex-col items-center justify-center p-1 w-full h-full">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-transform group-hover:scale-110">
                          <ZenFloraRenderer
                            plantId={plot.itemId!}
                            stage={plot.stage}
                            className="w-full h-full"
                          />
                        </div>
                        {/* Stage Dots Indicator */}
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={cn(
                                "h-1 w-1 rounded-full transition-all",
                                i < plot.stage
                                  ? "bg-emerald-500"
                                  : "bg-stone-300 dark:bg-white/15"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-5 w-5" />
                        <span className="text-[9.5px] font-mono">
                          {isEn ? "Empty" : "แปลงว่าง"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspector Card for Selected Plot */}
          {selectedPlot && (
            <div className="w-full max-w-xl rounded-2xl border border-stone-200/90 dark:border-white/10 bg-white/85 dark:bg-ink-950/80 p-4 shadow-md backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                    {isEn ? `Plot #${selectedPlot.slotIndex + 1}` : `แปลงปลูกที่ #${selectedPlot.slotIndex + 1}`}
                  </span>
                  {selectedPlot.itemType !== "empty" ? (
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                      {isEn ? `Stage ${selectedPlot.stage}/5` : `การเติบโตขั้นที่ ${selectedPlot.stage}/5`}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-400">
                      {isEn ? "Ready for Cultivation" : "พร้อมเพาะปลูก"}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {selectedPlot.itemType !== "empty"
                    ? isEn
                      ? `Nourished ${selectedPlot.waterCount} times with morning dew drops.`
                      : `ได้รับการรดน้ำดูแลแล้ว ${selectedPlot.waterCount} ครั้ง`
                    : isEn
                    ? "Cultivate a seed to begin its 5-stage mindful growth journey."
                    : "เลือกเมล็ดพันธุ์เพื่อเริ่มการเติบโต 5 ระยะสู่พฤกษาโบราณ"}
                </p>
              </div>

              {/* Action Buttons for Selected Plot */}
              <div className="flex items-center gap-2 shrink-0">
                {selectedPlot.itemType !== "empty" ? (
                  <button
                    type="button"
                    onClick={() => handleWaterPlot(selectedPlot.slotIndex)}
                    disabled={isWatering}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-400/80 bg-sky-500 text-white hover:bg-sky-600 active:scale-95 text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Droplets className="h-3.5 w-3.5" />
                    <span>{isEn ? "Water (-1 Dew)" : "รดน้ำ (-1 หยด)"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSeedPicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isEn ? "Plant Seed" : "ปลูกพฤกษา"}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Seed Picker Modal Overlay ─── */}
        {showSeedPicker && selectedPlot && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-ink-950 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Flower2 className="h-4 w-4 text-emerald-500" />
                  <span>{isEn ? "Select Flora to Cultivate" : "เลือกเมล็ดพันธุ์เพื่อเพาะปลูก"}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSeedPicker(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {[
                  { id: "bonsai", name: "Bonsai Pine", nameTh: "บอนไซสนโบราณ", icon: "🪴" },
                  { id: "blossom", name: "Cherry Blossom", nameTh: "ซากุระสมาธิ", icon: "🌸" },
                  { id: "bamboo", name: "Zen Bamboo", nameTh: "ไผ่เซนหยั่งราก", icon: "🎋" },
                  { id: "lotus", name: "Sacred Lotus", nameTh: "บัวสวรรค์ & สระน้ำ", icon: "🪷" },
                  { id: "ginkgo", name: "Golden Ginkgo", nameTh: "แปะก๊วยทองคำ", icon: "🌕" },
                  { id: "lantern", name: "Stone Toro", nameTh: "โคมไฟหินเซน", icon: "🏮" },
                  { id: "cat", name: "Sleepy Cat", nameTh: "เจ้าแมวส้มหลับปุ๋ย", icon: "🐱" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePlantSeed(item.id, selectedPlot.slotIndex)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-white/10 dark:hover:bg-white/[0.05] transition text-left cursor-pointer"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {isEn ? item.name : item.nameTh}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">
                        {isEn ? "Select" : "เลือกปลูก"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Worry Brazier Modal Overlay ─── */}
        {showWorryBrazier && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-white dark:bg-ink-950 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {isEn ? "Burn & Release Work Anxiety" : "เตาเผาหินปล่อยวางความกังวล"}
                    </h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {isEn ? "Write down your stress, let it dissolve into sacred ash." : "พิมพ์สิ่งที่ติดค้างในใจ แล้วปล่อยให้มอดไหม้เป็นพลังใจบริสุทธิ์"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWorryBrazier(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <textarea
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder={
                  isEn
                    ? "Type any frustration, code bugs, or fatigue you wish to release... (Never stored in database)"
                    : "พิมพ์ระบายความเหนื่อยล้า ความกังวลใจ หรือสิ่งที่อยากปล่อยวาง... (ไม่มีการบันทึกข้อมูล)"
                }
                rows={3}
                className="w-full rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-black/30 p-3 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-rose-400 transition"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWorryBrazier(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-white/10 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5"
                >
                  {isEn ? "Cancel" : "ยกเลิก"}
                </button>

                <button
                  type="button"
                  onClick={handleBurnWorry}
                  disabled={!worryText.trim() || isBurningWorry}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md hover:from-rose-600 hover:to-amber-600 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  <Flame className={cn("h-3.5 w-3.5", isBurningWorry && "animate-spin")} />
                  <span>{isBurningWorry ? (isEn ? "Dissolving..." : "กำลังมอดไหม้...") : isEn ? "Release & Let Go" : "ปล่อยวางสู่เวหา"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
