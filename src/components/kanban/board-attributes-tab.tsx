"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckSquare,
  Flag,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  CustomStatusOption,
  DEFAULT_STATUS_OPTIONS,
  STATUS_COLOR_CONFIGS,
  getStoredStatuses,
  saveStoredStatuses
} from "@/lib/kanban/status";
import {
  CustomStoryPoint,
  DEFAULT_STORY_POINTS,
  STORY_POINT_COLOR_CLASSES,
  STORY_POINT_PRESETS,
  getStoredStoryPoints,
  saveStoredStoryPoints
} from "@/lib/kanban/difficulty";
import { BoardPrioritiesTab } from "./board-priorities-tab";
import type { CustomPriority } from "@/types/kanban";
import { cn } from "@/lib/utils";

const STATUS_COLOR_KEYS = ["indigo", "teal", "cyan", "amber", "emerald", "rose", "purple", "stone"] as const;
const STORY_POINT_COLOR_KEYS = ["emerald", "cyan", "amber", "orange", "rose", "purple", "indigo"] as const;

export interface BoardAttributesTabProps {
  boardId: string;
  canManage?: boolean;
  priorities: CustomPriority[];
  onPrioritiesChange: (priorities: CustomPriority[]) => void;
  initialSubTab?: "status" | "priority" | "story-points";
}

