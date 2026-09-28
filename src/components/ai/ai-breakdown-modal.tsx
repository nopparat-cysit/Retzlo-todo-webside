"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Coins, Loader2, Sparkles, X, Zap } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { playCardCreateSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export interface AiBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  cardTitle: string;
  cardDescription?: string | null;
  onApply: (params: {
    items: string[];
    mode: "append" | "replace";
    suggestedDifficulty?: 1 | 3 | 5 | 8;
    suggestedPriority?: "LOW" | "MEDIUM" | "HIGH";
  }) => void;
}

export function AiBreakdownModal({
  open,
  onClose,
  cardTitle,
  cardDescription,
  onApply
}: AiBreakdownModalProps) {
  const { toast } = useToast();

  const [customGoal, setCustomGoal] = useState("");
  const [depth, setDepth] = useState<"standard" | "detailed">("detailed");
  const [insertMode, setInsertMode] = useState<"append" | "replace">("append");
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [tier, setTier] = useState<string>("FREE");

  // Fetch user's current AI credits
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function fetchCredits() {
      try {
        const res = await fetch("/api/ai/credits");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.quota) {
            setCredits(data.quota.credits);
            setTier(data.quota.tier);
          }
        }
      } catch {
        // Silent quota load error
      }
    }

    fetchCredits();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleGenerate = async () => {
    if (!cardTitle.trim()) {
      toast({
        message: "กรุณาระบุชื่องานก่อนแตกเช็กลิสต์",
        type: "error"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cardTitle.trim(),
          description: cardDescription || null,
          customGoal: customGoal.trim() || null,
          depth
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          message: data.error || "เกิดข้อผิดพลาดในการเรียกใช้ AI Assistant",
          type: "error"
        });
        return;
      }

      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        playCardCreateSound();
        onApply({
          items: data.items,
          mode: insertMode,
          suggestedDifficulty: data.suggestedDifficulty,
          suggestedPriority: data.suggestedPriority
        });

        toast({
          message: `✨ AI แตกงานสำเร็จ (${data.items.length} ข้อย่อย) — หัก 1 เครดิต (คงเหลือ ${data.remainingCredits ?? ""})`,
          type: "success"
        });

        onClose();
      } else {
        toast({
          message: "ไม่พบผลลัพธ์ขั้นตอนจาก AI กรุณาลองใหม่อีกครั้ง",
          type: "error"
        });
      }
    } catch {
      toast({
        message: "ไม่สามารถเชื่อมต่อกับ AI Server ได้ กรุณาลองใหม่",
        type: "error"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      labelledBy="ai-breakdown-title"
      contentClassName="lofi-panel flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-dusk-lavender/30 shadow-2xl"
    >
      <div className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-dusk-lavender/40 bg-dusk-lavender/15 text-dusk-lavender shadow-xs">
              <Sparkles className="h-5 w-5 animate-pulse text-dusk-amber" />
            </div>
            <div>
              <h2
                id="ai-breakdown-title"
                className="text-base sm:text-lg font-bold tracking-tight text-stone-100 flex items-center gap-2"
              >
                <span>🐱 AI Auto-Breakdown Task</span>
              </h2>
              <p className="text-xs text-stone-400">
                แตกการ์ดออกเป็นเช็กลิสต์ย่อยให้เสร็จใน 3 วินาที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {credits !== null && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-mono font-medium text-amber-300"
                title={`โควตา AI Credits (${tier} Tier)`}
              >
                <Coins className="h-3 w-3" />
                <span>{credits} cr</span>
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 text-sm">
          {/* Card Title Preview */}
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              เป้าหมายของงาน (Task Title)
            </span>
            <p className="font-medium text-stone-200 break-words line-clamp-2">
              {cardTitle || "ยังไม่ได้ระบุชื่องาน"}
            </p>
          </div>

          {/* Optional Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
              <span>พิมพ์เป้าหมายสั้นๆ 1 ประโยค หรือจุดที่ต้องการเน้น (ไม่บังคับ)</span>
              <span className="text-[11px] text-stone-500">Optional</span>
            </label>
            <Input
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="เช่น สูตรพริกแห้งเข้มข้น ไม่ใส่ผักอื่น, หรือ เน้นเขียน Test ด้วย..."
              disabled={isGenerating}
              className="text-xs"
            />
          </div>

          {/* Depth Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300">
              ความละเอียดของขั้นตอน (Breakdown Depth)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setDepth("standard")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition cursor-pointer",
                  depth === "standard"
                    ? "border-dusk-lavender bg-dusk-lavender/20 text-dusk-lavender font-semibold shadow-xs"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-200"
                )}
              >
                <Zap className="h-3.5 w-3.5 text-dusk-amber" />
                <span>⚡ รวบรัด (5–6 ข้อ)</span>
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setDepth("detailed")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition cursor-pointer",
                  depth === "detailed"
                    ? "border-dusk-lavender bg-dusk-lavender/20 text-dusk-lavender font-semibold shadow-xs"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-200"
                )}
              >
                <CheckSquare className="h-3.5 w-3.5 text-dusk-cyan" />
                <span>🎯 ละเอียดยิบ (8–10 ข้อ)</span>
              </button>
            </div>
          </div>

          {/* Insert Mode Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300">
              การนำไปใส่ในเช็กลิสต์ของการ์ด
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setInsertMode("append")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs transition cursor-pointer",
                  insertMode === "append"
                    ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300 font-semibold"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:text-stone-200"
                )}
              >
                <span>➕ เพิ่มต่อท้าย (Append)</span>
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setInsertMode("replace")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs transition cursor-pointer",
                  insertMode === "replace"
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-300 font-semibold"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:text-stone-200"
                )}
              >
                <span>🔄 แทนที่เดิม (Replace)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>ใช้ 1 เครดิตต่อครั้ง</span>
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isGenerating}
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isGenerating || !cardTitle.trim()}
              onClick={handleGenerate}
              className="gap-1.5 bg-dusk-lavender text-ink-950 hover:bg-dusk-lavender/90 font-semibold shadow-md transition-transform hover:scale-102 active:scale-98"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังคิดขั้นตอน...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-700" />
                  <span>เริ่มแตกงานด้วย AI</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
