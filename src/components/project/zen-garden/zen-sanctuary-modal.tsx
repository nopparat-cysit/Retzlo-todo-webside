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
  ZenOmikujiScroll,
  OmikujiWaxSeal
} from "./zen-vector-art";
import {
  playZenWaterDrop,
  playZenSingingBowlHarmonic
} from "@/lib/sound";
import { getRankVisual, getFortuneByNumber } from "@/lib/omikuji/omikuji-data";


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
  const rankVisual = resolvedFortune ? getRankVisual(resolvedFortune.rankRomaji) : null;
  const sealColor = rankVisual?.sealColor || "#b91c1c";

  const dimensions = resolvedFortune
    ? [
        {
          id: "career",
          kanji: "仕事 · 功績",
          enLabel: "Career & Purpose",
          thLabel: "การงานและวิชาชีพ",
          content: activeIsEn ? resolvedFortune.careerEn : resolvedFortune.careerTh,
          icon: Briefcase,
          accentBorder: "border-[#c7d2fe]/80 dark:border-[#3730a3]/50",
          accentBg: "bg-[#f5f7ff]/90 dark:bg-[#1a1c35]/40",
          headerColor: "text-[#3730a3] dark:text-[#a5b4fc]",
          badgeBg: "bg-[#e0e7ff] dark:bg-[#312e81]/60 text-[#3730a3] dark:text-[#c7d2fe]",
          iconColor: "text-[#4338ca] dark:text-[#818cf8]"
        },
        {
          id: "finance",
          kanji: "金運 · 蓄財",
          enLabel: "Finance & Wealth",
          thLabel: "การเงินและโชคลาภ",
          content: activeIsEn ? resolvedFortune.financeEn : resolvedFortune.financeTh,
          icon: Coins,
          accentBorder: "border-[#fde68a]/80 dark:border-[#b45309]/50",
          accentBg: "bg-[#fffbeb]/90 dark:bg-[#352711]/40",
          headerColor: "text-[#b45309] dark:text-[#fcd34d]",
          badgeBg: "bg-[#fef3c7] dark:bg-[#78350f]/60 text-[#92400e] dark:text-[#fde68a]",
          iconColor: "text-[#d97706] dark:text-[#fbbf24]"
        },
        {
          id: "love",
          kanji: "対人 · 縁結び",
          enLabel: "Love & Harmony",
          thLabel: "ความสัมพันธ์และความรัก",
          content: activeIsEn ? resolvedFortune.loveEn : resolvedFortune.loveTh,
          icon: Heart,
          accentBorder: "border-[#fbcfe8]/80 dark:border-[#9d174d]/50",
          accentBg: "bg-[#fff1f2]/90 dark:bg-[#371321]/40",
          headerColor: "text-[#be185d] dark:text-[#f472b6]",
          badgeBg: "bg-[#ffe4e6] dark:bg-[#831843]/60 text-[#9f1239] dark:text-[#fbcfe8]",
          iconColor: "text-[#e11d48] dark:text-[#fb7185]"
        },
        {
          id: "health",
          kanji: "息災 · 養生",
          enLabel: "Health & Vitality",
          thLabel: "สุขภาพและความผาสุก",
          content: activeIsEn ? resolvedFortune.healthEn : resolvedFortune.healthTh,
          icon: Activity,
          accentBorder: "border-[#a7f3d0]/80 dark:border-[#065f46]/50",
          accentBg: "bg-[#f0fdf4]/90 dark:bg-[#0c2e21]/40",
          headerColor: "text-[#047857] dark:text-[#6ee7b7]",
          badgeBg: "bg-[#d1fae5] dark:bg-[#064e3b]/60 text-[#065f46] dark:text-[#a7f3d0]",
          iconColor: "text-[#059669] dark:text-[#34d399]"
        },
        {
          id: "growth",
          kanji: "研鑽 · 大成",
          enLabel: "Personal Growth & Mastery",
          thLabel: "การบ่มเพาะปัญญาและการเติบโต",
          content: activeIsEn ? resolvedFortune.growthEn : resolvedFortune.growthTh,
          icon: Sprout,
          fullWidth: true,
          accentBorder: "border-[#99f6e4]/80 dark:border-[#115e59]/50",
          accentBg: "bg-[#f0fdfa]/90 dark:bg-[#0c2f2b]/40",
          headerColor: "text-[#0f766e] dark:text-[#5eead4]",
          badgeBg: "bg-[#ccfbf1] dark:bg-[#134e4a]/60 text-[#115e59] dark:text-[#99f6e4]",
          iconColor: "text-[#0d9488] dark:text-[#2dd4bf]"
        }
      ]
    : [];

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
            ) : currentFortune && resolvedFortune ? (
              <div className={gardenSkin.readingWrap}>
                <ZenOmikujiScroll
                  grade={currentFortune.grade}
                  surfaceClassName={gardenSkin.scrollSurface}
                  className={gardenSkin.scroll}
                >
                  <article className={gardenSkin.reading}>
                    {/* Temple Lot Sub-Header & In-Place Language Switcher */}
                    <div className="flex items-center justify-between w-full border-b border-[#e5dcce] dark:border-[#3a3045] pb-2.5 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-serif tracking-[0.2em] text-[#856b4d] dark:text-[#c4b397] font-semibold">
                          浅草寺 観音百番神籤
                        </span>
                        <span className="text-[9.5px] text-[#a8957c] dark:text-[#8e7e9a] font-mono tracking-wider">
                          · ASAKUSA 100 LOTS
                        </span>
                      </div>

                      {/* Discrete Language Switcher */}
                      <div className="flex items-center bg-[#f0e7d5] dark:bg-[#282133] p-0.5 rounded-md border border-[#d8cbb5] dark:border-[#423752]">
                        <button
                          type="button"
                          onClick={() => setSlipLang("th")}
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
                            !activeIsEn
                              ? "bg-[#fffefc] dark:bg-[#3b324a] text-[#2c2214] dark:text-[#f3efe6] shadow-xs font-semibold"
                              : "text-[#7a6a54] dark:text-[#a595b4] hover:text-[#3e3427]"
                          )}
                          aria-label="แสดงภาษาไทย"
                        >
                          ไทย
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlipLang("en")}
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
                            activeIsEn
                              ? "bg-[#fffefc] dark:bg-[#3b324a] text-[#2c2214] dark:text-[#f3efe6] shadow-xs font-semibold"
                              : "text-[#7a6a54] dark:text-[#a595b4] hover:text-[#3e3427]"
                          )}
                          aria-label="Show English"
                        >
                          EN
                        </button>
                      </div>
                    </div>

                    {/* Main Fortune Header with 3D Wax Seal */}
                    <div className="flex items-center gap-3.5 sm:gap-4 my-2">
                      <OmikujiWaxSeal
                        kanji={resolvedFortune.rankJp}
                        romaji={resolvedFortune.rankRomaji}
                        sealColor={sealColor}
                      />

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#2f3d2f] dark:text-[#eae6dc] tracking-wide">
                            第 {toKanjiNumber(resolvedFortune.num)} 番
                          </h3>
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wider uppercase border shadow-xs",
                              rankVisual?.badgeClass || "bg-amber-50 text-amber-800 border-amber-200"
                            )}
                          >
                            {resolvedFortune.rankJp} · {activeIsEn ? resolvedFortune.rankEn : resolvedFortune.rankTh}
                          </span>
                        </div>

                        <p className="text-xs sm:text-[13px] font-medium text-[#73583c] dark:text-[#c4b397] mt-1 truncate">
                          {activeIsEn ? resolvedFortune.titleEn : resolvedFortune.titleTh}
                        </p>

                        <p className="text-[9.5px] text-[#93856d] dark:text-[#887b92] font-mono mt-0.5">
                          {resolvedFortune.date} · SACRED LOT #{resolvedFortune.num}
                        </p>
                      </div>
                    </div>

                    {/* Tanzaku Oracle Verse Slip */}
                    <div className="relative my-3.5 p-3.5 sm:p-4 rounded-xl border border-[#d8ccb5] dark:border-[#3d324c] bg-gradient-to-r from-[#fdfbf7] via-[#faf5e8] to-[#fdfbf7] dark:from-[#211b2d] dark:via-[#1c1626] dark:to-[#211b2d] shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] tracking-widest font-serif font-bold text-[#a14c38] dark:text-[#e57d66]">
                          『 観音金言 』
                        </span>
                        <span className="text-[8.5px] uppercase tracking-wider text-[#8a7b66] dark:text-[#9e8f7d] font-mono">
                          SACRED COUNSEL
                        </span>
                      </div>

                      <p className="font-serif text-sm sm:text-base text-[#273527] dark:text-[#eae6dd] leading-relaxed italic text-center px-2 py-0.5">
                        &ldquo;{activeIsEn ? resolvedFortune.verseEn : resolvedFortune.verseTh}&rdquo;
                      </p>
                    </div>

                    {/* 5 Guidance Dimensions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 my-3.5">
                      {dimensions.map((dim) => {
                        const IconComponent = dim.icon;
                        return (
                          <div
                            key={dim.id}
                            className={cn(
                              "rounded-xl border p-3 sm:p-3.5 shadow-xs transition-all",
                              dim.accentBorder,
                              dim.accentBg,
                              dim.fullWidth && "sm:col-span-2"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <IconComponent size={14} className={dim.iconColor} />
                                <span className={cn("text-xs font-semibold tracking-tight", dim.headerColor)}>
                                  {activeIsEn ? dim.enLabel : dim.thLabel}
                                </span>
                              </div>
                              <span className={cn("text-[9px] font-mono font-medium px-1.5 py-0.5 rounded", dim.badgeBg)}>
                                {dim.kanji}
                              </span>
                            </div>
                            <p className="text-xs sm:text-[12.5px] leading-relaxed text-[#2c372b] dark:text-[#dcd6ca] m-0">
                              {dim.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ornamental Divider */}
                    <div className="flex items-center justify-center gap-3 my-3.5">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#cebe9f] to-transparent dark:via-[#4c3e5c]" />
                      <span className="text-[9.5px] text-[#9c896e] dark:text-[#8d7c9e] tracking-widest font-mono select-none">
                        ❖ 観音百籤 ❖
                      </span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#cebe9f] to-transparent dark:via-[#4c3e5c]" />
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={handleCopySlipText}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c4b59b] dark:border-[#4b3f5c] bg-[#fffdfa] dark:bg-[#251f30] hover:bg-[#f6eee0] dark:hover:bg-[#2e263d] text-[#3e3427] dark:text-[#eae4d5] text-xs font-medium shadow-xs transition-all active:scale-[0.98]"
                      >
                        {copied ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
                        <span>{copied ? (activeIsEn ? "Copied" : "คัดลอกแล้ว") : (activeIsEn ? "Copy Slip Text" : "คัดลอกคำทำนาย")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAttachAsNote}
                        disabled={isAttachingNote}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#2b4432] bg-gradient-to-r from-[#2e4735] to-[#1f3325] hover:from-[#24392a] hover:to-[#17271c] text-[#fbfcf9] text-xs font-medium shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
                      >
                        {isAttachingNote ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                        <span>{isAttachingNote ? (activeIsEn ? "Saving Note…" : "กำลังบันทึก…") : (activeIsEn ? "Attach as Project Note" : "แนบเป็น Note ในโปรเจกต์")}</span>
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
