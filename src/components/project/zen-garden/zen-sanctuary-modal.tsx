"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BellRing,
  Check,
  Droplets,
  Flower2,
  Leaf,
  ScrollText,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ArrowUpRight,
  Loader2,
  Briefcase,
  Coins,
  Heart,
  Activity,
  Sprout,
  Copy,
  FileText
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";
import { ModalPortal } from "@/components/ui/modal-portal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import gardenSkin from "./zen-garden-skin.module.css";
import { ZenGuardianArt } from "./zen-guardian-art";
import {
  type ZenGardenState,
  parseZenGardenState,
  calculateRealWorldSeason,
  calculateSkyTimeOfDay,
  canWaterToday,
  BOTANICAL_PLANTS
} from "@/lib/zen-garden/zen-state";
import {
  ZenGameToolLadle,
  ZenOmikujiScroll
} from "./zen-vector-art";
import {
  playZenWaterDrop,
  playZenSingingBowlHarmonic
} from "@/lib/sound";
import { getRankVisual } from "@/lib/omikuji/omikuji-data";

// Helper to format Japanese kanji numbers (1-100)
function toKanjiNumber(n: number): string {
  const digits = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (n <= 10) return digits[n];
  if (n < 20) return "十" + (n % 10 > 0 ? digits[n % 10] : "");
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const units = n % 10;
    return digits[tens] + "十" + (units > 0 ? digits[units] : "");
  }
  return "百";
}

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
  const params = useParams();
  const projectId = typeof params?.id === "string" ? params.id : null;

  const { isEn } = useLanguage();
  const { toast } = useToast();

  const [activeZen, setActiveZen] = useState<ZenGardenState>(
    () => initialZenState || parseZenGardenState(null)
  );
  const [coins, setCoins] = useState(initialCoins);
  const [isWatering, setIsWatering] = useState(false);
  const [isWaterConfirmOpen, setIsWaterConfirmOpen] = useState(false);
  const [isRingingChime, setIsRingingChime] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAttachingNote, setIsAttachingNote] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    void fetchGardenData();
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 80);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus();
    };
  }, [isOpen, fetchGardenData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isWaterConfirmOpen) onClose();
      if (event.key !== "Tab" || isWaterConfirmOpen) return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
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
            ? `Daily watering complete! +${data.awardedCoins ?? 5} serenity coins gained. 100 Asakusa fortune revealed.`
            : `รดน้ำประจำวันเรียบร้อยแล้ว! ได้รับ +${data.awardedCoins ?? 5} เหรียญแห่งสติ เปิดม้วนคำทำนายเซียมซี 100 ใบแล้ว`,
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

  // Copy Slip Text without Emojis
  const handleCopySlipText = async () => {
    if (!currentFortune) return;
    const num = currentFortune.fortuneNumber || 1;
    const rank = isEn ? (currentFortune.rankEn || currentFortune.gradeNameEn) : (currentFortune.rankTh || currentFortune.gradeName);
    const title = isEn ? (currentFortune.titleEn || currentFortune.gradeNameEn) : (currentFortune.titleTh || currentFortune.gradeName);
    const theme = isEn ? currentFortune.verse : currentFortune.verseTh;
    const career = isEn ? (currentFortune.careerEn || currentFortune.oracle) : (currentFortune.careerTh || currentFortune.oracleTh);
    const finance = isEn ? (currentFortune.financeEn || currentFortune.luckyFocus) : (currentFortune.financeTh || currentFortune.luckyFocusTh);
    const love = isEn ? (currentFortune.loveEn || "Harmonious balance and mutual understanding.") : (currentFortune.loveTh || "ความสัมพันธ์ราบรื่นจากการเคารพซึ่งกันและกัน");
    const health = isEn ? (currentFortune.healthEn || "Rest well and balance daily effort.") : (currentFortune.healthTh || "พักผ่อนให้เพียงพอและรักษาสมดุลร่างกาย");
    const growth = isEn ? (currentFortune.growthEn || currentFortune.workGuidance) : (currentFortune.growthTh || currentFortune.workGuidanceTh);

    const formatted = `══════════════════════════════════
Sensoji Asakusa Kannon Omikuji (No. ${num})
Rank: ${currentFortune.rankJp || "吉"} (${currentFortune.rankRomaji || "Kichi"} - ${rank})
Title: ${title}
══════════════════════════════════
• Wisdom: ${theme}

[1] Career & Craft: ${career}
[2] Finance & Wealth: ${finance}
[3] Love & Relationships: ${love}
[4] Health & Wellness: ${health}
[5] Personal Growth: ${growth}
══════════════════════════════════
Drawn from Retzlo Zen Garden Sanctuary`;

    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        message: isEn ? "Fortune slip copied to clipboard." : "คัดลอกคำทำนายเซียมซีลงคลิปบอร์ดแล้ว",
        type: "success"
      });
    } catch {
      toast({
        message: isEn ? "Failed to copy text." : "ไม่สามารถคัดลอกข้อความได้",
        type: "error"
      });
    }
  };

  // Attach as Note without Emojis
  const handleAttachAsNote = async () => {
    if (!currentFortune) return;
    setIsAttachingNote(true);

    const num = currentFortune.fortuneNumber || 1;
    const title = `[Zen Omikuji #${num}] ${currentFortune.rankJp || "吉"} - ${isEn ? (currentFortune.titleEn || currentFortune.gradeNameEn) : (currentFortune.titleTh || currentFortune.gradeName)}`;
    const rank = isEn ? (currentFortune.rankEn || currentFortune.gradeNameEn) : (currentFortune.rankTh || currentFortune.gradeName);
    const theme = isEn ? currentFortune.verse : currentFortune.verseTh;
    const career = isEn ? (currentFortune.careerEn || currentFortune.oracle) : (currentFortune.careerTh || currentFortune.oracleTh);
    const finance = isEn ? (currentFortune.financeEn || currentFortune.luckyFocus) : (currentFortune.financeTh || currentFortune.luckyFocusTh);
    const love = isEn ? (currentFortune.loveEn || "Harmonious balance and mutual understanding.") : (currentFortune.loveTh || "ความสัมพันธ์ราบรื่นจากการเคารพซึ่งกันและกัน");
    const health = isEn ? (currentFortune.healthEn || "Rest well and balance daily effort.") : (currentFortune.healthTh || "พักผ่อนให้เพียงพอและรักษาสมดุลร่างกาย");
    const growth = isEn ? (currentFortune.growthEn || currentFortune.workGuidance) : (currentFortune.growthTh || currentFortune.workGuidanceTh);

    const content = `> **${currentFortune.rankJp || "吉"} · ${currentFortune.rankRomaji || "Kichi"} (${rank})**
> *${theme}*

### Career & Work
${career}

### Finance & Wealth
${finance}

### Love & Relationships
${love}

### Health & Wellness
${health}

### Personal Growth
${growth}

---
*Drawn from Solitary Zen Garden on ${new Date().toLocaleDateString(isEn ? "en-US" : "th-TH")}*`;

    if (projectId) {
      try {
        const res = await fetch(`/api/projects/${projectId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            emoji: "scroll",
            color: "amber"
          })
        });

        if (res.ok) {
          toast({
            message: isEn
              ? `Attached to project notes: "${title}"`
              : `แนบ "${title}" ลงในบันทึกของโปรเจกต์สำเร็จ`,
            type: "success"
          });
          setIsAttachingNote(false);
          return;
        }
      } catch (err) {
        console.error("Failed to attach note via API:", err);
      }
    }

    // Fallback: Copy as markdown note
    try {
      await navigator.clipboard.writeText(`# ${title}\n\n${content}`);
      toast({
        message: isEn
          ? "Copied markdown note. Ready to paste into Note Studio."
          : "คัดลอกรูปแบบ Note แล้ว พร้อมนำไปวางใน Note Studio ได้ทันที",
        type: "success"
      });
    } catch {
      toast({
        message: isEn ? "Unable to attach note." : "ไม่สามารถบันทึก Note ได้",
        type: "error"
      });
    }
    setIsAttachingNote(false);
  };

  const rankVisual = currentFortune?.rankRomaji ? getRankVisual(currentFortune.rankRomaji) : null;
  const sealColor = rankVisual?.sealColor || "#b91c1c";

  return (
    <ModalPortal>
      <div role="dialog" aria-modal="true" aria-labelledby="zen-sanctuary-title" className={cn("fixed", gardenSkin.backdrop)}>
        <div ref={dialogRef} className={cn(gardenSkin.skin, gardenSkin.modalFrame)}>
          <header className={gardenSkin.modalHeader}>
            <div>
              <p className={gardenSkin.eyebrow}>ZEN GARDEN / ASAKUSA 100 OMIKUJI</p>
              <h2 id="zen-sanctuary-title" className={gardenSkin.title}>
                {isEn ? "A little guidance for today" : "คำทำนายของวันนี้"}
                <span aria-hidden="true">.</span>
              </h2>
            </div>
            <div className={gardenSkin.headerActions}>
              <button
                type="button"
                onClick={handleToggleSound}
                className={gardenSkin.iconButton}
                aria-label={activeZen.soundMuted ? (isEn ? "Unmute sounds" : "เปิดเสียง") : (isEn ? "Mute sounds" : "ปิดเสียง")}
              >
                {activeZen.soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                ref={closeButtonRef}
                className={gardenSkin.iconButton}
                aria-label={isEn ? "Close garden" : "ปิดสวน"}
              >
                <X size={19} />
              </button>
            </div>
          </header>

          <div className={gardenSkin.modalBody}>
            <div className={cn(gardenSkin.scene, gardenSkin.modalScene)}>
              <div className={gardenSkin.landscape} data-season={season} data-time={timeOfDay} aria-hidden="true" />
              <div className={gardenSkin.sceneShade} aria-hidden="true" />
              <div className={gardenSkin.sceneCopy}>
                <span className={gardenSkin.sceneEyebrow}>
                  <span className={gardenSkin.liveDot} />
                  {isEn ? "A MOMENT OF STILLNESS" : "ช่วงเวลาแห่งความสงบ"}
                </span>
                <p>
                  {isEn ? (
                    <>Grow gently.<br />Trust your own rhythm.</>
                  ) : (
                    <>ค่อย ๆ เติบโต<br />ในจังหวะของคุณ</>
                  )}
                </p>
              </div>
              <span className={gardenSkin.japaneseMark} aria-hidden="true">心の庭</span>
              <div className={gardenSkin.scenePlant}>
                <ZenGuardianArt plantId={activeGuardian.id} stage={4} className="h-full w-full" />
              </div>
              <div className={gardenSkin.sceneBottom}>
                <span>
                  <Flower2 size={13} />
                  {isEn ? activeGuardian.name : activeGuardian.nameTh}
                </span>
                <span>{activeGuardian.solfeggioFreq} Hz</span>
              </div>
              {isWatering && (
                <div className={gardenSkin.wateringOverlay}>
                  <ZenGameToolLadle className="h-12 w-12 animate-bounce" />
                </div>
              )}
            </div>

            <div className={gardenSkin.modalMeta}>
              <p>{isEn ? seasonLabels.en : seasonLabels.th}</p>
              <span>
                <Sparkles size={12} />
                {coins}c · {activeZen.nurtureStreak} {isEn ? "day streak" : "วันต่อเนื่อง"}
              </span>
            </div>

            {!hasWateredToday ? (
              <div className={gardenSkin.readingIntro}>
                <span className={gardenSkin.introIcon}>
                  <Droplets size={22} />
                </span>
                <p className={gardenSkin.eyebrow}>
                  {isEn ? "A SMALL RITUAL. A FRESH BEGINNING." : "รดน้ำให้สวน เติมความสงบให้ใจ"}
                </p>
                <h3>{isEn ? "Let today's fortune unfold" : "เปิดรับคำทำนายของวันนี้"}</h3>
                <p className={gardenSkin.description}>
                  {isEn
                    ? "Care for your garden and receive a thought to carry into your day. A little guidance across 5 life dimensions and 5 serenity coins."
                    : "ดูแลสวนสักนิด แล้วรับคำทำนายเซียมซี 100 ใบ พร้อมคำแนะนำ 5 มิติ และเหรียญแห่งสติ 5 เหรียญ"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsWaterConfirmOpen(true)}
                  disabled={isWatering}
                  className={gardenSkin.primaryButton}
                >
                  <span>
                    {isWatering ? (
                      <Loader2 size={17} className={gardenSkin.spin} />
                    ) : (
                      <Droplets size={17} />
                    )}
                    {isWatering
                      ? (isEn ? "Saving your ritual…" : "กำลังบันทึกกิจวัตร…")
                      : (isEn ? "Water the garden · +5 coins" : "รดน้ำสวนวันนี้ · +5 เหรียญ")}
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              </div>
            ) : currentFortune ? (
              <div className={gardenSkin.readingWrap}>
                <ZenOmikujiScroll
                  grade={currentFortune.grade}
                  surfaceClassName={gardenSkin.scrollSurface}
                  className={gardenSkin.scroll}
                >
                  <article className={gardenSkin.reading}>
                    {/* Header */}
                    <header className={gardenSkin.readingHeader}>
                      <span className={gardenSkin.readingEyebrow}>
                        浅草寺 観音百番おみくじ / SENSOJI 100 OMIKUJI
                      </span>
                      <div className="flex items-center gap-4 mt-4 mb-2">
                        {/* Wax Seal Badge (Zero Emojis) */}
                        <div
                          className={gardenSkin.waxSealBadge}
                          style={{
                            backgroundColor: sealColor
                          }}
                        >
                          <span className={gardenSkin.waxSealKanji}>
                            {currentFortune.rankJp || "吉"}
                          </span>
                          <span className={gardenSkin.waxSealRomaji}>
                            {currentFortune.rankRomaji || "Kichi"}
                          </span>
                        </div>

                        <div className="text-left">
                          <h3 className="text-xl font-bold font-serif text-[#344234]">
                            第 {toKanjiNumber(currentFortune.fortuneNumber || 1)} 番
                          </h3>
                          <p className="text-xs text-[#775f43] font-medium">
                            {isEn
                              ? (currentFortune.titleEn || currentFortune.gradeNameEn)
                              : (currentFortune.titleTh || currentFortune.gradeName)}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#81785f] font-mono mt-1">
                        {currentFortune.date} · SLIP #{currentFortune.fortuneNumber || 1}
                      </p>
                    </header>

                    {/* Central Wisdom Verse */}
                    <p className={gardenSkin.readingVerse}>
                      &ldquo;{isEn ? currentFortune.verse : currentFortune.verseTh}&rdquo;
                    </p>

                    {/* 5 Guidance Dimensions (With Lucide SVG Icons, Zero Emojis) */}
                    <div className={gardenSkin.dimensionGrid}>
                      {/* 1. Career & Work */}
                      <div className={gardenSkin.dimensionCard}>
                        <div className={gardenSkin.dimensionHeading}>
                          <Briefcase size={13} className="text-indigo-700" />
                          <span>{isEn ? "Career & Craft" : "การงานและการสร้างสรรค์"}</span>
                        </div>
                        <p className={gardenSkin.dimensionContent}>
                          {isEn
                            ? (currentFortune.careerEn || currentFortune.oracle)
                            : (currentFortune.careerTh || currentFortune.oracleTh)}
                        </p>
                      </div>

                      {/* 2. Finance & Wealth */}
                      <div className={gardenSkin.dimensionCard}>
                        <div className={gardenSkin.dimensionHeading}>
                          <Coins size={13} className="text-amber-700" />
                          <span>{isEn ? "Finance & Wealth" : "การเงินและโชคลาภ"}</span>
                        </div>
                        <p className={gardenSkin.dimensionContent}>
                          {isEn
                            ? (currentFortune.financeEn || currentFortune.luckyFocus)
                            : (currentFortune.financeTh || currentFortune.luckyFocusTh)}
                        </p>
                      </div>

                      {/* 3. Love & Relationships */}
                      <div className={gardenSkin.dimensionCard}>
                        <div className={gardenSkin.dimensionHeading}>
                          <Heart size={13} className="text-rose-700" />
                          <span>{isEn ? "Love & Relationships" : "ความสัมพันธ์และความรัก"}</span>
                        </div>
                        <p className={gardenSkin.dimensionContent}>
                          {isEn
                            ? (currentFortune.loveEn || "Quiet mutual respect builds lasting harmony.")
                            : (currentFortune.loveTh || "ความสัมพันธ์มั่นคงจากการเคารพและรับฟังซึ่งกันและกัน")}
                        </p>
                      </div>

                      {/* 4. Health & Wellness */}
                      <div className={gardenSkin.dimensionCard}>
                        <div className={gardenSkin.dimensionHeading}>
                          <Activity size={13} className="text-emerald-700" />
                          <span>{isEn ? "Health & Wellness" : "สุขภาพและความเป็นอยู่"}</span>
                        </div>
                        <p className={gardenSkin.dimensionContent}>
                          {isEn
                            ? (currentFortune.healthEn || "Balance focused energy with restorative rest.")
                            : (currentFortune.healthTh || "รักษาสมดุลร่างกายและจัดเวลาพักผ่อนอย่างพอเหมาะ")}
                        </p>
                      </div>

                      {/* 5. Personal Growth (Full Width) */}
                      <div className={cn(gardenSkin.dimensionCard, gardenSkin.dimensionCardFull)}>
                        <div className={gardenSkin.dimensionHeading}>
                          <Sprout size={13} className="text-teal-700" />
                          <span>{isEn ? "Personal Growth" : "การเติบโตและการพัฒนาตนเอง"}</span>
                        </div>
                        <p className={gardenSkin.dimensionContent}>
                          {isEn
                            ? (currentFortune.growthEn || currentFortune.workGuidance)
                            : (currentFortune.growthTh || currentFortune.workGuidanceTh)}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Copy and Attach as Note */}
                    <div className={gardenSkin.slipActions}>
                      <button
                        type="button"
                        onClick={handleCopySlipText}
                        className={gardenSkin.actionPill}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copied ? (isEn ? "Copied" : "คัดลอกแล้ว") : (isEn ? "Copy Slip" : "คัดลอกคำทำนาย")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAttachAsNote}
                        disabled={isAttachingNote}
                        className={cn(gardenSkin.actionPill, gardenSkin.actionPillPrimary)}
                      >
                        <FileText size={13} />
                        <span>{isAttachingNote ? (isEn ? "Saving…" : "กำลังบันทึก…") : (isEn ? "Attach as Project Note" : "แนบเป็น Note ในโปรเจกต์")}</span>
                      </button>
                    </div>
                  </article>
                </ZenOmikujiScroll>

                <div className={gardenSkin.readingFooter}>
                  <span>
                    <Check size={14} />
                    {isEn ? "Your garden is cared for today" : "วันนี้ดูแลสวนเรียบร้อยแล้ว"}
                  </span>
                  <button
                    type="button"
                    onClick={handleRingSingingBowl}
                    disabled={isRingingChime}
                    className={gardenSkin.textButton}
                  >
                    <BellRing size={15} />
                    {isEn ? "A moment of calm" : "ฟังเสียงระฆังพักใจ"}
                  </button>
                </div>
              </div>
            ) : (
              <p className={gardenSkin.description}>
                {isEn
                  ? "Your garden is cared for today. A new fortune awaits with tomorrow's ritual."
                  : "วันนี้ดูแลสวนเรียบร้อยแล้ว กลับมารับคำทำนายใหม่ในกิจวัตรวันพรุ่งนี้"}
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isWaterConfirmOpen}
        layer="above-modal"
        title={isEn ? "Water the garden today?" : "รดน้ำสวนวันนี้ไหม?"}
        message={
          isEn
            ? "This daily ritual reveals your 100 Asakusa Omikuji fortune across 5 dimensions and adds 5 serenity coins."
            : "กิจวัตรนี้จะเปิดคำทำนายเซียมซี 100 ใบของวัดอาซากุสะ พร้อมคำแนะนำ 5 ด้าน และเพิ่มเหรียญแห่งสติ 5 เหรียญ"
        }
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
