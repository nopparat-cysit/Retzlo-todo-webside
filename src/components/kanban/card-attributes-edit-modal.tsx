"use client";

import { useState } from "react";
import {
  Check,
  CheckSquare,
  Flag,
  Palette,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  Zap,
  ArrowUp,
  ArrowDown
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CustomStatusOption,
  DEFAULT_STATUS_OPTIONS,
  STATUS_COLOR_CONFIGS,
  saveStoredStatuses
} from "@/lib/kanban/status";
import type { CustomPriority } from "@/types/kanban";
import {
  DEFAULT_PRIORITIES,
  MAX_BOARD_PRIORITIES,
  MIN_BOARD_PRIORITIES,
  PRIORITY_COLOR_OPTIONS,
  getPriorityColorConfig
} from "@/lib/kanban/priority";
import {
  CustomStoryPoint,
  DEFAULT_STORY_POINTS,
  STORY_POINT_COLOR_CLASSES,
  STORY_POINT_PRESETS,
  saveStoredStoryPoints
} from "@/lib/kanban/difficulty";
import { cn } from "@/lib/utils";

export interface CardAttributesEditModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: "status" | "priority" | "story-points";
  boardId?: string;
  statuses: CustomStatusOption[];
  onUpdateStatuses: (statuses: CustomStatusOption[]) => void;
  priorities: CustomPriority[];
  onUpdatePriorities: (priorities: CustomPriority[]) => void;
  storyPoints: CustomStoryPoint[];
  onUpdateStoryPoints: (points: CustomStoryPoint[]) => void;
}

const STATUS_COLOR_KEYS = ["indigo", "teal", "cyan", "amber", "emerald", "rose", "purple", "stone"] as const;
const STORY_POINT_COLOR_KEYS = ["emerald", "cyan", "amber", "orange", "rose", "purple", "indigo"] as const;

