"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Eye,
  Flag,
  Layers,
  MoreHorizontal,
  Plus,
  Sparkles,
  Tag,
  User,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomStatusOption } from "@/lib/kanban/status";
import { STATUS_COLOR_CONFIGS } from "@/lib/kanban/status";
import type { CustomPriority } from "@/types/kanban";
import { getPriorityColorConfig } from "@/lib/kanban/priority";
import type { CustomStoryPoint } from "@/lib/kanban/difficulty";
import { getDifficultyMetadata, STORY_POINT_COLOR_CLASSES } from "@/lib/kanban/difficulty";

export interface SpotlightCardModalPreviewProps {
  activeSection: "status" | "priority" | "story-points";
  statuses: CustomStatusOption[];
  priorities: CustomPriority[];
  storyPoints: CustomStoryPoint[];
  previewTemplateName?: string;
  onSectionClick?: (section: "status" | "priority" | "story-points") => void;
  className?: string;
}

export function SpotlightCardModalPreview({
  activeSection,
  statuses,
  priorities,
  storyPoints,
  previewTemplateName,
  onSectionClick,
  className
}: SpotlightCardModalPreviewProps) {
  // Interactive mock state so users can click and feel the real behavior
  const [selectedStatus, setSelectedStatus] = useState<string>(
    () => statuses.find((s) => s.value === "DONE" || s.value === "RESOLVED")?.value || statuses[0]?.value || "TODO"
  );
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>(
    () => priorities[0]?.id || "HIGH"
  );
  const [selectedScore, setSelectedScore] = useState<number | null>(() => {
    // Default to score 3 (like in the user screenshot) or first point
    const found3 = storyPoints.find((p) => p.score === 3);
    return found3 ? 3 : storyPoints[0]?.score ?? 3;
  });

  const activeStatusMeta = useMemo(() => {
    const found = statuses.find((s) => s.value === selectedStatus) || statuses[0];
    const cfg = STATUS_COLOR_CONFIGS[found?.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
    return { ...found, cfg };
  }, [statuses, selectedStatus]);

  const activePriorityMeta = useMemo(() => {
    const found = priorities.find((p) => p.id === selectedPriorityId) || priorities[0];
    const cfg = getPriorityColorConfig(found?.color || "rose");
    return { ...found, cfg };
  }, [priorities, selectedPriorityId]);

  const activePointMeta = useMemo(() => {
    if (selectedScore === null) return null;
    return (
      storyPoints.find((p) => p.score === selectedScore) ||
      getDifficultyMetadata(selectedScore, storyPoints)
    );
  }, [storyPoints, selectedScore]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200/90 bg-stone-900/95 text-stone-100 shadow-xl overflow-hidden backdrop-blur-md dark:border-white/10 dark:bg-ink-950/95 flex flex-col",
        className
      )}
    >
      {/* ── Mockup Card Modal Header Bar ── */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.03]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Layers className="h-3.5 w-3.5" />
          </span>
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[11px] font-bold text-stone-400">TSK-108</span>
            <span className="text-stone-600 dark:text-stone-600">•</span>
            <span className="text-xs font-semibold text-stone-300 truncate">
              Card Details Modal Preview
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {previewTemplateName && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Preview:</span> {previewTemplateName}
            </span>
          )}
          <span className="grid h-6 w-6 place-items-center rounded-md text-stone-400 hover:text-stone-200 hover:bg-white/5 transition">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </span>
          <span className="grid h-6 w-6 place-items-center rounded-md text-stone-400 hover:text-stone-200 hover:bg-white/5 transition">
            <X className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* ── Spotlight Window with Top & Bottom Fade Gradient Masks ── */}
      <div className="relative p-4 sm:p-5 space-y-4 overflow-hidden">
        {/* Top Fade Gradient Mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-6 sm:h-8 bg-gradient-to-b from-stone-900 via-stone-900/60 to-transparent dark:from-ink-950 dark:via-ink-950/60 dark:to-transparent z-10"
        />
        {/* Bottom Fade Gradient Mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 sm:h-8 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent dark:from-ink-950 dark:via-ink-950/60 dark:to-transparent z-10"
        />

        {/* Mock Card Title */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-indigo-300">
              FEATURE
            </span>
            <span className="text-[11px] text-stone-500">Updated 10m ago</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Refine responsive card attributes &amp; live interactive mockup preview
          </h3>
        </div>

        {/* ── SECTION 1: STATUS ── */}
        {activeSection === "status" ? (
          /* Active Spotlight Status Section */
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-3 sm:p-3.5 space-y-2.5 ring-2 ring-indigo-500/25 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Status</span>
                </span>
                <span className="rounded-md border border-indigo-400/40 bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-bold text-indigo-300">
                  Spotlight
                </span>
              </div>
              <span className="grid h-5 w-5 place-items-center rounded text-stone-400 hover:text-white hover:bg-white/10 transition">
                <Plus className="h-3 w-3" />
              </span>
            </div>

            {/* Status Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {statuses.map((option) => {
                const cfg = STATUS_COLOR_CONFIGS[option.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
                const isSelected = selectedStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedStatus(option.value)}
                    className={cn(
                      "h-9 px-2.5 rounded-lg border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer",
                      isSelected
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30 shadow-xs"
                        : "border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400">
              Selected status: <span className="font-semibold text-stone-200">{activeStatusMeta.label}</span>
            </p>
          </div>
        ) : (
          /* Skeleton Status Section (when inactive) */
          <div
            className="group/sec rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-2.5 space-y-1.5 hover:border-indigo-400/40 transition cursor-pointer"
            onClick={() => onSectionClick?.("status")}
            title="Click to edit Statuses"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
                <CheckSquare className="h-3 w-3 opacity-50" />
                <span>Status</span>
              </span>
              <span className="text-[10px] text-indigo-400 opacity-0 group-hover/sec:opacity-100 transition">
                Switch to Status tab
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.08] border border-white/10 animate-pulse" />
            </div>
          </div>
        )}

        {/* ── SECTION 2: PRIORITY ── */}
        {activeSection === "priority" ? (
          /* Active Spotlight Priority Section */
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 sm:p-3.5 space-y-2.5 ring-2 ring-rose-500/25 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Flag className="h-3.5 w-3.5 text-rose-400" />
                  <span>Priority</span>
                </span>
                <span className="rounded-md border border-rose-400/40 bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-300">
                  Spotlight
                </span>
              </div>
              <span className="grid h-5 w-5 place-items-center rounded text-stone-400 hover:text-white hover:bg-white/10 transition">
                <Plus className="h-3 w-3" />
              </span>
            </div>

            {/* Priority Options Row */}
            <div className="flex flex-wrap gap-2">
              {priorities.map((item) => {
                const colorConfig = getPriorityColorConfig(item.color);
                const isSelected = selectedPriorityId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPriorityId(item.id)}
                    className={cn(
                      "h-9 px-3 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 cursor-pointer",
                      isSelected
                        ? cn(colorConfig.pillClass, "ring-2 ring-rose-400/40 font-bold shadow-xs")
                        : "border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full shrink-0", colorConfig.dotClass)} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400">
              Selected priority: <span className="font-semibold text-stone-200">{activePriorityMeta.label}</span>
            </p>
          </div>
        ) : (
          /* Skeleton Priority Section (when inactive) */
          <div
            className="group/sec rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-2.5 space-y-1.5 hover:border-rose-400/40 transition cursor-pointer"
            onClick={() => onSectionClick?.("priority")}
            title="Click to edit Priorities"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
                <Flag className="h-3 w-3 opacity-50" />
                <span>Priority</span>
              </span>
              <span className="text-[10px] text-rose-400 opacity-0 group-hover/sec:opacity-100 transition">
                Switch to Priority tab
              </span>
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-20 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 w-20 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 w-20 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
            </div>
          </div>
        )}

        {/* ── SECTION 3: STORY POINTS (THE HERO OF IMAGE 5) ── */}
        {activeSection === "story-points" ? (
          /* Active Spotlight Story Points Section */
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 sm:p-3.5 space-y-2.5 ring-2 ring-amber-500/25 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Story Points</span>
                </span>
                {activePointMeta && (
                  <span className="text-xs font-semibold text-amber-300">
                    {activePointMeta.title || `${activePointMeta.score} pts`}
                  </span>
                )}
                <span className="rounded-md border border-amber-400/40 bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                  Spotlight
                </span>
              </div>
              <span className="grid h-5 w-5 place-items-center rounded text-stone-400 hover:text-white hover:bg-white/10 transition">
                <Plus className="h-3 w-3" />
              </span>
            </div>

            {/* Buttons Grid matching Image 5 */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
              {/* '-' No point button */}
              <button
                type="button"
                onClick={() => setSelectedScore(null)}
                className={cn(
                  "h-9 rounded-lg border text-xs font-semibold transition flex items-center justify-center cursor-pointer",
                  selectedScore === null
                    ? "border-amber-400/50 bg-amber-500/25 text-amber-200 ring-2 ring-amber-400/30 font-bold"
                    : "border-white/10 bg-white/[0.04] text-stone-400 hover:border-white/20 hover:text-white"
                )}
                title="No points assigned"
              >
                -
              </button>

              {/* Point Buttons */}
              {storyPoints.map((point) => {
                const isSelected = selectedScore === point.score;
                const config = STORY_POINT_COLOR_CLASSES[point.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;

                return (
                  <button
                    key={point.score}
                    type="button"
                    onClick={() => setSelectedScore(point.score)}
                    className={cn(
                      "h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer",
                      isSelected
                        ? "border-cyan-400 bg-cyan-500 text-stone-950 font-black ring-2 ring-cyan-400/50 shadow-md"
                        : "border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:text-white"
                    )}
                    title={`${point.title || point.score} — ${point.description || ""}`}
                  >
                    <Zap className={cn("h-3 w-3", isSelected ? "text-stone-950 fill-stone-950" : "text-amber-400")} />
                    <span>{point.label || point.score}</span>
                  </button>
                );
              })}
            </div>

            {/* Description row matching Image 5 */}
            <div className="pt-0.5">
              {activePointMeta ? (
                <p className="text-[11px] font-medium text-stone-300 leading-snug">
                  {activePointMeta.description || "งานพื้นฐานทั่วไป 1–2 ชั่วโมง"}
                </p>
              ) : (
                <p className="text-[11px] text-stone-500">
                  Available points: {storyPoints.map((p) => p.label || p.score).join(", ")} pts
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Skeleton Story Points Section (when inactive) */
          <div
            className="group/sec rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-2.5 space-y-1.5 hover:border-amber-400/40 transition cursor-pointer"
            onClick={() => onSectionClick?.("story-points")}
            title="Click to edit Story Points"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
                <Zap className="h-3 w-3 opacity-50" />
                <span>Story Points</span>
              </span>
              <span className="text-[10px] text-amber-400 opacity-0 group-hover/sec:opacity-100 transition">
                Switch to Story Points tab
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.08] border border-white/10 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="h-7 rounded-md bg-white/[0.05] border border-white/5 animate-pulse" />
            </div>
            <div className="h-2.5 w-40 rounded bg-white/[0.04] animate-pulse" />
          </div>
        )}

        {/* ── SECTION 4: ASSIGNEES (SKELETONIZED MOCKUP ROW) ── */}
        <div className="space-y-1.5 opacity-65 pt-0.5">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="h-3.5 w-3.5" />
              <span>Assignees</span>
            </span>
            <span className="text-[11px] text-stone-500 font-normal">No assignees</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-white/[0.06] border border-white/5 animate-pulse" />
            <div className="h-7 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-2.5 flex items-center text-[11px] text-stone-400 font-medium">
              + Select assignees
            </div>
          </div>
        </div>

        {/* ── SECTION 5: CHECKLIST / ACTIVITY (SKELETONIZED SUBTLE ROWS) ── */}
        <div className="space-y-2 opacity-40 pt-1 pb-1">
          <div className="h-2.5 w-24 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-white/[0.03] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
