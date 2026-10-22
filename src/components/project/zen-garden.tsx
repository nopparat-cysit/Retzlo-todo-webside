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
  ScrollText,
  ArrowUpRight,
  ChevronRight,
  Check,
  Loader2
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
import { ZenGuardianArt } from "./zen-garden/zen-guardian-art";
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
    const x = e.detail === 0 ? rect.width / 2 : e.clientX - rect.left;
    const y = e.detail === 0 ? rect.height / 2 : e.clientY - rect.top;
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
    <section className={cn(gardenSkin.skin, gardenSkin.panel)} aria-label={isEn ? "Zen Garden" : "สวนแห่งสติ"}>
      <header className={gardenSkin.header}>
        <div>
          <p className={gardenSkin.eyebrow}>RETZLO / QUIET SPACE</p>
          <h2 className={gardenSkin.title}>{isEn ? "Zen Garden" : "สวนแห่งสติ"}<span aria-hidden="true">.</span></h2>
        </div>
        <div className={gardenSkin.headerActions}>
          <span className={gardenSkin.coinCount} title={isEn ? "Serenity coins" : "เหรียญแห่งสติ"}><Sparkles size={13} />{globalCoins}</span>
          <button type="button" onClick={toggleSound} className={gardenSkin.iconButton}
            aria-label={zenState.soundMuted ? (isEn ? "Unmute sound" : "เปิดเสียง") : (isEn ? "Mute sound" : "ปิดเสียง")}>
            {zenState.soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </header>

      <div className={gardenSkin.tabs} role="tablist" aria-label={isEn ? "Garden sections" : "ส่วนต่าง ๆ ของสวน"}>
        {([
          { id: "sanctuary", panel: "today", icon: Flower2, label: isEn ? "Today" : "วันนี้" },
          { id: "botanical", panel: "plants", icon: Leaf, label: isEn ? "Plants" : "พืช" },
          { id: "breath", panel: "breathe", icon: Wind, label: isEn ? "Rest" : "พักใจ" }
        ] as const).map((tab) => (
          <button key={tab.id} type="button" role="tab" id={`zen-tab-${tab.panel}`} aria-controls={`zen-panel-${tab.panel}`}
            aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)} className={cn(gardenSkin.tab, activeTab === tab.id && gardenSkin.tabActive)}
            onKeyDown={(event) => {
              const tabs: ActiveTab[] = ["sanctuary", "botanical", "breath"];
              const index = tabs.indexOf(activeTab);
              const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
              if (next < 0) return;
              event.preventDefault();
              setActiveTab(tabs[next]);
              (event.currentTarget.parentElement?.children[next] as HTMLButtonElement | undefined)?.focus();
            }}>
            <tab.icon size={15} /><span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={gardenSkin.panelBody}>
        {activeTab === "sanctuary" && (
          <div id="zen-panel-today" role="tabpanel" aria-labelledby="zen-tab-today" className={gardenSkin.today}>
            <button type="button" onClick={handleTerrariumClick} className={gardenSkin.scene}
              aria-label={isEn ? "Touch the garden for a water ripple and chime" : "แตะสวนเพื่อสร้างระลอกน้ำและฟังเสียงหยดน้ำ"}>
              <div className={gardenSkin.landscape} data-season={season} data-time={timeOfDay} aria-hidden="true" />
              <div className={gardenSkin.sceneShade} aria-hidden="true" />
              <div className={gardenSkin.sceneCopy}>
                <span className={gardenSkin.sceneEyebrow}><span className={gardenSkin.liveDot} />{isEn ? "YOUR LIVING SANCTUARY" : "พื้นที่สงบเล็ก ๆ ของคุณ"}</span>
                <p>{isEn ? <>A little pause.<br />A little peace.</> : <>พักสักนิด<br />ให้ใจได้เติบโต</>}</p>
              </div>
              <span className={gardenSkin.japaneseMark} aria-hidden="true">静けさ</span>
              <div className={gardenSkin.scenePlant}><ZenGuardianArt plantId={activeGuardian.id} stage={4} className="h-full w-full" /></div>
              {ripples.map((ripple) => <span key={ripple.id} className={gardenSkin.ripple} style={{ left: ripple.x, top: ripple.y }} />)}
              <div className={gardenSkin.sceneBottom}><span><Leaf size={12} />{isEn ? activeGuardian.name : activeGuardian.nameTh}</span><span>{activeGuardian.solfeggioFreq} Hz</span></div>
            </button>

            <div className={gardenSkin.ritual}>
              <div className={gardenSkin.ritualHeading}>
                <div><p className={gardenSkin.eyebrow}>{isEn ? "YOUR DAILY RITUAL" : "กิจวัตรเล็ก ๆ ในแต่ละวัน"}</p><h3>{isEn ? "A little care, each day" : "ดูแลสวนวันละนิด"}</h3></div>
                <span className={gardenSkin.status}><span className={gardenSkin.liveDot} />{canWater ? (isEn ? "Ready" : "พร้อมแล้ว") : (isEn ? "Complete" : "ดูแลแล้ว")}</span>
              </div>
              <p className={gardenSkin.description}>{canWater ? (isEn ? "Water your garden. Let today's fortune unfold." : "รดน้ำให้สวน แล้วเปิดรับคำทำนายสำหรับวันนี้") : (isEn ? "Your garden is nourished. Take your fortune with you." : "สวนได้รับการดูแลแล้ว อ่านคำทำนายก่อนเริ่มวันกัน")}</p>
              <button type="button" className={gardenSkin.primaryButton} disabled={isNourishing}
                onClick={() => canWater ? setIsWaterConfirmOpen(true) : handleOpenSanctuary()}>
                <span>{isNourishing ? <Loader2 size={17} className={gardenSkin.spin} /> : canWater ? <Droplets size={17} /> : <ScrollText size={17} />}
                  {isNourishing ? (isEn ? "Saving your ritual…" : "กำลังบันทึกกิจวัตร…") : canWater ? (isEn ? "Water the garden" : "รดน้ำสวนวันนี้") : (isEn ? "Read today's fortune" : "อ่านคำทำนายวันนี้")}</span>
                {canWater ? <span className={gardenSkin.reward}>+5 <Sparkles size={12} /></span> : <ArrowUpRight size={17} />}
              </button>
              <div className={gardenSkin.ritualMeta}><span><Flame size={12} />{isEn ? `${zenState.nurtureStreak} day streak` : `ดูแลต่อเนื่อง ${zenState.nurtureStreak} วัน`}</span><span>{isEn ? "One small act of kindness" : "ความใส่ใจเล็ก ๆ ให้ตัวเอง"}</span></div>
            </div>

            <div className={gardenSkin.guardianLine}>
              <div className={gardenSkin.guardianThumb}><ZenGuardianArt plantId={activeGuardian.id} stage={4} className="h-8 w-8" /></div>
              <div><span className={gardenSkin.smallLabel}>{isEn ? "YOUR GUARDIAN" : "ผู้พิทักษ์ของคุณ"}</span><p>{isEn ? activeGuardian.name : activeGuardian.nameTh}</p></div>
              <button type="button" className={gardenSkin.textButton} onClick={() => setActiveTab("botanical")}>{isEn ? "Change" : "เปลี่ยน"}<ChevronRight size={14} /></button>
            </div>

            {zenState.dailyFortune && !canWater && (
              <article className={gardenSkin.fortunePreview}>
                <div className={gardenSkin.row}><span className={gardenSkin.eyebrow}><ScrollText size={13} />{isEn ? "TODAY'S FORTUNE" : "คำทำนายประจำวัน"}</span><span className={gardenSkin.fortuneGrade}>{isEn ? zenState.dailyFortune.gradeNameEn : zenState.dailyFortune.gradeName}</span></div>
                <p className={gardenSkin.previewVerse}>“{isEn ? zenState.dailyFortune.verse : zenState.dailyFortune.verseTh}”</p>
                <button type="button" onClick={handleOpenSanctuary} className={gardenSkin.textButton}>{isEn ? "Explore your reading" : "เปิดอ่านคำทำนายฉบับเต็ม"}<ArrowUpRight size={14} /></button>
              </article>
            )}
          </div>
        )}

        {activeTab === "botanical" && (
          <div id="zen-panel-plants" role="tabpanel" aria-labelledby="zen-tab-plants" className={gardenSkin.collection}>
            <div className={gardenSkin.sectionHeading}><div><p className={gardenSkin.eyebrow}>{isEn ? "A LIVING COLLECTION" : "ค่อย ๆ ผลิบานไปด้วยกัน"}</p><h3>{isEn ? "Find your guardian" : "ผู้พิทักษ์ที่เป็นคุณ"}</h3></div><span className={gardenSkin.collectionCount}>{growth.unlockedCount}<small>/{growth.totalCount}</small></span></div>
            <div className={gardenSkin.progressTrack} role="progressbar" aria-label={isEn ? "Plant collection" : "คอลเลกชันพืช"} aria-valuenow={growth.unlockedCount} aria-valuemin={0} aria-valuemax={growth.totalCount}><div style={{ width: `${growth.percentage}%` }} /></div>
            <p className={gardenSkin.description}>{isEn ? "Collect coins through daily care to welcome new plants." : "สะสมเหรียญจากการดูแลสวน เพื่อต้อนรับพฤกษาต้นใหม่"}</p>
            <div className={gardenSkin.plantGrid}>
              {BOTANICAL_PLANTS.map((plant) => {
                const unlocked = globalCoins >= plant.cost;
                const selected = zenState.activeGuardianId === plant.id;
                return (
                  <article key={plant.id} className={cn(gardenSkin.plantCard, selected && gardenSkin.plantSelected, !unlocked && gardenSkin.plantLocked)}>
                    <div className={gardenSkin.plantArt}><ZenGuardianArt plantId={plant.id} stage={4} className="h-24 w-24" />{selected && <span className={gardenSkin.selectedMark}><Check size={12} /></span>}{!unlocked && <span className={gardenSkin.lockMark}><Lock size={12} /></span>}</div>
                    <h4>{isEn ? plant.name : plant.nameTh}</h4>
                    <p className={gardenSkin.plantTagline}>{isEn ? plant.tagline : plant.taglineTh}</p>
                    <div className={gardenSkin.plantCost}><Sparkles size={11} />{plant.cost} <span>{isEn ? "coins to unlock" : "เหรียญเพื่อปลดล็อก"}</span></div>
                    {selected ? <span className={gardenSkin.plantState}><Check size={12} />{isEn ? "Current guardian" : "ผู้พิทักษ์ปัจจุบัน"}</span>
                      : unlocked ? <button type="button" disabled={isSettingGuardian} className={gardenSkin.plantButton} onClick={() => setGuardianToConfirm(plant)} aria-label={isEn ? `Set ${plant.name} as guardian` : `ตั้ง${plant.nameTh}เป็นผู้พิทักษ์`}>{isEn ? "Set guardian" : "ตั้งผู้พิทักษ์"}<ChevronRight size={12} /></button>
                      : <span className={gardenSkin.plantState}><Lock size={11} />{isEn ? `${plant.cost - globalCoins} more coins` : `อีก ${plant.cost - globalCoins} เหรียญ`}</span>}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "breath" && (
          <div id="zen-panel-breathe" role="tabpanel" aria-labelledby="zen-tab-breathe" className={gardenSkin.breath}>
            <div className={gardenSkin.sectionHeading}><div><p className={gardenSkin.eyebrow}>{isEn ? "LESS RUSH. MORE ROOM." : "วางทุกอย่างไว้สักครู่"}</p><h3>{isEn ? "Come back to yourself" : "กลับมาหาลมหายใจ"}</h3></div><span className={gardenSkin.duration}>~1 {isEn ? "min" : "นาที"}</span></div>
            <div className={gardenSkin.breathStage}>
              <div className={gardenSkin.breathOrbit} /><div className={cn(gardenSkin.breathOrbit, gardenSkin.breathOrbitInner)} />
              <div className={gardenSkin.breathDisk} style={{ transform: `scale(${breathScale})` }}><ZenGuardianArt plantId="lotus" stage={4} className="h-20 w-20" /></div>
              <span className={gardenSkin.breathStageLabel}>{isEn ? "JUST BE HERE" : "อยู่กับปัจจุบัน"}</span>
            </div>
            <div className={gardenSkin.breathPrompt}><h4 aria-live="polite">{isBreathingActive ? (isEn ? breathPhase : breathPhaseTh) : (isEn ? "A slower, softer rhythm" : "ค่อย ๆ หายใจ ในจังหวะของคุณ")}</h4><p>{isBreathingActive ? `${isEn ? "Cycle" : "รอบที่"} ${breathCycle}/4 · ${breathProgress.toFixed(0)}%` : (isEn ? "Inhale · hold · exhale · rest" : "เข้า · กลั้น · ออก · พัก")}</p></div>
            <div className={gardenSkin.breathTiming}>{(isEn ? ["Inhale", "Hold", "Exhale", "Rest"] : ["หายใจเข้า", "กลั้น", "หายใจออก", "พัก"]).map((label, index) => <span key={index}><strong>04</strong>{label}</span>)}</div>
            <div className={gardenSkin.breathControls}>
              <button type="button" className={gardenSkin.primaryButton} onClick={() => setIsBreathingActive(!isBreathingActive)}><span>{isBreathingActive ? <Pause size={16} /> : <Play size={16} />}{isBreathingActive ? (isEn ? "Pause session" : "หยุดชั่วคราว") : (isEn ? "Take a mindful minute" : "เริ่มพักใจหนึ่งนาที")}</span><span>01:04</span></button>
              <button type="button" className={gardenSkin.resetButton} disabled={!isBreathingActive && breathSecond === 0 && breathCycle === 1} aria-label={isEn ? "Reset breathing session" : "รีเซ็ตการฝึกลมหายใจ"} onClick={() => { setIsBreathingActive(false); setBreathSecond(0); setBreathCycle(1); }}><RotateCcw size={17} /></button>
            </div>
          </div>
        )}
      </div>

      <footer className={gardenSkin.wisdom}><span aria-hidden="true">✧</span><p>{isEn ? todayWisdom.en : todayWisdom.th}</p></footer>
      <ConfirmModal open={isWaterConfirmOpen} title={isEn ? "Water the garden today?" : "รดน้ำสวนวันนี้ไหม?"}
        message={isEn ? "This daily ritual reveals your Omikuji fortune and adds 5 serenity coins." : "กิจวัตรนี้จะเปิดคำทำนายประจำวันและเพิ่มเหรียญแห่งสติ 5 เหรียญ"}
        confirmLabel={isEn ? "Water today" : "รดน้ำวันนี้"} cancelLabel={isEn ? "Cancel" : "ยกเลิก"} loadingLabel={isEn ? "Saving…" : "กำลังบันทึก…"} isLoading={isNourishing} onConfirm={() => void handleNurture()} onClose={() => setIsWaterConfirmOpen(false)} />
      <ConfirmModal open={guardianToConfirm !== null} title={isEn ? "Change garden guardian?" : "เปลี่ยนผู้พิทักษ์สวนไหม?"}
        message={guardianToConfirm ? (isEn ? `Set ${guardianToConfirm.name} as your active guardian?` : `ตั้ง${guardianToConfirm.nameTh}เป็นผู้พิทักษ์หลักไหม?`) : ""}
        confirmLabel={isEn ? "Set guardian" : "ตั้งผู้พิทักษ์"} cancelLabel={isEn ? "Cancel" : "ยกเลิก"} loadingLabel={isEn ? "Changing…" : "กำลังเปลี่ยน…"} isLoading={isSettingGuardian} onConfirm={() => guardianToConfirm && void handleSelectGuardian(guardianToConfirm)} onClose={() => setGuardianToConfirm(null)} />
      {!onOpenSanctuary && <ZenSanctuaryModal isOpen={isSanctuaryModalOpen} onClose={() => setIsSanctuaryModalOpen(false)} zenState={zenState} globalCoins={globalCoins} onRefreshData={fetchZenData} />}
    </section>
  );
}
