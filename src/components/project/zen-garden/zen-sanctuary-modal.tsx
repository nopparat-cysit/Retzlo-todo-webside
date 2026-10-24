"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Droplets,
  Flower2,
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
  Sprout
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";
import { ModalPortal } from "@/components/ui/modal-portal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import gardenSkin from "./zen-garden-skin.module.css";
import { ZenGuardianArt } from "./zen-guardian-art";
import { ZenFortuneReading, type FortuneDimension } from "./zen-fortune-reading";
import {
  type ZenGardenState,
  type DailyFortune,
  parseZenGardenState,
  calculateRealWorldSeason,
  calculateSkyTimeOfDay,
  canWaterToday,
  BOTANICAL_PLANTS
} from "@/lib/zen-garden/zen-state";
import {
  ZenGameToolLadle
} from "./zen-vector-art";
import {
  playZenWaterDrop,
  playZenSingingBowlHarmonic
} from "@/lib/sound";
import { getFortuneByNumber } from "@/lib/omikuji/omikuji-data";


// Reconciles daily fortune with authentic Asakusa 100 dataset to prevent fallback artifacts
function resolveFortuneData(currentFortune: DailyFortune | null | undefined) {
  if (!currentFortune) return null;
  const num = currentFortune.fortuneNumber || 1;
  const rawItem = getFortuneByNumber(num);

  const isPlaceholderOrMissing = (val?: string) =>
    !val || val.includes("Desk Plant") || val.includes("Hourly Hydration") || val.trim().length === 0;

  const rankJp = currentFortune.rankJp || rawItem?.rank_jp || "吉";
  const rankRomaji = currentFortune.rankRomaji || rawItem?.rank_romaji || "Kichi";
  const rankTh = currentFortune.rankTh || rawItem?.rank_th || currentFortune.gradeName || "โชคดี";
  const rankEn = currentFortune.rankEn || rawItem?.rank_en || currentFortune.gradeNameEn || "Good Fortune";

  const titleTh = currentFortune.titleTh || rawItem?.title_th || currentFortune.gradeName || "คำทำนายมงคล";
  const titleEn = currentFortune.titleEn || rawItem?.title_en || currentFortune.gradeNameEn || "Sacred Fortune";

  const verseTh = !isPlaceholderOrMissing(currentFortune.verseTh)
    ? currentFortune.verseTh
    : rawItem?.central_theme_th || "ความสำเร็จที่แท้จริงเริ่มต้นจากความสงบและการลงมือทำอย่างสม่ำเสมอ";
  const verseEn = !isPlaceholderOrMissing(currentFortune.verse)
    ? currentFortune.verse
    : rawItem?.central_theme_en || "True mastery begins with inner calm and steadfast practice.";

  const careerTh = !isPlaceholderOrMissing(currentFortune.careerTh)
    ? currentFortune.careerTh
    : rawItem?.career_work_th || currentFortune.oracleTh || "ความชัดเจนและรากฐานที่มั่นคงจะนำไปสู่ความสำเร็จก้าวสำคัญ";
  const careerEn = !isPlaceholderOrMissing(currentFortune.careerEn)
    ? currentFortune.careerEn
    : rawItem?.career_work_en || currentFortune.oracle || "Foundational clarity and steady application yield lasting success.";

  const financeTh = !isPlaceholderOrMissing(currentFortune.financeTh)
    ? currentFortune.financeTh
    : rawItem?.finance_wealth_th || "เติบโตอย่างมั่นคง จัดสรรทรัพย์สินด้วยความรอบคอบและมองการณ์ไกล";
  const financeEn = !isPlaceholderOrMissing(currentFortune.financeEn)
    ? currentFortune.financeEn
    : rawItem?.finance_wealth_en || "Steady growth; steward resources with prudence and long-term vision.";

  const loveTh = !isPlaceholderOrMissing(currentFortune.loveTh)
    ? currentFortune.loveTh
    : rawItem?.love_relationships_th || "ความสัมพันธ์แน่นแฟ้นยิ่งขึ้นด้วยความไว้วางใจ ความเข้าใจ และความจริงใจ";
  const loveEn = !isPlaceholderOrMissing(currentFortune.loveEn)
    ? currentFortune.loveEn
    : rawItem?.love_relationships_en || "Deepening harmony through mutual respect, trust, and transparent care.";

  const healthTh = !isPlaceholderOrMissing(currentFortune.healthTh)
    ? currentFortune.healthTh
    : rawItem?.health_wellness_th || "รักษาสมดุลร่างกาย จิตใจ และจัดเวลาพักผ่อนให้เพียงพอ";
  const healthEn = !isPlaceholderOrMissing(currentFortune.healthEn)
    ? currentFortune.healthEn
    : rawItem?.health_wellness_en || "Sustain vitality through balanced pacing and restorative rest.";

  const growthTh = !isPlaceholderOrMissing(currentFortune.growthTh)
    ? currentFortune.growthTh
    : rawItem?.personal_growth_th || currentFortune.workGuidanceTh || "การฝึกฝนตนเองอย่างมีสติจะนำพาปัญญาและความก้าวหน้าที่ยั่งยืน";
  const growthEn = !isPlaceholderOrMissing(currentFortune.growthEn)
    ? currentFortune.growthEn
    : rawItem?.personal_growth_en || currentFortune.workGuidance || "Mindful daily cultivation opens the gateway to profound wisdom and expansion.";

  return {
    num,
    rankJp,
    rankRomaji,
    rankTh,
    rankEn,
    titleTh,
    titleEn,
    verseTh,
    verseEn,
    careerTh,
    careerEn,
    financeTh,
    financeEn,
    loveTh,
    loveEn,
    healthTh,
    healthEn,
    growthTh,
    growthEn,
    date: currentFortune.date || new Date().toISOString().split("T")[0],
    grade: currentFortune.grade
  };
}

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
  const [slipLang, setSlipLang] = useState<"auto" | "th" | "en">("auto");
  const activeIsEn = slipLang === "auto" ? isEn : slipLang === "en";

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

  // Copy Slip Text without Emojis (Bilingual aware)
  const handleCopySlipText = async () => {
    const resolved = resolveFortuneData(currentFortune);
    if (!resolved) return;

    const rank = activeIsEn ? resolved.rankEn : resolved.rankTh;
    const title = activeIsEn ? resolved.titleEn : resolved.titleTh;
    const theme = activeIsEn ? resolved.verseEn : resolved.verseTh;

    const formatted = `══════════════════════════════════
Sensoji Asakusa Kannon Omikuji (No. ${resolved.num})
Rank: ${resolved.rankJp} (${resolved.rankRomaji} - ${rank})
Title: ${title}
══════════════════════════════════
• Sacred Counsel: ${theme}

[1] Career & Purpose: ${activeIsEn ? resolved.careerEn : resolved.careerTh}
[2] Finance & Wealth: ${activeIsEn ? resolved.financeEn : resolved.financeTh}
[3] Love & Harmony: ${activeIsEn ? resolved.loveEn : resolved.loveTh}
[4] Health & Vitality: ${activeIsEn ? resolved.healthEn : resolved.healthTh}
[5] Personal Growth: ${activeIsEn ? resolved.growthEn : resolved.growthTh}
══════════════════════════════════
Drawn from Retzlo Zen Garden Sanctuary`;

    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        message: activeIsEn ? "Fortune slip copied to clipboard." : "คัดลอกคำทำนายเซียมซีลงคลิปบอร์ดแล้ว",
        type: "success"
      });
    } catch {
      toast({
        message: activeIsEn ? "Failed to copy text." : "ไม่สามารถคัดลอกข้อความได้",
        type: "error"
      });
    }
  };

  // Attach as Note without Emojis (Bilingual aware)
  const handleAttachAsNote = async () => {
    const resolved = resolveFortuneData(currentFortune);
    if (!resolved) return;
    setIsAttachingNote(true);

    const title = `[Zen Omikuji #${resolved.num}] ${resolved.rankJp} - ${activeIsEn ? resolved.titleEn : resolved.titleTh}`;
    const rank = activeIsEn ? resolved.rankEn : resolved.rankTh;
    const theme = activeIsEn ? resolved.verseEn : resolved.verseTh;

    const content = `> **${resolved.rankJp} · ${resolved.rankRomaji} (${rank})**
> *${theme}*

### Career & Purpose
${activeIsEn ? resolved.careerEn : resolved.careerTh}

### Finance & Wealth
${activeIsEn ? resolved.financeEn : resolved.financeTh}

### Love & Harmony
${activeIsEn ? resolved.loveEn : resolved.loveTh}

### Health & Vitality
${activeIsEn ? resolved.healthEn : resolved.healthTh}

### Personal Growth
${activeIsEn ? resolved.growthEn : resolved.growthTh}

---
*Drawn from Solitary Zen Garden on ${new Date().toLocaleDateString(activeIsEn ? "en-US" : "th-TH")}*`;

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
            message: activeIsEn
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
        message: activeIsEn
          ? "Copied markdown note. Ready to paste into Note Studio."
          : "คัดลอกรูปแบบ Note แล้ว พร้อมนำไปวางใน Note Studio ได้ทันที",
        type: "success"
      });
    } catch {
      toast({
        message: activeIsEn ? "Unable to attach note." : "ไม่สามารถบันทึก Note ได้",
        type: "error"
      });
    }
    setIsAttachingNote(false);
  };

  const resolvedFortune = resolveFortuneData(currentFortune);
  const showReading = hasWateredToday && Boolean(currentFortune && resolvedFortune);
  const dimensions: FortuneDimension[] = resolvedFortune ? [
    { id: "career", label: activeIsEn ? "Career & Purpose" : "การงานและเป้าหมาย", content: activeIsEn ? resolvedFortune.careerEn : resolvedFortune.careerTh, icon: Briefcase },
    { id: "finance", label: activeIsEn ? "Finance & Wealth" : "การเงินและทรัพย์สิน", content: activeIsEn ? resolvedFortune.financeEn : resolvedFortune.financeTh, icon: Coins },
    { id: "love", label: activeIsEn ? "Love & Harmony" : "ความรักและความสัมพันธ์", content: activeIsEn ? resolvedFortune.loveEn : resolvedFortune.loveTh, icon: Heart },
    { id: "health", label: activeIsEn ? "Health & Vitality" : "สุขภาพและการพักผ่อน", content: activeIsEn ? resolvedFortune.healthEn : resolvedFortune.healthTh, icon: Activity },
    { id: "growth", label: activeIsEn ? "Personal Growth & Mastery" : "การเรียนรู้และเติบโต", content: activeIsEn ? resolvedFortune.growthEn : resolvedFortune.growthTh, icon: Sprout }
  ] : [];

  return (
    <ModalPortal>
      <div role="dialog" aria-modal="true" aria-labelledby="zen-sanctuary-title" className={cn("fixed", gardenSkin.backdrop)}>
        <div ref={dialogRef} className={cn(gardenSkin.skin, gardenSkin.modalFrame)}>
          <header className={gardenSkin.modalHeader}>
            <div>
              <p className={gardenSkin.eyebrow}>ZEN GARDEN / DAILY FORTUNE</p>
              <h2 id="zen-sanctuary-title" className={gardenSkin.title}>
                {isEn ? "Your daily fortune" : "คำทำนายของวันนี้"}
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

          <div className={cn(gardenSkin.modalBody, showReading && gardenSkin.fortuneBody)}>
            {!hasWateredToday && (
              <>
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

              </>
            )}

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
            ) : currentFortune && resolvedFortune ? (
              <ZenFortuneReading
                number={resolvedFortune.num}
                japaneseNumber={toKanjiNumber(resolvedFortune.num)}
                rankJp={resolvedFortune.rankJp}
                rankRomaji={resolvedFortune.rankRomaji}
                rankName={activeIsEn ? resolvedFortune.rankEn : resolvedFortune.rankTh}
                title={activeIsEn ? resolvedFortune.titleEn : resolvedFortune.titleTh}
                verse={activeIsEn ? resolvedFortune.verseEn : resolvedFortune.verseTh}
                date={resolvedFortune.date}
                isEn={activeIsEn}
                dimensions={dimensions}
                copied={copied}
                isAttachingNote={isAttachingNote}
                isRingingChime={isRingingChime}
                hasProject={projectId !== null}
                onLanguageChange={setSlipLang}
                onCopy={() => void handleCopySlipText()}
                onAttach={() => void handleAttachAsNote()}
                onRing={handleRingSingingBowl}
              />
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