export function CardAttributesEditModal({
  open,
  onClose,
  initialTab = "status",
  boardId,
  statuses,
  onUpdateStatuses,
  priorities,
  onUpdatePriorities,
  storyPoints,
  onUpdateStoryPoints
}: CardAttributesEditModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Status Tab State
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState<string>("indigo");
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);
  const [isResetStatusConfirmOpen, setIsResetStatusConfirmOpen] = useState(false);

  // Priority Tab State
  const [newPriorityLabel, setNewPriorityLabel] = useState("");
  const [newPriorityColor, setNewPriorityColor] = useState<string>("rose");
  const [priorityToDelete, setPriorityToDelete] = useState<string | null>(null);
  const [isResetPriorityConfirmOpen, setIsResetPriorityConfirmOpen] = useState(false);
  const [isSavingPriorities, setIsSavingPriorities] = useState(false);

  // Story Points Tab State
  const [newPointScore, setNewPointScore] = useState<string>("");
  const [newPointTitle, setNewPointTitle] = useState("");
  const [newPointDescription, setNewPointDescription] = useState("");
  const [newPointColor, setNewPointColor] = useState<string>("cyan");
  const [pointToDelete, setPointToDelete] = useState<number | null>(null);
  const [isResetPointsConfirmOpen, setIsResetPointsConfirmOpen] = useState(false);

  /* -------------------------------------------------------------
     STATUS ACTIONS
  ------------------------------------------------------------- */
  const handleAddStatus = () => {
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
    onUpdateStatuses(next);
    saveStoredStatuses(next, boardId);
    setNewStatusLabel("");
    toast({ message: `เพิ่มสถานะ "${trimmed}" เรียบร้อย`, type: "success" });
  };

  const handleConfirmDeleteStatus = () => {
    if (!statusToDelete) return;
    const item = statuses.find((s) => s.value === statusToDelete);
    const next = statuses.filter((s) => s.value !== statusToDelete);
    onUpdateStatuses(next);
    saveStoredStatuses(next, boardId);
    setStatusToDelete(null);
    toast({ message: `ลบสถานะ "${item?.label || statusToDelete}" แล้ว`, type: "success" });
  };

  const handleResetStatuses = () => {
    onUpdateStatuses(DEFAULT_STATUS_OPTIONS);
    saveStoredStatuses(DEFAULT_STATUS_OPTIONS, boardId);
    setIsResetStatusConfirmOpen(false);
    toast({ message: "รีเซ็ตสถานะกลับเป็นค่าเริ่มต้นแล้ว", type: "success" });
  };

  /* -------------------------------------------------------------
     PRIORITY ACTIONS
  ------------------------------------------------------------- */
  const handleAddPriority = async () => {
    const trimmed = newPriorityLabel.trim() || `Priority ${priorities.length + 1}`;
    if (priorities.length >= MAX_BOARD_PRIORITIES) {
      toast({ message: `ระดับความสำคัญสูงสุดได้ไม่เกิน ${MAX_BOARD_PRIORITIES} ระดับ`, type: "error" });
      return;
    }

    const nextLevel = priorities.length + 1;
    const newP: CustomPriority = {
      id: `priority_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: trimmed,
      color: newPriorityColor,
      level: nextLevel
    };

    const next = [...priorities, newP].map((p, idx) => ({ ...p, level: idx + 1 }));
    onUpdatePriorities(next);
    setNewPriorityLabel("");
    toast({ message: `เพิ่มระดับ "${trimmed}" แล้ว`, type: "success" });

    // Sync to backend if boardId is available
    if (boardId) {
      await persistPrioritiesToBackend(next);
    }
  };

  const persistPrioritiesToBackend = async (nextPriorities: CustomPriority[]) => {
    if (!boardId) return;
    try {
      setIsSavingPriorities(true);
      await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPriorities: nextPriorities })
      });
    } catch {} finally {
      setIsSavingPriorities(false);
    }
  };

  const handleMovePriority = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= priorities.length) return;

    const copy = [...priorities];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    const reindexed = copy.map((p, idx) => ({ ...p, level: idx + 1 }));
    onUpdatePriorities(reindexed);
    if (boardId) {
      await persistPrioritiesToBackend(reindexed);
    }
    toast({ message: `สลับลำดับความสำคัญสำเร็จ`, type: "success" });
  };

  const handleConfirmDeletePriority = async () => {
    if (!priorityToDelete) return;
    if (priorities.length <= MIN_BOARD_PRIORITIES) {
      toast({ message: `ต้องมีระดับความสำคัญอย่างน้อย ${MIN_BOARD_PRIORITIES} ระดับ`, type: "error" });
      setPriorityToDelete(null);
      return;
    }

    const filtered = priorities.filter((p) => p.id !== priorityToDelete);
    const reindexed = filtered.map((p, idx) => ({ ...p, level: idx + 1 }));
    onUpdatePriorities(reindexed);
    setPriorityToDelete(null);
    if (boardId) {
      await persistPrioritiesToBackend(reindexed);
    }
    toast({ message: "ลบระดับความสำคัญเรียบร้อย", type: "success" });
  };

  const handleResetPriorities = async () => {
    onUpdatePriorities(DEFAULT_PRIORITIES);
    setIsResetPriorityConfirmOpen(false);
    if (boardId) {
      await persistPrioritiesToBackend(DEFAULT_PRIORITIES);
    }
    toast({ message: "รีเซ็ตระดับความสำคัญกลับเป็นค่าเริ่มต้นแล้ว", type: "success" });
  };

  /* -------------------------------------------------------------
     STORY POINTS ACTIONS
  ------------------------------------------------------------- */
  const handleAddStoryPoint = () => {
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
    onUpdateStoryPoints(next);
    saveStoredStoryPoints(next, boardId);
    setNewPointScore("");
    setNewPointTitle("");
    setNewPointDescription("");
    toast({ message: `เพิ่มคะแนนความยาก ⚡${parsed} เรียบร้อย`, type: "success" });
  };

  const handleApplyPreset = (key: keyof typeof STORY_POINT_PRESETS) => {
    const preset = STORY_POINT_PRESETS[key];
    if (!preset) return;
    onUpdateStoryPoints(preset.points);
    saveStoredStoryPoints(preset.points, boardId);
    toast({ message: `ปรับใช้สเกล "${preset.name}" แล้ว`, type: "success" });
  };

  const handleConfirmDeletePoint = () => {
    if (pointToDelete === null) return;
    if (storyPoints.length <= 1) {
      toast({ message: "ต้องมีระดับคะแนนความยากอย่างน้อย 1 ระดับ", type: "error" });
      setPointToDelete(null);
      return;
    }

    const next = storyPoints.filter((p) => p.score !== pointToDelete);
    onUpdateStoryPoints(next);
    saveStoredStoryPoints(next, boardId);
    setPointToDelete(null);
    toast({ message: `ลบคะแนน ⚡${pointToDelete} เรียบร้อย`, type: "success" });
  };

  const handleResetStoryPoints = () => {
    onUpdateStoryPoints(DEFAULT_STORY_POINTS);
    saveStoredStoryPoints(DEFAULT_STORY_POINTS, boardId);
    setIsResetPointsConfirmOpen(false);
    toast({ message: "รีเซ็ตคะแนนความยากกลับเป็นค่าเริ่มต้นแล้ว", type: "success" });
  };

  return (
    <>
      <AppModal
        open={open}
        onClose={onClose}
        className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-500 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                จัดการและแก้ไขคุณสมบัติงาน (Edit Task Attributes)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                ปรับแต่งสถานะ (Status), ระดับความสำคัญ (Priority), และคะแนนความยาก (Story Points)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-stone-200/80 px-5 pt-2 bg-stone-50/50 dark:border-white/10 dark:bg-white/[0.02]">
            <TabsList className="bg-stone-200/60 dark:bg-white/5">
              <TabsTrigger value="status" className="gap-1.5 text-xs">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Status (สถานะ)</span>
              </TabsTrigger>
              <TabsTrigger value="priority" className="gap-1.5 text-xs">
                <Flag className="h-3.5 w-3.5" />
                <span>Priority (ความสำคัญ)</span>
              </TabsTrigger>
              <TabsTrigger value="story-points" className="gap-1.5 text-xs">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Story Points (คะแนน)</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto p-5">
            {/* ── 1. STATUS TAB ── */}
            <TabsContent value="status" className="m-0 space-y-4">
              <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  + เพิ่มสถานะใหม่ (Add Status)
                </h3>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input
                    placeholder="เช่น Review, Testing, Blocked..."
                    value={newStatusLabel}
                    onChange={(e) => setNewStatusLabel(e.target.value)}
                    className="h-9 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
                  />
                  <div className="flex items-center gap-1.5">
                    {STATUS_COLOR_KEYS.map((colKey) => (
                      <button
                        key={colKey}
                        type="button"
                        onClick={() => setNewStatusColor(colKey)}
                        className={cn(
                          "h-6 w-6 rounded-full border transition cursor-pointer flex items-center justify-center",
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
                  <Button type="button" size="sm" onClick={handleAddStatus} className="h-9 text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    <span>เพิ่มสถานะ</span>
                  </Button>
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>รายการสถานะปัจจุบัน ({statuses.length} รายการ)</span>
                  <button
                    type="button"
                    onClick={() => setIsResetStatusConfirmOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
                  </button>
                </div>

                <div className="divide-y divide-stone-200/80 rounded-xl border border-stone-200/80 bg-white overflow-hidden dark:divide-white/5 dark:border-white/10 dark:bg-stone-900/50">
                  {statuses.map((st) => {
                    const cfg = STATUS_COLOR_CONFIGS[st.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
                    const isDefault = st.isDefault || ["TODO", "DOING", "WAITING", "DONE"].includes(st.value);

                    return (
                      <div key={st.value} className="flex items-center justify-between p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={cn("px-2.5 py-1 rounded-md border font-semibold text-[11px]", cfg.badgeClass)}>
                            {st.label}
                          </span>
                          <span className="font-mono text-[11px] text-stone-400">({st.value})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDefault ? (
                            <span className="text-[10px] text-stone-400 bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded">
                              ระบบ
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setStatusToDelete(st.value)}
                              className="text-stone-400 hover:text-red-500 p-1 transition cursor-pointer"
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
            </TabsContent>

            {/* ── 2. PRIORITY TAB ── */}
            <TabsContent value="priority" className="m-0 space-y-4">
              <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  + เพิ่มระดับความสำคัญ (Add Priority Level)
                </h3>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input
                    placeholder={`เช่น P${priorities.length}, Blocker, ด่วนพิเศษ...`}
                    value={newPriorityLabel}
                    onChange={(e) => setNewPriorityLabel(e.target.value)}
                    className="h-9 text-xs"
                    onKeyDown={(e) => e.key === "Enter" && handleAddPriority()}
                  />
                  <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                    {Object.entries(PRIORITY_COLOR_OPTIONS).slice(0, 8).map(([colorKey, cfg]) => (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setNewPriorityColor(colorKey)}
                        className={cn(
                          "h-5 w-5 rounded-full border transition cursor-pointer flex items-center justify-center",
                          cfg.swatchClass,
                          newPriorityColor === colorKey
                            ? "ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-xs"
                            : "opacity-70 hover:opacity-100"
                        )}
                        title={cfg.name}
                      >
                        {newPriorityColor === colorKey && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddPriority}
                    disabled={priorities.length >= MAX_BOARD_PRIORITIES}
                    className="h-9 text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>เพิ่มระดับ</span>
                  </Button>
                </div>
              </div>

              {/* Priorities List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>ระดับความสำคัญ (ระดับ 1 เร่งด่วนสุด)</span>
                  <button
                    type="button"
                    onClick={() => setIsResetPriorityConfirmOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
                  </button>
                </div>

                <div className="divide-y divide-stone-200/80 rounded-xl border border-stone-200/80 bg-white overflow-hidden dark:divide-white/5 dark:border-white/10 dark:bg-stone-900/50">
                  {priorities.map((item, idx) => {
                    const cfg = getPriorityColorConfig(item.color);

                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-stone-400 w-5">#{item.level}</span>
                          <span className={cn("px-2.5 py-1 rounded-md border font-semibold text-[11px] flex items-center gap-1.5", cfg.pillClass)}>
                            <span className={cn("h-2 w-2 rounded-full", cfg.dotClass)} />
                            <span>{item.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMovePriority(idx, "up")}
                            className="p-1 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                            title="เลื่อนขึ้น (เร่งด่วนกว่าเดิม)"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === priorities.length - 1}
                            onClick={() => handleMovePriority(idx, "down")}
                            className="p-1 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                            title="เลื่อนลง (เร่งด่วนน้อยลง)"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={priorities.length <= MIN_BOARD_PRIORITIES}
                            onClick={() => setPriorityToDelete(item.id)}
                            className="p-1 text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer ml-1"
                            title="ลบระดับนี้"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ── 3. STORY POINTS TAB ── */}
            <TabsContent value="story-points" className="m-0 space-y-4">
              {/* Presets Row */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  สลับสเกลคะแนนด่วน (Quick Presets)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("retzlo")}
                    className="p-2 rounded-lg border border-stone-200/80 bg-stone-50 hover:border-indigo-300 text-left transition cursor-pointer dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender"
                  >
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Retzlo Standard</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">1, 3, 5, 8, 16, 21</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("fibonacci")}
                    className="p-2 rounded-lg border border-stone-200/80 bg-stone-50 hover:border-indigo-300 text-left transition cursor-pointer dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender"
                  >
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Fibonacci</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">1, 2, 3, 5, 8, 13, 21</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("linear")}
                    className="p-2 rounded-lg border border-stone-200/80 bg-stone-50 hover:border-indigo-300 text-left transition cursor-pointer dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender"
                  >
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Linear / ชั่วโมง</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">1h, 2h, 4h, 8h, 16h...</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("tshirt")}
                    className="p-2 rounded-lg border border-stone-200/80 bg-stone-50 hover:border-indigo-300 text-left transition cursor-pointer dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender"
                  >
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">T-Shirt Sizes</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">XS, S, M, L, XL, XXL</p>
                  </button>
                </div>
              </div>

              {/* Add Custom Point Form */}
              <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  + เพิ่มระดับคะแนนความยาก (Add Custom Point)
                </h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">คะแนน (Points)</label>
                    <Input
                      type="number"
                      placeholder="เช่น 2, 10, 13..."
                      value={newPointScore}
                      onChange={(e) => setNewPointScore(e.target.value)}
                      className="h-9 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">ชื่อระดับ (Label)</label>
                    <Input
                      placeholder="เช่น ง่ายพิเศษ, ปานกลาง..."
                      value={newPointTitle}
                      onChange={(e) => setNewPointTitle(e.target.value)}
                      className="h-9 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">คำอธิบายเวลา</label>
                    <Input
                      placeholder="เช่น 2-3 ชั่วโมง..."
                      value={newPointDescription}
                      onChange={(e) => setNewPointDescription(e.target.value)}
                      className="h-9 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-400 mr-1">สี:</span>
                    {STORY_POINT_COLOR_KEYS.map((colKey) => (
                      <button
                        key={colKey}
                        type="button"
                        onClick={() => setNewPointColor(colKey)}
                        className={cn(
                          "h-5 w-5 rounded-full border transition cursor-pointer flex items-center justify-center",
                          colKey === "emerald" && "bg-emerald-500 border-emerald-600",
                          colKey === "cyan" && "bg-cyan-500 border-cyan-600",
                          colKey === "amber" && "bg-amber-500 border-amber-600",
                          colKey === "orange" && "bg-orange-500 border-orange-600",
                          colKey === "rose" && "bg-rose-500 border-rose-600",
                          colKey === "purple" && "bg-purple-500 border-purple-600",
                          colKey === "indigo" && "bg-indigo-500 border-indigo-600",
                          newPointColor === colKey
                            ? "ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-xs"
                            : "opacity-70 hover:opacity-100"
                        )}
                        title={colKey}
                      >
                        {newPointColor === colKey && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>

                  <Button type="button" size="sm" onClick={handleAddStoryPoint} className="h-8 text-xs gap-1">
                    <Plus className="h-3 w-3" />
                    <span>เพิ่มคะแนน</span>
                  </Button>
                </div>
              </div>

              {/* Points List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>ระดับคะแนนความยากที่เปิดใช้งาน ({storyPoints.length} ระดับ)</span>
                  <button
                    type="button"
                    onClick={() => setIsResetPointsConfirmOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
                  </button>
                </div>

                <div className="divide-y divide-stone-200/80 rounded-xl border border-stone-200/80 bg-white overflow-hidden dark:divide-white/5 dark:border-white/10 dark:bg-stone-900/50">
                  {storyPoints.map((pt) => {
                    const colorCls = STORY_POINT_COLOR_CLASSES[pt.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;

                    return (
                      <div key={pt.score} className="flex items-center justify-between p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={cn("h-7 px-2.5 rounded-md border font-bold flex items-center justify-center gap-0.5", colorCls.activeChipClass)}>
                            ⚡{pt.score}
                          </span>
                          <div>
                            <p className="font-bold text-stone-900 dark:text-stone-100">{pt.title}</p>
                            {pt.description && (
                              <p className="text-[11px] text-stone-400">{pt.description}</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={storyPoints.length <= 1}
                          onClick={() => setPointToDelete(pt.score)}
                          className="text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none p-1 transition cursor-pointer"
                          title="ลบระดับคะแนนนี้"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Modal Footer */}
        <div className="border-t border-stone-200/80 px-5 py-3 flex justify-end bg-stone-50/50 dark:border-white/10 dark:bg-white/[0.02]">
          <Button type="button" onClick={onClose} className="h-8 text-xs px-4">
            เสร็จสิ้น (Done)
          </Button>
        </div>
      </AppModal>

      {/* Delete Status Confirmation */}
      <ConfirmModal
        open={Boolean(statusToDelete)}
        title="ยืนยันการลบสถานะ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบสถานะ "${statusToDelete}"? การ์ดที่มีสถานะนี้จะไม่ถูกลบ`}
        confirmLabel="ลบสถานะ"
        variant="danger"
        onConfirm={handleConfirmDeleteStatus}
        onClose={() => setStatusToDelete(null)}
      />

      {/* Reset Status Confirmation */}
      <ConfirmModal
        open={isResetStatusConfirmOpen}
        title="รีเซ็ตสถานะเป็นค่าเริ่มต้น"
        message="ต้องการรีเซ็ตสถานะทั้งหมดกลับเป็นค่าเริ่มต้น (Todo, Doing, Waiting, Done) หรือไม่?"
        confirmLabel="รีเซ็ตสถานะ"
        variant="default"
        onConfirm={handleResetStatuses}
        onClose={() => setIsResetStatusConfirmOpen(false)}
      />

      {/* Delete Priority Confirmation */}
      <ConfirmModal
        open={Boolean(priorityToDelete)}
        title="ยืนยันการลบระดับความสำคัญ"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบระดับความสำคัญนี้?"
        confirmLabel="ลบระดับ"
        variant="danger"
        onConfirm={handleConfirmDeletePriority}
        onClose={() => setPriorityToDelete(null)}
      />

      {/* Reset Priority Confirmation */}
      <ConfirmModal
        open={isResetPriorityConfirmOpen}
        title="รีเซ็ตระดับความสำคัญ"
        message="ต้องการรีเซ็ตระดับความสำคัญกลับเป็นค่าเริ่มต้น (High, Medium, Low) หรือไม่?"
        confirmLabel="รีเซ็ตความสำคัญ"
        variant="default"
        onConfirm={handleResetPriorities}
        onClose={() => setIsResetPriorityConfirmOpen(false)}
      />

      {/* Delete Story Point Confirmation */}
      <ConfirmModal
        open={pointToDelete !== null}
        title="ยืนยันการลบคะแนนความยาก"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบคะแนน ⚡${pointToDelete} ออกจากตัวเลือก?`}
        confirmLabel="ลบคะแนน"
        variant="danger"
        onConfirm={handleConfirmDeletePoint}
        onClose={() => setPointToDelete(null)}
      />

      {/* Reset Points Confirmation */}
      <ConfirmModal
        open={isResetPointsConfirmOpen}
        title="รีเซ็ตคะแนนความยาก"
        message="ต้องการรีเซ็ตสเกลคะแนนความยากกลับเป็นค่าเริ่มต้น (1, 3, 5, 8, 16, 21) หรือไม่?"
        confirmLabel="รีเซ็ตคะแนน"
        variant="default"
        onConfirm={handleResetStoryPoints}
        onClose={() => setIsResetPointsConfirmOpen(false)}
      />
    </>
  );
}
