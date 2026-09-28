"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckSquare,
  Coins,
  Layers,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
  Zap
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { playCardCreateSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { getAiAuthHeaders } from "@/lib/ai/client-key";

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

interface GeneratedItem {
  id: string;
  label: string;
  selected: boolean;
}

const STEP_COUNT_PRESETS = [
  { count: 3, label: "3 ข้อ", subtitle: "รวบรัด / ด่วน", icon: Zap },
  { count: 5, label: "5 ข้อ", subtitle: "มาตรฐาน (แนะนำ)", isRecommended: true, icon: Sparkles },
  { count: 8, label: "8 ข้อ", subtitle: "ละเอียด ชัดเจน", icon: CheckSquare },
  { count: 10, label: "10 ข้อ", subtitle: "ครอบคลุมครบถ้วน", icon: Layers }
];

export function AiBreakdownModal({
  open,
  onClose,
  cardTitle,
  cardDescription,
  onApply
}: AiBreakdownModalProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<"configure" | "preview">("configure");
  const [itemCount, setItemCount] = useState<number>(5);
  const [customGoal, setCustomGoal] = useState("");
  const [insertMode, setInsertMode] = useState<"append" | "replace">("append");
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [tier, setTier] = useState<string>("FREE");

  // Generated checklist state for preview step
  const [previewItems, setPreviewItems] = useState<GeneratedItem[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [suggestedDifficulty, setSuggestedDifficulty] = useState<1 | 3 | 5 | 8 | undefined>();
  const [suggestedPriority, setSuggestedPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | undefined>();
  const [remainingCredits, setRemainingCredits] = useState<number | undefined>();

  // Reset modal state when opened
  useEffect(() => {
    if (open) {
      setStep("configure");
      setItemCount(5);
      setCustomGoal("");
      setPreviewItems([]);
      setSummary("");
    }
  }, [open]);

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

  // Execute AI generation
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
        headers: { "Content-Type": "application/json", ...getAiAuthHeaders() },
        body: JSON.stringify({
          title: cardTitle.trim(),
          description: cardDescription || null,
          customGoal: customGoal.trim() || null,
          depth: itemCount <= 6 ? "standard" : "detailed",
          itemCount
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
        const itemsWithState: GeneratedItem[] = data.items.map((label: string) => ({
          id: crypto.randomUUID(),
          label,
          selected: true
        }));

        setPreviewItems(itemsWithState);
        setSummary(data.summary || "");
        setSuggestedDifficulty(data.suggestedDifficulty);
        setSuggestedPriority(data.suggestedPriority);
        setRemainingCredits(data.remainingCredits);
        setStep("preview");

        toast({
          message: `✨ AI ร่าง ${data.items.length} ขั้นตอนสำเร็จ! กรุณาตรวจสอบและยืนยันก่อนใส่ในการ์ด`,
          type: "success"
        });
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

  // Toggle item selection in preview
  const toggleItemSelection = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Update item label in preview
  const updateItemLabel = (id: string, newLabel: string) => {
    setPreviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  // Select all or deselect all
  const selectAll = (selected: boolean) => {
    setPreviewItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  // Final confirmation to apply selected items to the card
  const handleConfirmApply = () => {
    const selected = previewItems.filter((i) => i.selected && i.label.trim());

    if (selected.length === 0) {
      toast({
        message: "กรุณาเลือกอย่างน้อย 1 ขั้นตอนเพื่อนำไปใส่ในการ์ด",
        type: "error"
      });
      return;
    }

    playCardCreateSound();

    onApply({
      items: selected.map((i) => i.label.trim()),
      mode: insertMode,
      suggestedDifficulty,
      suggestedPriority
    });

    toast({
      message: `✨ ยืนยันเพิ่ม ${selected.length} ขั้นตอนลงในการ์ดเรียบร้อยแล้ว!`,
      type: "success"
    });

    onClose();
  };

  const selectedCount = previewItems.filter((i) => i.selected).length;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      labelledBy="ai-breakdown-title"
      contentClassName="lofi-panel flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-dusk-lavender/30 shadow-2xl bg-ink-950/95"
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
                <span>สร้างเช็กลิสต์ด้วย AI</span>
                {step === "preview" && (
                  <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300 font-medium">
                    ตรวจสอบก่อนยืนยัน
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-400">
                {step === "configure"
                  ? "กำหนดจำนวนและยืนยันก่อนสร้างเช็กลิสต์"
                  : "ตรวจสอบและปรับแต่งขั้นตอนก่อนนำไปใส่ในการ์ดจริง"}
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

        {/* STEP 1: CONFIGURE & CONFIRM BEFORE GENERATING */}
        {step === "configure" && (
          <div className="p-4 sm:p-5 space-y-4.5 text-sm max-h-[75vh] overflow-y-auto scrollbar-soft">
            {/* Card Title Preview */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                เป้าหมายของงาน (Task Title)
              </span>
              <p className="font-semibold text-stone-100 text-sm break-words line-clamp-2">
                {cardTitle || "ยังไม่ได้ระบุชื่องาน"}
              </p>
            </div>

            {/* Step Count: Recommendations & Custom Count */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-200">
                  จำนวนขั้นตอนที่ต้องการ (Step Count)
                </span>
                <span className="text-[11px] text-stone-400">
                  มีคำแนะนำ & กำหนดจำนวนเองได้
                </span>
              </div>

              {/* Recommended Presets */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STEP_COUNT_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = itemCount === preset.count;
                  return (
                    <button
                      key={preset.count}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => setItemCount(preset.count)}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs transition cursor-pointer text-center",
                        isSelected
                          ? "border-dusk-lavender bg-dusk-lavender/20 text-dusk-lavender font-semibold shadow-xs ring-1 ring-dusk-lavender/40"
                          : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/5"
                      )}
                    >
                      {preset.isRecommended && (
                        <span className="absolute -top-2 right-2 rounded-full bg-dusk-amber/90 px-1.5 py-0.2 text-[9px] font-bold text-ink-950 uppercase tracking-wider shadow-xs">
                          แนะนำ
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-dusk-amber" : "text-stone-400")} />
                        <span className="font-bold text-sm">{preset.label}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">{preset.subtitle}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Count Stepper */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-2.5">
                <span className="text-xs text-stone-400">กำหนดจำนวนที่ต้องการเอง:</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-white/10 bg-ink-950/60 p-0.5 shadow-inner">
                    <button
                      type="button"
                      aria-label="Decrease item count"
                      onClick={() => setItemCount((c) => Math.max(1, c - 1))}
                      disabled={itemCount <= 1 || isGenerating}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={itemCount}
                      onChange={(e) =>
                        setItemCount(Math.max(1, Math.min(15, Number(e.target.value) || 1)))
                      }
                      disabled={isGenerating}
                      className="w-12 bg-transparent text-center font-mono text-sm font-semibold text-stone-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      aria-label="Increase item count"
                      onClick={() => setItemCount((c) => Math.min(15, c + 1))}
                      disabled={itemCount >= 15 || isGenerating}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-stone-300">ขั้นตอน (ข้อ)</span>
                </div>
              </div>
            </div>

            {/* Optional Custom Focus Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
                <span>พิมพ์เป้าหมายสั้นๆ หรือจุดที่ต้องการเน้น (ไม่บังคับ)</span>
                <span className="text-[11px] text-stone-500">Optional</span>
              </label>
              <Input
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="เช่น เน้นเรื่องความปลอดภัย, เขียน Test ครอบคลุม, หรือ สูตรพริกแห้ง..."
                disabled={isGenerating}
                className="text-xs bg-ink-950/40 border-stone-700"
              />
            </div>

            {/* Insert Mode */}
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
                    "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition cursor-pointer",
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
                    "flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition cursor-pointer",
                    insertMode === "replace"
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-300 font-semibold"
                      : "border-white/10 bg-white/[0.02] text-stone-400 hover:text-stone-200"
                  )}
                >
                  <span>🔄 แทนที่ของเดิม (Replace)</span>
                </button>
              </div>
            </div>

            {/* Confirmation Note */}
            <div className="rounded-xl border border-dusk-cyan/30 bg-dusk-cyan/10 p-3 text-xs text-dusk-cyan flex items-start gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-dusk-cyan mt-0.5" />
              <span>
                ระบบจะวิเคราะห์และสร้างเช็กลิสต์จำนวน <strong>{itemCount} ข้อ</strong> โดยจะมีหน้าต่างตรวจสอบผลลัพธ์ให้คุณยืนยันก่อนบันทึกจริง
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & VERIFY BEFORE FINAL APPLY */}
        {step === "preview" && (
          <div className="p-4 sm:p-5 space-y-4 text-sm max-h-[75vh] overflow-y-auto scrollbar-soft">
            {/* AI Summary Banner */}
            {summary && (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs text-stone-300 flex items-center justify-between gap-2">
                <span className="font-medium text-stone-200">{summary}</span>
                {suggestedDifficulty && (
                  <span className="shrink-0 rounded-full border border-dusk-amber/35 bg-dusk-amber/15 px-2 py-0.5 text-[11px] font-semibold text-dusk-amber">
                    ความยาก: {suggestedDifficulty}
                  </span>
                )}
              </div>
            )}

            {/* Selection Toolbar */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300">
                เลือกขั้นตอนที่ต้องการนำไปใช้ ({selectedCount}/{previewItems.length} ข้อ)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAll(true)}
                  className="text-dusk-lavender hover:underline font-medium text-xs cursor-pointer"
                >
                  เลือกทั้งหมด
                </button>
                <span className="text-stone-600">|</span>
                <button
                  type="button"
                  onClick={() => selectAll(false)}
                  className="text-stone-400 hover:underline font-medium text-xs cursor-pointer"
                >
                  ล้างการเลือก
                </button>
              </div>
            </div>

            {/* Checklist Items Preview with Checkboxes */}
            <div className="space-y-2">
              {previewItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-2.5 transition cursor-pointer select-none",
                    item.selected
                      ? "border-dusk-lavender/40 bg-dusk-lavender/10 text-stone-100"
                      : "border-white/10 bg-white/[0.02] text-stone-400 opacity-60 hover:opacity-85"
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(item.id);
                    }}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                      item.selected
                        ? "border-dusk-lavender bg-dusk-lavender text-ink-950 font-bold"
                        : "border-stone-600 bg-transparent text-transparent"
                    )}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-mono font-semibold text-dusk-amber mr-1.5">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={item.label}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateItemLabel(item.id, e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-stone-200 focus:outline-none focus:border-b focus:border-dusk-lavender"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] p-4 sm:p-5">
          {step === "configure" ? (
            <>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>ใช้ 1 เครดิต</span>
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
                      <span>ยืนยันสร้างเช็กลิสต์ ({itemCount} ข้อ)</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("configure")}
                  className="text-stone-300 hover:text-white text-xs gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>ตั้งค่าใหม่</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="text-stone-300 border-white/15 hover:bg-white/10 text-xs gap-1"
                  title="สุ่มสร้างชุดใหม่ตามการตั้งค่าเดิม"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  <span>สุ่มคิดใหม่</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                >
                  ยกเลิก
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={selectedCount === 0}
                  onClick={handleConfirmApply}
                  className="gap-1.5 bg-emerald-500 text-stone-950 hover:bg-emerald-400 font-bold shadow-md transition-transform hover:scale-102 active:scale-98"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>ยืนยันนำไปใช้ ({selectedCount} ข้อ)</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppModal>
  );
}
