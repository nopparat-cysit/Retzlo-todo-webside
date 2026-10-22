"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Loader2
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
      <div role="dialog" aria-modal="true" aria-labelledby="zen-sanctuary-title" className={cn("fixed", gardenSkin.backdrop)}>
        <div ref={dialogRef} className={cn(gardenSkin.skin, gardenSkin.modalFrame)}>
          <header className={gardenSkin.modalHeader}>
            <div><p className={gardenSkin.eyebrow}>ZEN GARDEN / DAILY OMIKUJI</p><h2 id="zen-sanctuary-title" className={gardenSkin.title}>{isEn ? "A little guidance for today" : "คำทำนายของวันนี้"}<span aria-hidden="true">.</span></h2></div>
            <div className={gardenSkin.headerActions}>
              <button type="button" onClick={handleToggleSound} className={gardenSkin.iconButton} aria-label={activeZen.soundMuted ? (isEn ? "Unmute sounds" : "เปิดเสียง") : (isEn ? "Mute sounds" : "ปิดเสียง")}>{activeZen.soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
              <button type="button" onClick={onClose} ref={closeButtonRef} className={gardenSkin.iconButton} aria-label={isEn ? "Close garden" : "ปิดสวน"}><X size={19} /></button>
            </div>
          </header>
          <div className={gardenSkin.modalBody}>
            <div className={cn(gardenSkin.scene, gardenSkin.modalScene)}>
              <div className={gardenSkin.landscape} data-season={season} data-time={timeOfDay} aria-hidden="true" />
              <div className={gardenSkin.sceneShade} aria-hidden="true" />
              <div className={gardenSkin.sceneCopy}><span className={gardenSkin.sceneEyebrow}><span className={gardenSkin.liveDot} />{isEn ? "A MOMENT OF STILLNESS" : "ช่วงเวลาแห่งความสงบ"}</span><p>{isEn ? <>Grow gently.<br />Trust your own rhythm.</> : <>ค่อย ๆ เติบโต<br />ในจังหวะของคุณ</>}</p></div>
              <span className={gardenSkin.japaneseMark} aria-hidden="true">心の庭</span>
              <div className={gardenSkin.scenePlant}><ZenGuardianArt plantId={activeGuardian.id} stage={4} className="h-full w-full" /></div>
              <div className={gardenSkin.sceneBottom}><span><Flower2 size={13} />{isEn ? activeGuardian.name : activeGuardian.nameTh}</span><span>{activeGuardian.solfeggioFreq} Hz</span></div>
              {isWatering && <div className={gardenSkin.wateringOverlay}><ZenGameToolLadle className="h-12 w-12 animate-bounce" /></div>}
            </div>
            <div className={gardenSkin.modalMeta}><p>{isEn ? seasonLabels.en : seasonLabels.th}</p><span><Sparkles size={12} />{coins}c · {activeZen.nurtureStreak} {isEn ? "day streak" : "วันต่อเนื่อง"}</span></div>

            {!hasWateredToday ? (
              <div className={gardenSkin.readingIntro}>
                <span className={gardenSkin.introIcon}><Droplets size={22} /></span>
                <p className={gardenSkin.eyebrow}>{isEn ? "A SMALL RITUAL. A FRESH BEGINNING." : "รดน้ำให้สวน เติมความสงบให้ใจ"}</p>
                <h3>{isEn ? "Let today's fortune unfold" : "เปิดรับคำทำนายของวันนี้"}</h3>
                <p className={gardenSkin.description}>{isEn ? "Care for your garden and receive a thought to carry into your day. A little guidance, a lucky focus, and 5 serenity coins." : "ดูแลสวนสักนิด แล้วรับคำทำนาย แนวทางสำหรับวันนี้ และสิ่งนำโชค พร้อมเหรียญแห่งสติ 5 เหรียญ"}</p>
                <button type="button" onClick={() => setIsWaterConfirmOpen(true)} disabled={isWatering} className={gardenSkin.primaryButton}><span>{isWatering ? <Loader2 size={17} className={gardenSkin.spin} /> : <Droplets size={17} />}{isWatering ? (isEn ? "Saving your ritual…" : "กำลังบันทึกกิจวัตร…") : (isEn ? "Water the garden · +5 coins" : "รดน้ำสวนวันนี้ · +5 เหรียญ")}</span><ArrowUpRight size={17} /></button>
              </div>
            ) : currentFortune ? (
              <div className={gardenSkin.readingWrap}>
                <ZenOmikujiScroll grade={currentFortune.grade} surfaceClassName={gardenSkin.scrollSurface} className={gardenSkin.scroll}>
                  <article className={gardenSkin.reading}>
                    <header className={gardenSkin.readingHeader}><span className={gardenSkin.readingEyebrow}>おみくじ / DAILY FORTUNE</span><div className={gardenSkin.readingGrade}><span>{currentFortune.grade === "daikichi" ? "大吉" : currentFortune.grade === "chukichi" ? "中吉" : currentFortune.grade === "kichi" ? "吉" : currentFortune.grade === "shokichi" ? "小吉" : "末吉"}</span><h3>{isEn ? currentFortune.gradeNameEn : currentFortune.gradeName}</h3></div><p>{currentFortune.date}</p></header>
                    <p className={gardenSkin.readingVerse}>“{isEn ? currentFortune.verse : currentFortune.verseTh}”</p>
                    <section className={gardenSkin.readingSection}><h4><ScrollText size={14} />{isEn ? "Your reading" : "คำทำนายแห่งสติ"}</h4><p>{isEn ? currentFortune.oracle : currentFortune.oracleTh}</p></section>
                    <section className={cn(gardenSkin.readingSection, gardenSkin.readingGuidance)}><h4><Leaf size={14} />{isEn ? "A direction for today" : "แนวทางสำหรับวันนี้"}</h4><p>{isEn ? currentFortune.workGuidance : currentFortune.workGuidanceTh}</p></section>
                    <section className={gardenSkin.luckyItem}><span><Sparkles size={14} />{isEn ? "Your lucky focus" : "สิ่งนำโชคประจำวัน"}</span><strong>{isEn ? currentFortune.luckyFocus : currentFortune.luckyFocusTh}</strong></section>
                  </article>
                </ZenOmikujiScroll>
                <div className={gardenSkin.readingFooter}><span><Check size={14} />{isEn ? "Your garden is cared for today" : "วันนี้ดูแลสวนเรียบร้อยแล้ว"}</span><button type="button" onClick={handleRingSingingBowl} disabled={isRingingChime} className={gardenSkin.textButton}><BellRing size={15} />{isEn ? "A moment of calm" : "ฟังเสียงระฆังพักใจ"}</button></div>
              </div>
            ) : <p className={gardenSkin.description}>{isEn ? "Your garden is cared for today. A new fortune awaits with tomorrow's ritual." : "วันนี้ดูแลสวนเรียบร้อยแล้ว กลับมารับคำทำนายใหม่ในกิจวัตรวันพรุ่งนี้"}</p>}
          </div>
        </div>
      </div>
      <ConfirmModal open={isWaterConfirmOpen} layer="above-modal" title={isEn ? "Water the garden today?" : "รดน้ำสวนวันนี้ไหม?"}
        message={isEn ? "This daily ritual reveals your Omikuji fortune and adds 5 serenity coins." : "กิจวัตรนี้จะเปิดคำทำนายประจำวันและเพิ่มเหรียญแห่งสติ 5 เหรียญ"}
        confirmLabel={isEn ? "Water today" : "รดน้ำวันนี้"} cancelLabel={isEn ? "Cancel" : "ยกเลิก"} loadingLabel={isEn ? "Saving…" : "กำลังบันทึก…"} isLoading={isWatering} onConfirm={() => void handleDailyWater()} onClose={() => setIsWaterConfirmOpen(false)} />
    </ModalPortal>
  );
}