export function BoardAttributesTab({
  boardId,
  canManage = true,
  priorities,
  onPrioritiesChange,
  initialSubTab = "status"
}: BoardAttributesTabProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<"status" | "priority" | "story-points">(initialSubTab);

  // Status Tab State
  const [statuses, setStatuses] = useState<CustomStatusOption[]>(() => getStoredStatuses(boardId));
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState<string>("indigo");
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);
  const [isResetStatusConfirmOpen, setIsResetStatusConfirmOpen] = useState(false);

  // Story Points Tab State
  const [storyPoints, setStoryPoints] = useState<CustomStoryPoint[]>(() => getStoredStoryPoints(boardId));
  const [newPointScore, setNewPointScore] = useState<string>("");
  const [newPointTitle, setNewPointTitle] = useState("");
  const [newPointDescription, setNewPointDescription] = useState("");
  const [newPointColor, setNewPointColor] = useState<string>("cyan");
  const [pointToDelete, setPointToDelete] = useState<number | null>(null);
  const [isResetPointsConfirmOpen, setIsResetPointsConfirmOpen] = useState(false);

  // Sync when boardId changes or external update occurs
  useEffect(() => {
    setStatuses(getStoredStatuses(boardId));
    setStoryPoints(getStoredStoryPoints(boardId));
  }, [boardId]);

  useEffect(() => {
    const handleStatusSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.boardId || detail.boardId === boardId) {
        if (detail?.statuses) setStatuses(detail.statuses);
      }
    };
    const handleStoryPointsSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.boardId || detail.boardId === boardId) {
        if (detail?.points) setStoryPoints(detail.points);
      }
    };

    window.addEventListener("retzlo:statuses-updated", handleStatusSync);
    window.addEventListener("retzlo:story-points-updated", handleStoryPointsSync);
    return () => {
      window.removeEventListener("retzlo:statuses-updated", handleStatusSync);
      window.removeEventListener("retzlo:story-points-updated", handleStoryPointsSync);
    };
  }, [boardId]);

  /* -------------------------------------------------------------
     STATUS ACTIONS
  ------------------------------------------------------------- */
  const handleAddStatus = () => {
    if (!canManage) return;
    const trimmed = newStatusLabel.trim();
    if (!trimmed) {
      toast({ message: "กรุณาระบุชื่อสถานะ", type: "error" });
      return;
    }
    const slug = trimmed.toUpperCase().replace(/\s+/g, "_").slice(0, 20);
    const exists = statuses.some((s) => s.value.toUpperCase() === slug);
    if (exists) {
      toast({ message: "สถานะนี้มีอยู่แล้ว", type: "error" });
      return;
    }

    const next: CustomStatusOption[] = [
      ...statuses,
      { value: slug, label: trimmed, color: newStatusColor }
    ];
    setStatuses(next);
    saveStoredStatuses(next, boardId);
    setNewStatusLabel("");
    toast({ message: `เพิ่มสถานะ "${trimmed}" เรียบร้อย`, type: "success" });
  };

  const handleMoveStatus = (index: number, direction: "up" | "down") => {
    if (!canManage) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= statuses.length) return;

    const copy = [...statuses];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    setStatuses(copy);
    saveStoredStatuses(copy, boardId);
    toast({ message: "สลับลำดับสถานะเรียบร้อย", type: "success" });
  };

  const handleConfirmDeleteStatus = () => {
    if (!statusToDelete || !canManage) return;
    const item = statuses.find((s) => s.value === statusToDelete);
    const next = statuses.filter((s) => s.value !== statusToDelete);
    setStatuses(next);
    saveStoredStatuses(next, boardId);
    setStatusToDelete(null);
    toast({ message: `ลบสถานะ "${item?.label || statusToDelete}" แล้ว`, type: "success" });
  };

  const handleResetStatuses = () => {
    if (!canManage) return;
    setStatuses(DEFAULT_STATUS_OPTIONS);
    saveStoredStatuses(DEFAULT_STATUS_OPTIONS, boardId);
    setIsResetStatusConfirmOpen(false);
    toast({ message: "รีเซ็ตสถานะกลับเป็นค่าเริ่มต้นแล้ว", type: "success" });
  };

  /* -------------------------------------------------------------
     STORY POINTS ACTIONS
  ------------------------------------------------------------- */
  const handleAddStoryPoint = () => {
    if (!canManage) return;
    const parsed = Number(newPointScore.trim());
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 100) {
      toast({ message: "กรุณาระบุคะแนนเป็นตัวเลข 1 - 100", type: "error" });
      return;
    }
    const exists = storyPoints.some((p) => p.score === parsed);
    if (exists) {
      toast({ message: `คะแนน ${parsed} pts มีอยู่แล้วในรายการ`, type: "error" });
      return;
    }

    const colorConfig = STORY_POINT_COLOR_CLASSES[newPointColor] || STORY_POINT_COLOR_CLASSES.cyan;
    const title = newPointTitle.trim() || `${parsed} pts`;
    const newPoint: CustomStoryPoint = {
      score: parsed,
      label: String(parsed),
      pointsLabel: `${parsed} pts`,
      title: `${title} (${parsed} pts)`,
      description: newPointDescription.trim() || `งานระดับ ${parsed} คะแนน`,
      color: newPointColor,
      ...colorConfig
    };

    const next = [...storyPoints, newPoint].sort((a, b) => a.score - b.score);
    setStoryPoints(next);
    saveStoredStoryPoints(next, boardId);
    setNewPointScore("");
    setNewPointTitle("");
    setNewPointDescription("");
    toast({ message: `เพิ่มคะแนนความยาก ⚡${parsed} เรียบร้อย`, type: "success" });
  };

  const handleApplyPreset = (key: keyof typeof STORY_POINT_PRESETS) => {
    if (!canManage) return;
    const preset = STORY_POINT_PRESETS[key];
    if (!preset) return;
    setStoryPoints(preset.points);
    saveStoredStoryPoints(preset.points, boardId);
    toast({ message: `ปรับใช้สเกล "${preset.name}" แล้ว`, type: "success" });
  };

  const handleConfirmDeletePoint = () => {
    if (pointToDelete === null || !canManage) return;
    if (storyPoints.length <= 1) {
      toast({ message: "ต้องมีระดับคะแนนความยากอย่างน้อย 1 ระดับ", type: "error" });
      setPointToDelete(null);
      return;
    }

    const next = storyPoints.filter((p) => p.score !== pointToDelete);
    setStoryPoints(next);
    saveStoredStoryPoints(next, boardId);
    setPointToDelete(null);
    toast({ message: `ลบคะแนน ⚡${pointToDelete} เรียบร้อย`, type: "success" });
  };

  const handleResetStoryPoints = () => {
    if (!canManage) return;
    setStoryPoints(DEFAULT_STORY_POINTS);
    saveStoredStoryPoints(DEFAULT_STORY_POINTS, boardId);
    setIsResetPointsConfirmOpen(false);
    toast({ message: "รีเซ็ตคะแนนความยากกลับเป็นค่าเริ่มต้นแล้ว", type: "success" });
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Sub-navigation Pills */}
      <div className="flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-100/90 p-1 dark:border-white/10 dark:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setActiveSubTab("status")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "status"
              ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
          <span>สถานะการ์ด (Status)</span>
          <span className="rounded-full bg-indigo-500/10 px-1.5 text-[10px] font-mono text-indigo-600 dark:text-dusk-lavender">
            {statuses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("priority")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "priority"
              ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          <Flag className="h-3.5 w-3.5 text-rose-500" />
          <span>ระดับความสำคัญ (Priority)</span>
          <span className="rounded-full bg-rose-500/10 px-1.5 text-[10px] font-mono text-rose-600 dark:text-rose-400">
            {priorities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("story-points")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "story-points"
              ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          )}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Story Points</span>
          <span className="rounded-full bg-amber-500/10 px-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
            {storyPoints.length}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: STATUS
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "status" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-indigo-400/30 bg-indigo-500/10 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Custom Card Statuses (จัดการสถานะการ์ด)
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  สถานะที่เพิ่มจะเชื่อมโยงกับคอลัมน์ การ์ด และตารางงานบนบอร์ดนี้โดยอัตโนมัติ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsResetStatusConfirmOpen(true)}
              disabled={!canManage}
              className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-stone-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>รีเซ็ตค่าเริ่มต้น</span>
            </button>
          </div>

          {/* Add Status Section */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3.5 space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              + เพิ่มสถานะใหม่ (Add Status)
            </h5>
            <div className="grid gap-2.5 sm:grid-cols-[1fr_auto_auto]">
              <Input
                placeholder="เช่น In Review, Testing, Blocked..."
                value={newStatusLabel}
                onChange={(e) => setNewStatusLabel(e.target.value)}
                disabled={!canManage}
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
              />
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {STATUS_COLOR_KEYS.map((colKey) => (
                  <button
                    key={colKey}
                    type="button"
                    disabled={!canManage}
                    onClick={() => setNewStatusColor(colKey)}
                    className={cn(
                      "h-6 w-6 rounded-full border transition cursor-pointer flex items-center justify-center shrink-0",
                      newStatusColor === colKey
                        ? "ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-xs"
                        : "opacity-70 hover:opacity-100",
                      colKey === "indigo" && "bg-indigo-500 border-indigo-600",
                      colKey === "teal" && "bg-teal-500 border-teal-600",
                      colKey === "cyan" && "bg-cyan-500 border-cyan-600",
                      colKey === "amber" && "bg-amber-500 border-amber-600",
                      colKey === "emerald" && "bg-emerald-500 border-emerald-600",
                      colKey === "rose" && "bg-rose-500 border-rose-600",
                      colKey === "purple" && "bg-purple-500 border-purple-600",
                      colKey === "stone" && "bg-stone-500 border-stone-600"
                    )}
                    title={colKey}
                  >
                    {newStatusColor === colKey && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddStatus}
                disabled={!canManage || !newStatusLabel.trim()}
                className="h-8 text-xs gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>เพิ่มสถานะ</span>
              </Button>
            </div>
          </div>

          {/* Status List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {statuses.map((st, index) => {
              const cfg = STATUS_COLOR_CONFIGS[st.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
              const isDefault = st.isDefault || ["TODO", "DOING", "WAITING", "DONE"].includes(st.value);
              const isFirst = index === 0;
              const isLast = index === statuses.length - 1;

              return (
                <div
                  key={st.value}
                  className="flex items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs dark:border-white/10 dark:bg-stone-900/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("px-2.5 py-0.5 rounded border font-semibold text-xs truncate", cfg.badgeClass)}>
                      {st.label}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400 truncate">({st.value})</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Reorder Up/Down */}
                    <button
                      type="button"
                      onClick={() => handleMoveStatus(index, "up")}
                      disabled={isFirst || !canManage}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 cursor-pointer"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStatus(index, "down")}
                      disabled={isLast || !canManage}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 cursor-pointer"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete or System Tag */}
                    {isDefault ? (
                      <span className="rounded bg-stone-100 px-2 py-1 text-[10px] font-medium text-stone-400 dark:bg-white/5">
                        ระบบ
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatusToDelete(st.value)}
                        disabled={!canManage}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 cursor-pointer"
                        title="ลบสถานะ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: PRIORITY
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "priority" && (
        <BoardPrioritiesTab
          priorities={priorities}
          onChange={onPrioritiesChange}
          canManage={canManage}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 3: STORY POINTS
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "story-points" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-600 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Story Points Scale (สเกลคะแนนความยาก)
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  ประเมินน้ำหนักงาน (Effort) ด้วยสเกลยอดนิยม หรือกำหนดคะแนนเอง
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsResetPointsConfirmOpen(true)}
              disabled={!canManage}
              className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-stone-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>รีเซ็ต Story Points</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 space-y-2 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              เลือกเทมเพลตสเกลมาตรฐาน (Presets):
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(STORY_POINT_PRESETS) as Array<keyof typeof STORY_POINT_PRESETS>).map((key) => {
                const preset = STORY_POINT_PRESETS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!canManage}
                    onClick={() => handleApplyPreset(key)}
                    className="flex flex-col items-start rounded-lg border border-stone-200/80 bg-white p-2 text-left transition hover:border-amber-400 hover:bg-amber-50/20 disabled:opacity-40 dark:border-white/10 dark:bg-stone-900/60 dark:hover:border-amber-400/50 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{preset.name}</span>
                    <span className="text-[10px] text-stone-400 truncate max-w-full">{preset.points.map((p) => p.label).join(", ")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Point */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3.5 space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              + เพิ่มคะแนนกำหนดเอง (Add Custom Story Point)
            </h5>
            <div className="grid gap-2.5 sm:grid-cols-[80px_1fr_1fr_auto]">
              <Input
                type="number"
                min={1}
                max={100}
                placeholder="คะแนน"
                value={newPointScore}
                onChange={(e) => setNewPointScore(e.target.value)}
                disabled={!canManage}
                className="h-8 text-xs font-mono font-bold"
              />
              <Input
                placeholder="ชื่อเรียก เช่น ปานกลาง (5 pts)"
                value={newPointTitle}
                onChange={(e) => setNewPointTitle(e.target.value)}
                disabled={!canManage}
                className="h-8 text-xs"
              />
              <Input
                placeholder="คำอธิบาย เช่น งาน 1 วัน"
                value={newPointDescription}
                onChange={(e) => setNewPointDescription(e.target.value)}
                disabled={!canManage}
                className="h-8 text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddStoryPoint}
                disabled={!canManage || !newPointScore.trim()}
                className="h-8 text-xs gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>เพิ่มคะแนน</span>
              </Button>
            </div>
          </div>

          {/* Story Points List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {storyPoints.map((pt) => {
              const colorConfig = STORY_POINT_COLOR_CLASSES[pt.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;

              return (
                <div
                  key={pt.score}
                  className="flex items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-2xs dark:border-white/10 dark:bg-stone-900/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold shrink-0", colorConfig.badgeClass)}>
                      <Zap className="h-3 w-3" />
                      <span>{pt.pointsLabel || `${pt.score} pts`}</span>
                    </span>
                    <div className="flex flex-col min-w-0 truncate">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{pt.title}</span>
                      <span className="text-[11px] text-stone-400 truncate">{pt.description}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPointToDelete(pt.score)}
                    disabled={!canManage || storyPoints.length <= 1}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 cursor-pointer shrink-0"
                    title="ลบคะแนน"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modals per AGENTS.md */}
      <ConfirmModal
        open={statusToDelete !== null}
        title="ยืนยันการลบสถานะ"
        message={`ต้องการลบสถานะ "${statuses.find((s) => s.value === statusToDelete)?.label || statusToDelete}" ใช่หรือไม่? การ์ดที่มีสถานะนี้จะยังคงอยู่`}
        confirmLabel="ลบสถานะ"
        variant="danger"
        onClose={() => setStatusToDelete(null)}
        onConfirm={handleConfirmDeleteStatus}
      />

      <ConfirmModal
        open={isResetStatusConfirmOpen}
        title="รีเซ็ตสถานะกลับเป็นค่าเริ่มต้น"
        message="การตั้งค่าสถานะทั้งหมดจะถูกรีเซ็ตกลับเป็น 4 สถานะมาตรฐาน (Todo, Doing, Waiting, Done)"
        confirmLabel="รีเซ็ตสถานะ"
        variant="default"
        onClose={() => setIsResetStatusConfirmOpen(false)}
        onConfirm={handleResetStatuses}
      />

      <ConfirmModal
        open={pointToDelete !== null}
        title="ยืนยันการลบ Story Points"
        message={`ต้องการลบคะแนน "${pointToDelete} pts" ออกจากรายการใช่หรือไม่?`}
        confirmLabel="ลบคะแนน"
        variant="danger"
        onClose={() => setPointToDelete(null)}
        onConfirm={handleConfirmDeletePoint}
      />

      <ConfirmModal
        open={isResetPointsConfirmOpen}
        title="รีเซ็ต Story Points กลับเป็นค่าเริ่มต้น"
        message="ระดับคะแนนความยากทั้งหมดจะถูกรีเซ็ตกลับเป็นสเกล Retzlo มาตรฐาน (1, 3, 5, 8, 16, 21 pts)"
        confirmLabel="รีเซ็ต Story Points"
        variant="default"
        onClose={() => setIsResetPointsConfirmOpen(false)}
        onConfirm={handleResetStoryPoints}
      />
    </div>
  );
}
