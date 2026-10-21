"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Coins,
  Compass,
  Layers,
  ListChecks,
  Loader2,
  Minus,
  Plus,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
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
  {
    count: 3,
    title: "3 Steps",
    subtitle: "Quick & Concise",
    tag: "Fast",
    icon: Zap
  },
  {
    count: 5,
    title: "5 Steps",
    subtitle: "Standard Scope",
    tag: "Recommended",
    isRecommended: true,
    icon: Sparkles
  },
  {
    count: 8,
    title: "8 Steps",
    subtitle: "Thorough Detail",
    tag: "Detailed",
    icon: ListChecks
  },
  {
    count: 10,
    title: "10 Steps",
    subtitle: "Comprehensive",
    tag: "Deep",
    icon: Layers
  }
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
        message: "Please specify a task title before breaking down checklist",
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

      let data: any;
      try {
        data = await res.json();
      } catch {
        const errorMsg =
          res.status === 504
            ? "AI response timed out — try fewer steps or try again"
            : `Server returned error (HTTP ${res.status})`;
        toast({ message: errorMsg, type: "error" });
        return;
      }

      if (!res.ok) {
        toast({
          message: (data.error as string) || "Failed to communicate with AI Assistant",
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
          message: `✨ AI generated ${data.items.length} steps! Please review before applying.`,
          type: "success"
        });
      } else {
        toast({
          message: "No steps returned from AI. Please try again.",
          type: "error"
        });
      }
    } catch {
      toast({
        message: "Unable to connect to AI server. Please try again.",
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
        message: "Please select at least 1 step to add to the card",
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
      message: `✨ Added ${selected.length} steps to card successfully!`,
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
      contentClassName="lofi-panel flex w-full max-w-xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-white/12 shadow-2xl bg-[#faf7f2] dark:bg-[#0c0d1e] text-stone-900 dark:text-stone-100 backdrop-blur-xl"
    >
      <div className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-white/10 px-5 py-4 bg-stone-100/40 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-indigo-200 dark:border-dusk-lavender/40 bg-indigo-50 dark:bg-dusk-lavender/15 text-indigo-600 dark:text-dusk-lavender shadow-xs">
              <Sparkles className="h-5 w-5 animate-pulse text-indigo-600 dark:text-dusk-amber" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="ai-breakdown-title"
                  aria-label="AI Auto-Breakdown Task"
                  className="text-base sm:text-lg font-bold tracking-tight text-foreground"
                >
                  AI Checklist Breakdown
                </h2>
                {step === "preview" && (
                  <span className="rounded-full border border-indigo-200 dark:border-dusk-lavender/40 bg-indigo-50 dark:bg-dusk-lavender/20 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-dusk-lavender uppercase tracking-wider">
                    Review
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {step === "configure"
                  ? "Configure step count and preferences before generating"
                  : "Review and refine steps before applying to the card"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {credits !== null && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 px-2.5 py-1 text-xs font-mono font-bold text-amber-800 dark:text-amber-300 shadow-2xs"
                title={`AI Credits Quota (${tier} Tier)`}
              >
                <Coins className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>{credits} cr</span>
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-stone-400 hover:bg-stone-200/60 dark:hover:bg-white/10 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* STEP 1: CONFIGURE & CONFIRM BEFORE GENERATING */}
        {step === "configure" && (
          <div className="p-5 space-y-4 text-sm max-h-[75vh] overflow-y-auto scrollbar-soft">
            {/* Task Goal Context Card */}
            <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 dark:border-white/10 bg-white dark:bg-white/[0.025] p-3.5 pl-4 shadow-2xs">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-dusk-lavender dark:to-dusk-lavender/60" />
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                <Target className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                <span>Target Task</span>
              </div>
              <p className="font-bold text-foreground text-sm leading-snug break-words">
                {cardTitle || "No task title specified"}
              </p>
              {cardDescription && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                  {cardDescription}
                </p>
              )}
            </div>

            {/* Step Count: Presets + Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <ListChecks className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
                  <span>Target Steps</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Custom:</span>
                  <div className="inline-flex items-center rounded-lg border border-stone-200 dark:border-white/10 bg-stone-100/80 dark:bg-white/[0.04] p-0.5 shadow-inner">
                    <button
                      type="button"
                      aria-label="Decrease item count"
                      onClick={() => setItemCount((c) => Math.max(1, c - 1))}
                      disabled={itemCount <= 1 || isGenerating}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-bold text-foreground">
                      {itemCount}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase item count"
                      onClick={() => setItemCount((c) => Math.min(15, c + 1))}
                      disabled={itemCount >= 15 || isGenerating}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        "group relative flex flex-col items-start rounded-2xl border p-3 text-left transition-all duration-150 cursor-pointer active:scale-98 select-none shadow-2xs",
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/80 dark:border-dusk-lavender dark:bg-dusk-lavender/15 text-indigo-950 dark:text-white shadow-sm ring-2 ring-indigo-400/40 dark:ring-dusk-lavender/30"
                          : "border-stone-200/80 dark:border-white/10 bg-white dark:bg-white/[0.03] text-stone-700 dark:text-stone-300 hover:border-indigo-300 dark:hover:border-white/20 hover:bg-indigo-50/20 dark:hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="flex w-full items-center justify-between mb-1.5">
                        <div
                          className={cn(
                            "grid h-6 w-6 place-items-center rounded-lg transition-colors",
                            isSelected
                              ? "bg-indigo-600 text-white dark:bg-dusk-lavender dark:text-ink-950"
                              : "bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        {preset.isRecommended ? (
                          <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                            Best
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                            {preset.tag}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-sm tracking-tight text-foreground">
                        {preset.title}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {preset.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Custom Focus Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Compass className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
                  <span>Specific Focus or Context</span>
                </label>
                <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <Input
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="e.g. Focus on security, edge cases, test coverage, or step-by-step UX..."
                disabled={isGenerating}
                className="h-9 text-xs bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/10 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:ring-indigo-500/40 rounded-xl"
              />
            </div>

            {/* Insertion Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[11px]">
                Checklist Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setInsertMode("append")}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition cursor-pointer select-none shadow-2xs",
                    insertMode === "append"
                      ? "border-indigo-500 bg-indigo-50/80 dark:border-dusk-lavender/60 dark:bg-dusk-lavender/15 text-indigo-950 dark:text-white ring-1 ring-indigo-400/40 dark:ring-dusk-lavender/30"
                      : "border-stone-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/[0.05]"
                  )}
                >
                  <div
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-xl transition-colors",
                      insertMode === "append"
                        ? "bg-indigo-600 text-white dark:bg-dusk-lavender dark:text-ink-950"
                        : "bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-stone-400"
                    )}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Append</div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">Add to existing checklist</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setInsertMode("replace")}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition cursor-pointer select-none shadow-2xs",
                    insertMode === "replace"
                      ? "border-amber-500 bg-amber-50/80 dark:border-dusk-amber/60 dark:bg-dusk-amber/15 text-amber-950 dark:text-white ring-1 ring-amber-400/40 dark:ring-dusk-amber/30"
                      : "border-stone-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/[0.05]"
                  )}
                >
                  <div
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-xl transition-colors",
                      insertMode === "replace"
                        ? "bg-amber-600 text-white dark:bg-dusk-amber dark:text-ink-950"
                        : "bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-stone-400"
                    )}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Replace</div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">Overwrite current items</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Subtle Tip Banner */}
            <div className="flex items-center gap-2 rounded-xl border border-indigo-200/80 dark:border-white/10 bg-indigo-50/50 dark:bg-white/[0.02] px-3.5 py-2 text-xs text-stone-600 dark:text-stone-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-amber shrink-0" />
              <span>
                AI will draft <strong>{itemCount} actionable steps</strong>. You can review, edit, or deselect items in the next step.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & VERIFY BEFORE FINAL APPLY */}
        {step === "preview" && (
          <div className="p-5 space-y-4 text-sm max-h-[75vh] overflow-y-auto scrollbar-soft">
            {/* AI Summary Banner */}
            {summary && (
              <div className="rounded-2xl border border-stone-200/90 dark:border-white/10 bg-white dark:bg-white/[0.035] p-3.5 text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between gap-2 shadow-2xs">
                <span className="font-semibold text-foreground">{summary}</span>
                {suggestedDifficulty && (
                  <span className="shrink-0 rounded-full border border-amber-300 dark:border-dusk-amber/35 bg-amber-50 dark:bg-dusk-amber/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-dusk-amber">
                    Difficulty: {suggestedDifficulty}
                  </span>
                )}
              </div>
            )}

            {/* Selection Toolbar */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-stone-700 dark:text-stone-300">
                Select steps to apply ({selectedCount}/{previewItems.length} items)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAll(true)}
                  className="text-indigo-600 dark:text-dusk-lavender hover:underline font-semibold text-xs cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-stone-300 dark:text-stone-600">|</span>
                <button
                  type="button"
                  onClick={() => selectAll(false)}
                  className="text-stone-500 hover:underline font-semibold text-xs cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Checklist Items Preview */}
            <div className="space-y-2">
              {previewItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-3 transition cursor-pointer select-none shadow-2xs",
                    item.selected
                      ? "border-indigo-300 dark:border-dusk-lavender/40 bg-indigo-50/50 dark:bg-dusk-lavender/10 text-foreground"
                      : "border-stone-200/70 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] text-stone-400 opacity-60 hover:opacity-85"
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(item.id);
                    }}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition",
                      item.selected
                        ? "border-indigo-600 bg-indigo-600 text-white dark:border-dusk-lavender dark:bg-dusk-lavender dark:text-ink-950 font-bold"
                        : "border-stone-300 dark:border-stone-600 bg-transparent text-transparent"
                    )}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-dusk-amber">
                        Step {index + 1}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={item.label}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateItemLabel(item.id, e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none focus:border-b focus:border-indigo-500 dark:focus:border-dusk-lavender"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200/80 dark:border-white/10 bg-stone-100/40 dark:bg-white/[0.015] px-5 py-3.5">
          {step === "configure" ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <Coins className="h-3.5 w-3.5 text-amber-500 dark:text-dusk-amber" />
                <span>Costs 1 credit</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isGenerating}
                  className="text-xs text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isGenerating || !cardTitle.trim()}
                  onClick={handleGenerate}
                  className="h-9 px-4 gap-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-dusk-lavender dark:hover:bg-dusk-lavender/90 text-white dark:text-ink-950 font-bold shadow-md shadow-indigo-500/20 dark:shadow-dusk-lavender/20 transition-all cursor-pointer active:scale-95 rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating steps...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300 dark:text-ink-950" />
                      <span>Generate Checklist ({itemCount} steps)</span>
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
                  className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 text-xs gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reconfigure</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="text-stone-700 dark:text-stone-300 border-stone-200 dark:border-white/15 hover:bg-stone-100 dark:hover:bg-white/10 text-xs gap-1 rounded-xl"
                  title="Regenerate with same settings"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  <span>Regenerate</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={selectedCount === 0}
                  onClick={handleConfirmApply}
                  className="h-9 px-4 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 rounded-xl"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Apply to Card ({selectedCount} items)</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppModal>
  );
}
