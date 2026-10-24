"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Copy,
  Check,
  FileText,
  RotateCcw,
  Languages,
  Calendar,
  Compass,
  Briefcase,
  Coins,
  Heart,
  Activity,
  Sprout
} from "lucide-react";
import { ModalPortal } from "@/components/ui/modal-portal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useOmikujiSettings, getActiveFortunes } from "@/lib/omikuji/omikuji-settings";
import { getRankVisual, getDailyFortune, getRandomFortune } from "@/lib/omikuji/omikuji-data";
import { OmikujiFortuneItem } from "@/types/omikuji";
import { cn } from "@/lib/utils";

interface OmikujiModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string | null;
}

type ModalStep = "shaker" | "slip";

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

export function OmikujiModal({ open, onClose, projectId }: OmikujiModalProps) {
  const { settings } = useOmikujiSettings();
  const { showToast } = useToast();

  const [step, setStep] = useState<ModalStep>("shaker");
  const [isShaking, setIsShaking] = useState(false);
  const [fortune, setFortune] = useState<OmikujiFortuneItem | null>(null);
  const [stickNumber, setStickNumber] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"th" | "en">("th");

  // Determine language on open
  useEffect(() => {
    if (settings.languageMode === "en") {
      setActiveLanguage("en");
    } else {
      setActiveLanguage("th");
    }
  }, [settings.languageMode]);

  // Handle daily or reset state on open
  useEffect(() => {
    if (open) {
      setCopied(false);
      setIsShaking(false);
      if (settings.drawMode === "daily") {
        // Daily deterministic draw
        const daily = getDailyFortune(projectId || "global");
        setFortune(daily);
        setStickNumber(daily.number);
      } else {
        // Unlimited mode: start at shaker step
        setStep("shaker");
        setFortune(null);
        setStickNumber(null);
      }
    }
  }, [open, settings.drawMode, projectId]);

  if (!open) return null;

  const handleStartShake = () => {
    if (isShaking) return;
    setIsShaking(true);

    const activeList = getActiveFortunes();
    let picked: OmikujiFortuneItem;
    if (settings.drawMode === "daily") {
      picked = getDailyFortune(projectId || "global");
    } else {
      const idx = Math.floor(Math.random() * activeList.length);
      picked = activeList[idx];
    }

    setStickNumber(picked.number);
    setFortune(picked);

    // Shaking animation duration
    setTimeout(() => {
      setIsShaking(false);
      setStep("slip");
    }, 1400);
  };

  const currentRankMeta = fortune ? getRankVisual(fortune.rank_romaji) : null;

  const handleCopyText = async () => {
    if (!fortune) return;
    const isEn = activeLanguage === "en";
    const title = isEn ? fortune.title_en : fortune.title_th;
    const rank = isEn ? fortune.rank_en : fortune.rank_th;
    const theme = isEn ? fortune.central_theme_en : fortune.central_theme_th;
    const career = isEn ? fortune.career_work_en : fortune.career_work_th;
    const finance = isEn ? fortune.finance_wealth_en : fortune.finance_wealth_th;
    const love = isEn ? fortune.love_relationships_en : fortune.love_relationships_th;
    const health = isEn ? fortune.health_wellness_en : fortune.health_wellness_th;
    const growth = isEn ? fortune.personal_growth_en : fortune.personal_growth_th;

    const textToCopy = `══════════════════════════════════
Sensoji Asakusa Kannon Omikuji (No. ${fortune.number})
Rank: ${fortune.rank_jp} (${fortune.rank_romaji} - ${rank})
Title: ${title}
══════════════════════════════════
• Wisdom: ${theme}

[1] Career & Craft: ${career}
[2] Finance & Wealth: ${finance}
[3] Love & Relationships: ${love}
[4] Health & Wellness: ${health}
[5] Personal Growth: ${growth}
══════════════════════════════════`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({
        title: "คัดลอกคำทำนายเรียบร้อย",
        description: `ใบที่ ${fortune.number} (${fortune.rank_jp}) ถูกคัดลอกลงคลิปบอร์ดแล้ว`,
        variant: "success"
      });
    } catch {
      showToast({
        title: "เกิดข้อผิดพลาดในการคัดลอก",
        variant: "error"
      });
    }
  };

  const handleAttachAsNote = async () => {
    if (!fortune) return;
    setIsSavingNote(true);

    const isEn = activeLanguage === "en";
    const title = `[Omikuji #${fortune.number}] ${fortune.rank_jp} - ${isEn ? fortune.title_en : fortune.title_th}`;
    const rank = isEn ? fortune.rank_en : fortune.rank_th;
    const theme = isEn ? fortune.central_theme_en : fortune.central_theme_th;
    const career = isEn ? fortune.career_work_en : fortune.career_work_th;
    const finance = isEn ? fortune.finance_wealth_en : fortune.finance_wealth_th;
    const love = isEn ? fortune.love_relationships_en : fortune.love_relationships_th;
    const health = isEn ? fortune.health_wellness_en : fortune.health_wellness_th;
    const growth = isEn ? fortune.personal_growth_en : fortune.personal_growth_th;

    const content = `> **${fortune.rank_jp} · ${fortune.rank_romaji} (${rank})**
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
*Drawn from Retzlo Omikuji Desk on ${new Date().toLocaleDateString("th-TH")}*`;

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
          showToast({
            title: "แนบเป็น Note ในโปรเจกต์สำเร็จ",
            description: `บันทึก "${title}" ลงในบันทึกของโปรเจกต์แล้ว`,
            variant: "success"
          });
          setIsSavingNote(false);
          return;
        }
      } catch (err) {
        console.error("Note save failed:", err);
      }
    }

    // Fallback: Copy as markdown note
    try {
      await navigator.clipboard.writeText(`# ${title}\n\n${content}`);
      showToast({
        title: "คัดลอกรูปแบบ Note แล้ว",
        description: "คัดลอกเนื้อหา Markdown พร้อมนำไปวางใน Note Studio ได้ทันที",
        variant: "success"
      });
    } catch {
      showToast({
        title: "ไม่สามารถบันทึกได้",
        variant: "error"
      });
    }
    setIsSavingNote(false);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div
          className={cn(
            "relative w-full max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-300",
            step === "shaker" ? "max-w-md bg-stone-900 border border-stone-800 p-8 text-stone-100" : "max-w-2xl bg-[#faf7f2] dark:bg-[#15171e] text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-800 p-6 sm:p-8"
          )}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
          >
            <X className="h-4 w-4" />
          </button>

          {/* STEP 1: Wooden Shaker View */}
          {step === "shaker" && (
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 mb-6">
                <Compass className="h-3.5 w-3.5" />
                <span>Asakusa Kannon Sacred Shaker</span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-amber-100 mb-1">
                กระบอกเซียมซีร้อยใบวัดอาซากุสะ
              </h2>
              <p className="text-xs text-stone-400 max-w-xs mb-8">
                ตั้งจิตให้นิ่ง นึกถึงเป้าหมายหรือคำถามในใจ แล้วเขย่ากระบอกไม้เพื่อรับคำชี้แนะ 5 มิติ
              </p>

              {/* Cylindrical Wooden Shaker Graphic */}
              <div
                onClick={handleStartShake}
                className={cn(
                  "relative cursor-pointer transition-transform select-none mb-8",
                  isShaking && "animate-omikuji-shake"
                )}
                style={{
                  perspective: "600px"
                }}
              >
                {/* Bamboo stick emerging out of shaker */}
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 w-4 bg-[#e6c280] border border-[#a88241] rounded-t-sm shadow-md transition-all duration-700 ease-out flex flex-col items-center justify-center text-[8px] font-mono font-bold text-amber-950 py-1",
                    isShaking ? "-top-16 opacity-100 z-0 h-24" : "-top-4 opacity-0 h-10"
                  )}
                >
                  <span className="writing-vertical">
                    {stickNumber ? `第${stickNumber}番` : "籤"}
                  </span>
                </div>

                {/* Wooden Shaker Cylinder */}
                <div className="relative z-10 w-28 h-56 rounded-2xl bg-gradient-to-r from-[#452718] via-[#784323] to-[#452718] border-2 border-[#8c532b] shadow-2xl flex flex-col items-center justify-between p-3 overflow-hidden">
                  {/* Brass top rim */}
                  <div className="w-full h-4 rounded-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-1.5 bg-[#26140b] rounded-full" />
                  </div>

                  {/* Embossed Kanji Calligraphy */}
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <span className="text-xs tracking-widest text-amber-400/80 font-serif">
                      浅草
                    </span>
                    <span className="text-xl font-bold tracking-widest text-amber-200/90 font-serif [writing-mode:vertical-rl]">
                      御神籤
                    </span>
                    <span className="text-[10px] tracking-wider text-amber-400/70 font-mono">
                      百番
                    </span>
                  </div>

                  {/* Brass bottom base */}
                  <div className="w-full h-4 rounded-full bg-gradient-to-r from-amber-800 via-amber-500 to-amber-800 border border-amber-400 shadow-inner" />
                </div>
              </div>

              {/* Shake Action Button */}
              <Button
                size="lg"
                onClick={handleStartShake}
                disabled={isShaking}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold shadow-lg"
              >
                {isShaking ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin text-stone-950" />
                    กำลังเขย่ากระบอกเซียมซี...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-stone-950" />
                    เขย่ากระบอกเซียมซี (Shake Shaker)
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* STEP 2: Editorial Slip View */}
          {step === "slip" && fortune && (
            <div className="flex flex-col">
              {/* Slip Top Controls */}
              <div className="flex items-center justify-between border-b border-stone-300/80 dark:border-stone-800 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-mono">
                    Sensoji Omikuji · No. {fortune.number}
                  </span>
                  {settings.drawMode === "daily" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <Calendar className="h-2.5 w-2.5" />
                      Daily Draw
                    </span>
                  )}
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-stone-800/80 p-0.5 rounded-lg mr-8">
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("th")}
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-medium rounded-md transition",
                      activeLanguage === "th"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                        : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                    )}
                  >
                    TH
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("en")}
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-medium rounded-md transition",
                      activeLanguage === "en"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs"
                        : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                    )}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* The Newspaper Editorial Slip Content */}
              <div className="relative rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 p-5 sm:p-7 shadow-sm">
                {/* Decorative Japanese Header */}
                <div className="text-center pb-4 border-b border-stone-200 dark:border-stone-800">
                  <p className="text-[10px] tracking-widest text-stone-500 dark:text-stone-400 uppercase font-serif">
                    浅草観音百番おみくじ
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 font-serif mt-1">
                    第 {toKanjiNumber(fortune.number)} 番
                  </h3>
                  <p className="text-xs font-mono text-stone-400 mt-0.5">
                    SLIP NUMBER #{fortune.number}
                  </p>
                </div>

                {/* Wax Seal Stamp & Fortunate Rank */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-4">
                    {/* Wax Seal */}
                    <div
                      className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg border-2 border-amber-300/40 select-none"
                      style={{
                        backgroundColor: currentRankMeta?.sealColor || "#b91c1c",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3)"
                      }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white drop-shadow-sm font-serif leading-none">
                          {fortune.rank_jp}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-amber-200/90 font-mono mt-0.5">
                          {fortune.rank_romaji}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", currentRankMeta?.textColor)}>
                          {activeLanguage === "en" ? fortune.rank_en : fortune.rank_th}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">
                          ({fortune.rank_romaji})
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif mt-0.5">
                        {activeLanguage === "en" ? fortune.title_en : fortune.title_th}
                      </h4>
                    </div>
                  </div>

                  {/* Central theme quote */}
                  <div className="sm:max-w-xs text-center sm:text-right">
                    <p className="text-xs italic text-stone-600 dark:text-stone-300 leading-relaxed bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                      &ldquo;{activeLanguage === "en" ? fortune.central_theme_en : fortune.central_theme_th}&rdquo;
                    </p>
                  </div>
                </div>

                {/* 5 Guidance Dimensions */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* 1. Career & Work */}
                  <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{activeLanguage === "en" ? "Career & Craft" : "การงานและการสร้างสรรค์"}</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {activeLanguage === "en" ? fortune.career_work_en : fortune.career_work_th}
                    </p>
                  </div>

                  {/* 2. Finance & Wealth */}
                  <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                      <Coins className="h-3.5 w-3.5" />
                      <span>{activeLanguage === "en" ? "Finance & Wealth" : "การเงินและโชคลาภ"}</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {activeLanguage === "en" ? fortune.finance_wealth_en : fortune.finance_wealth_th}
                    </p>
                  </div>

                  {/* 3. Love & Relationships */}
                  <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{activeLanguage === "en" ? "Love & Relationships" : "ความสัมพันธ์และความรัก"}</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {activeLanguage === "en" ? fortune.love_relationships_en : fortune.love_relationships_th}
                    </p>
                  </div>

                  {/* 4. Health & Wellness */}
                  <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      <Activity className="h-3.5 w-3.5" />
                      <span>{activeLanguage === "en" ? "Health & Wellness" : "สุขภาพและความเป็นอยู่"}</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {activeLanguage === "en" ? fortune.health_wellness_en : fortune.health_wellness_th}
                    </p>
                  </div>

                  {/* 5. Personal Growth (Full Width on 2-col) */}
                  <div className="sm:col-span-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 mb-1">
                      <Sprout className="h-3.5 w-3.5" />
                      <span>{activeLanguage === "en" ? "Personal Growth" : "การเติบโตและการพัฒนาตนเอง"}</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {activeLanguage === "en" ? fortune.personal_growth_en : fortune.personal_growth_th}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {settings.drawMode === "unlimited" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep("shaker")}
                      className="text-xs gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>เขย่าใหม่อีกครั้ง (Draw Again)</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyText}
                    className="text-xs gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>คัดลอกข้อความ</span>
                      </>
                    )}
                  </Button>

                  {/* Attach as Note Button */}
                  <Button
                    size="sm"
                    onClick={handleAttachAsNote}
                    disabled={isSavingNote}
                    className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>แนบเป็น Note ในโปรเจกต์</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
