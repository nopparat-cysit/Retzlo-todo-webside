"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Briefcase,
  Bug,
  Check,
  CheckSquare,
  Clock,
  Code2,
  Flag,
  Flame,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Wand2,
  X,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { useToast } from "@/components/ui/toast";
import {
  CustomStatusOption,
  DEFAULT_STATUS_OPTIONS,
  STATUS_COLOR_CONFIGS,
  STATUS_WORKFLOW_TEMPLATES,
  type StatusWorkflowTemplate,
  getStoredStatuses,
  saveStoredStatuses
} from "@/lib/kanban/status";
import {
  CustomStoryPoint,
  DEFAULT_STORY_POINTS,
  STORY_POINT_COLOR_CLASSES,
  STORY_POINT_PRESETS,
  STORY_POINT_WORKFLOW_TEMPLATES,
  type StoryPointWorkflowTemplate,
  getStoredStoryPoints,
  saveStoredStoryPoints
} from "@/lib/kanban/difficulty";
import { BoardPrioritiesTab } from "./board-priorities-tab";
import type { CustomPriority } from "@/types/kanban";
import { cn } from "@/lib/utils";

const STATUS_COLOR_KEYS = ["indigo", "teal", "cyan", "amber", "emerald", "rose", "purple", "stone"] as const;

export interface BoardAttributesTabProps {
  boardId: string;
  canManage?: boolean;
  priorities: CustomPriority[];
  onPrioritiesChange: (priorities: CustomPriority[]) => void;
  initialSubTab?: "status" | "priority" | "story-points";
}

function renderTemplateIcon(icon: string) {
  switch (icon) {
    case "code":
      return <Code2 className="h-3.5 w-3.5 text-indigo-500" />;
    case "target":
      return <Target className="h-3.5 w-3.5 text-rose-500" />;
    case "sparkles":
      return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
    case "bug":
      return <Bug className="h-3.5 w-3.5 text-amber-500" />;
    case "palette":
      return <Palette className="h-3.5 w-3.5 text-teal-500" />;
    case "briefcase":
      return <Briefcase className="h-3.5 w-3.5 text-emerald-500" />;
    case "bookmark":
      return <Bookmark className="h-3.5 w-3.5 text-cyan-500" />;
    default:
      return <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />;
  }
}

function renderStoryPointTemplateIcon(icon: string) {
  switch (icon) {
    case "target":
      return <Target className="h-3.5 w-3.5 text-rose-500" />;
    case "clock":
      return <Clock className="h-3.5 w-3.5 text-indigo-500" />;
    case "sparkles":
      return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
    case "timer":
      return <Timer className="h-3.5 w-3.5 text-rose-500" />;
    case "flame":
      return <Flame className="h-3.5 w-3.5 text-orange-500" />;
    case "bookmark":
      return <Bookmark className="h-3.5 w-3.5 text-cyan-500" />;
    default:
      return <Zap className="h-3.5 w-3.5 text-amber-500" />;
  }
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

  // Template Management State
  const [selectedTemplate, setSelectedTemplate] = useState<StatusWorkflowTemplate | null>(null);
  const [templateApplyMode, setTemplateApplyMode] = useState<"replace" | "append">("replace");
  const [isApplyTemplateConfirmOpen, setIsApplyTemplateConfirmOpen] = useState(false);

  // Custom Saved Templates State
  const [customSavedTemplates, setCustomSavedTemplates] = useState<StatusWorkflowTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("retzlo:custom_status_templates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSaveCustomTemplateOpen, setIsSaveCustomTemplateOpen] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [customTemplateDesc, setCustomTemplateDesc] = useState("");

  // Individual Status Editing State
  const [editingStatusValue, setEditingStatusValue] = useState<string | null>(null);
  const [editingStatusLabel, setEditingStatusLabel] = useState("");
  const [editingStatusColor, setEditingStatusColor] = useState<string>("indigo");
  const [isEditStatusConfirmOpen, setIsEditStatusConfirmOpen] = useState(false);

  // Story Points Tab State
  const [storyPoints, setStoryPoints] = useState<CustomStoryPoint[]>(() => getStoredStoryPoints(boardId));
  const [newPointScore, setNewPointScore] = useState<string>("");
  const [newPointTitle, setNewPointTitle] = useState("");
  const [newPointDescription, setNewPointDescription] = useState("");
  const [newPointColor, setNewPointColor] = useState<string>("cyan");
  const [pointToDelete, setPointToDelete] = useState<CustomStoryPoint | null>(null);
  const [isResetPointsConfirmOpen, setIsResetPointsConfirmOpen] = useState(false);

  // Story Points Template Management State
  const [selectedPointTemplate, setSelectedPointTemplate] = useState<StoryPointWorkflowTemplate | null>(null);
  const [pointTemplateApplyMode, setPointTemplateApplyMode] = useState<"replace" | "append">("replace");
  const [isApplyPointTemplateConfirmOpen, setIsApplyPointTemplateConfirmOpen] = useState(false);

  // Custom Saved Story Point Templates State
  const [customSavedPointTemplates, setCustomSavedPointTemplates] = useState<StoryPointWorkflowTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("retzlo:custom_story_point_templates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSaveCustomPointTemplateOpen, setIsSaveCustomPointTemplateOpen] = useState(false);
  const [customPointTemplateName, setCustomPointTemplateName] = useState("");
  const [customPointTemplateDesc, setCustomPointTemplateDesc] = useState("");

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
    const slug = trimmed.toUpperCase().replace(/\s+/g, "_").slice(0, 30);
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

  const startEditStatus = (st: CustomStatusOption) => {
    setEditingStatusValue(st.value);
    setEditingStatusLabel(st.label);
    setEditingStatusColor(st.color || "indigo");
  };

  const cancelEditStatus = () => {
    setEditingStatusValue(null);
  };

  const handleConfirmEditStatus = () => {
    if (!editingStatusValue || !canManage) return;
    const trimmed = editingStatusLabel.trim();
    if (!trimmed) {
      toast({ message: "กรุณาระบุชื่อสถานะ", type: "error" });
      return;
    }

    const next = statuses.map((st) =>
      st.value === editingStatusValue
        ? { ...st, label: trimmed, color: editingStatusColor }
        : st
    );

    setStatuses(next);
    saveStoredStatuses(next, boardId);
    setIsEditStatusConfirmOpen(false);
    setEditingStatusValue(null);
    toast({ message: `แก้ไขสถานะ "${trimmed}" เรียบร้อย`, type: "success" });
  };

  const handleConfirmDeleteStatus = () => {
    if (!statusToDelete || !canManage) return;
    const item = statuses.find((s) => s.value.toUpperCase() === statusToDelete.toUpperCase());
    const next = statuses.filter((s) => s.value.toUpperCase() !== statusToDelete.toUpperCase());
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
     TEMPLATE ACTIONS
  ------------------------------------------------------------- */
  const allTemplates: StatusWorkflowTemplate[] = [
    ...Object.values(STATUS_WORKFLOW_TEMPLATES),
    ...customSavedTemplates
  ];

  const handleConfirmApplyTemplate = () => {
    if (!selectedTemplate || !canManage) return;

    let nextStatuses: CustomStatusOption[];
    if (templateApplyMode === "replace") {
      nextStatuses = [...selectedTemplate.statuses];
    } else {
      nextStatuses = [...statuses];
      for (const tplStatus of selectedTemplate.statuses) {
        if (!nextStatuses.some((s) => s.value.toUpperCase() === tplStatus.value.toUpperCase())) {
          nextStatuses.push(tplStatus);
        }
      }
    }

    setStatuses(nextStatuses);
    saveStoredStatuses(nextStatuses, boardId);
    setIsApplyTemplateConfirmOpen(false);
    setSelectedTemplate(null);
    toast({
      message: `นำแม่แบบ "${selectedTemplate.name}" มาปรับใช้เรียบร้อย (${nextStatuses.length} สถานะ)`,
      type: "success"
    });
  };

  const handleSaveCustomTemplate = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = customTemplateName.trim();
    if (!trimmedName) {
      toast({ message: "กรุณาระบุชื่อแม่แบบ", type: "error" });
      return;
    }

    const newTemplate: StatusWorkflowTemplate = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      description: customTemplateDesc.trim() || `แม่แบบกำหนดเอง (${statuses.length} สถานะ)`,
      category: "Custom",
      icon: "bookmark",
      statuses: [...statuses]
    };

    const nextTemplates = [...customSavedTemplates, newTemplate];
    setCustomSavedTemplates(nextTemplates);
    try {
      localStorage.setItem("retzlo:custom_status_templates", JSON.stringify(nextTemplates));
    } catch {}

    setIsSaveCustomTemplateOpen(false);
    setCustomTemplateName("");
    setCustomTemplateDesc("");
    toast({ message: `บันทึกแม่แบบ "${trimmedName}" เรียบร้อยแล้ว`, type: "success" });
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
    toast({ message: `เพิ่มคะแนนความยาก ${parsed} เรียบร้อย`, type: "success" });
  };

  const allPointTemplates: StoryPointWorkflowTemplate[] = [
    ...Object.values(STORY_POINT_WORKFLOW_TEMPLATES),
    ...customSavedPointTemplates
  ];

  const handleConfirmApplyPointTemplate = () => {
    if (!selectedPointTemplate || !canManage) return;

    let nextPoints: CustomStoryPoint[];
    if (pointTemplateApplyMode === "replace") {
      nextPoints = [...selectedPointTemplate.points];
    } else {
      nextPoints = [...storyPoints];
      const existingScores = new Set(nextPoints.map((p) => p.score));
      for (const tplPt of selectedPointTemplate.points) {
        if (!existingScores.has(tplPt.score)) {
          nextPoints.push(tplPt);
          existingScores.add(tplPt.score);
        }
      }
    }
    nextPoints = nextPoints.sort((a, b) => a.score - b.score);

    setStoryPoints(nextPoints);
    saveStoredStoryPoints(nextPoints, boardId);
    setIsApplyPointTemplateConfirmOpen(false);
    setSelectedPointTemplate(null);
    toast({
      message: `นำสเกล Story Points "${selectedPointTemplate.name}" มาปรับใช้เรียบร้อย (${nextPoints.length} ระดับคะแนน)`,
      type: "success"
    });
  };

  const handleSaveCustomPointTemplate = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = customPointTemplateName.trim();
    if (!trimmedName) {
      toast({ message: "กรุณาระบุชื่อแม่แบบ", type: "error" });
      return;
    }

    const newTemplate: StoryPointWorkflowTemplate = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      description: customPointTemplateDesc.trim() || `แม่แบบ Story Points กำหนดเอง (${storyPoints.length} ระดับ)`,
      category: "Custom",
      icon: "bookmark",
      points: [...storyPoints]
    };

    const nextTemplates = [...customSavedPointTemplates, newTemplate];
    setCustomSavedPointTemplates(nextTemplates);
    try {
      localStorage.setItem("retzlo:custom_story_point_templates", JSON.stringify(nextTemplates));
    } catch {}

    setIsSaveCustomPointTemplateOpen(false);
    setCustomPointTemplateName("");
    setCustomPointTemplateDesc("");
    toast({ message: `บันทึกสเกล Story Points "${trimmedName}" เรียบร้อยแล้ว`, type: "success" });
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
    if (!pointToDelete || !canManage) return;
    if (storyPoints.length <= 1) {
      toast({ message: "ต้องมีระดับคะแนนความยากอย่างน้อย 1 ระดับ", type: "error" });
      setPointToDelete(null);
      return;
    }

    const targetScore = Number(pointToDelete.score);
    const next = storyPoints.filter(
      (p) => Number(p.score) !== targetScore && p.label !== pointToDelete.label
    );
    setStoryPoints(next);
    saveStoredStoryPoints(next, boardId);
    const deletedLabel = pointToDelete.title || `${pointToDelete.score} pts`;
    setPointToDelete(null);
    toast({ message: `ลบคะแนน "${deletedLabel}" เรียบร้อยแล้ว`, type: "success" });
  };

  const handleResetStoryPoints = () => {
    if (!canManage) return;
    setStoryPoints(DEFAULT_STORY_POINTS);
    saveStoredStoryPoints(DEFAULT_STORY_POINTS, boardId);
    setIsResetPointsConfirmOpen(false);
    toast({ message: "รีเซ็ตคะแนนความยากกลับเป็นค่าเริ่มต้นแล้ว", type: "success" });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Sub-navigation Pills */}
      <div className="flex items-center gap-1 border-b border-stone-200/70 pb-2.5 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveSubTab("status")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "status"
              ? "bg-indigo-50 text-indigo-700 font-bold dark:bg-dusk-lavender/15 dark:text-dusk-lavender"
              : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
          )}
        >
          <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
          <span>สถานะการ์ด (Status)</span>
          <span className="rounded-full bg-indigo-500/10 px-1.5 text-[10px] font-mono text-indigo-600 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
            {statuses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("priority")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "priority"
              ? "bg-rose-50 text-rose-700 font-bold dark:bg-rose-500/15 dark:text-rose-400"
              : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
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
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "story-points"
              ? "bg-amber-50 text-amber-700 font-bold dark:bg-amber-500/15 dark:text-amber-400"
              : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
          )}
        >
          <Zap className="h-4 w-4" />
          <span>Story Points</span>
          <span className="rounded-full bg-amber-500/10 px-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
            {storyPoints.length}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: STATUS & TEMPLATES
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "status" && (
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
                <span>Custom Card Statuses (จัดการและตกแต่งสถานะการ์ด)</span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                เลือกแม่แบบสถานะสำเร็จรูป ปรับแต่งสีและชื่อ หรือเพิ่มสถานะใหม่ เชื่อมโยงสดกับทุกมุมมองบนบอร์ดนี้
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsResetStatusConfirmOpen(true)}
              disabled={!canManage}
              className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-stone-200/80 bg-stone-50/60 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>รีเซ็ตค่าเริ่มต้น</span>
            </button>
          </div>

          {/* 1. Quick Status Workflow Templates Bar */}
          <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/20 p-3.5 dark:border-dusk-lavender/20 dark:bg-ink-950/40 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Wand2 className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  แม่แบบสถานะสำเร็จรูป (Workflow Templates)
                </span>
                <span className="rounded-full bg-indigo-100/70 border border-indigo-200/60 px-2 py-0.2 text-[9px] font-semibold text-indigo-700 dark:bg-dusk-lavender/15 dark:border-dusk-lavender/30 dark:text-dusk-lavender">
                  เลือกดู &amp; ปรับใช้
                </span>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsSaveCustomTemplateOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-dusk-lavender dark:hover:underline self-start sm:self-auto cursor-pointer"
                >
                  <Bookmark className="h-3 w-3" />
                  <span>+ บันทึกชุดนี้เป็นแม่แบบ</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-soft">
              {allTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-900 shrink-0 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-200 dark:hover:border-dusk-lavender/50 dark:hover:bg-dusk-lavender/10 cursor-pointer"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300">
                    {renderTemplateIcon(tpl.icon)}
                  </span>
                  <span>{tpl.name}</span>
                  <span className="rounded-full bg-stone-100 px-1.5 py-0.2 font-mono text-[10px] text-stone-500 dark:bg-white/10 dark:text-stone-400">
                    {tpl.statuses.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Add Status Inline Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 dark:border-white/10 dark:bg-white/[0.02]">
            <Input
              placeholder="พิมพ์ชื่อสถานะใหม่ เช่น In Review, Testing, Blocked..."
              value={newStatusLabel}
              onChange={(e) => setNewStatusLabel(e.target.value)}
              disabled={!canManage}
              className="h-8 text-xs flex-1 min-w-[160px] bg-white dark:bg-stone-900"
              onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
            />
            <div className="flex items-center gap-1.5 px-1 overflow-x-auto py-0.5">
              {STATUS_COLOR_KEYS.map((colKey) => (
                <button
                  key={colKey}
                  type="button"
                  disabled={!canManage}
                  onClick={() => setNewStatusColor(colKey)}
                  className={cn(
                    "h-5 w-5 rounded-full border transition cursor-pointer flex items-center justify-center shrink-0",
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
                  {newStatusColor === colKey && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
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

          {/* 3. Decorated Status List */}
          <div className="rounded-xl border border-stone-200/70 bg-white shadow-2xs divide-y divide-stone-100 max-h-[340px] overflow-y-auto scrollbar-soft dark:border-white/10 dark:bg-stone-900/40 dark:divide-white/5">
            {statuses.map((st, index) => {
              const cfg = STATUS_COLOR_CONFIGS[st.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
              const isDefault = st.isDefault || ["TODO", "DOING", "WAITING", "DONE"].includes(st.value);
              const isFirst = index === 0;
              const isLast = index === statuses.length - 1;
              const isEditingThis = editingStatusValue === st.value;

              if (isEditingThis) {
                return (
                  <div
                    key={st.value}
                    className="p-3 bg-indigo-50/30 dark:bg-ink-950/50 space-y-2.5 border-l-4 border-indigo-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Pencil className="h-3 w-3 text-indigo-500" />
                        <span>แก้ไขสถานะ: {st.value}</span>
                      </span>
                      <button
                        type="button"
                        onClick={cancelEditStatus}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Input
                        value={editingStatusLabel}
                        onChange={(e) => setEditingStatusLabel(e.target.value)}
                        className="h-8 text-xs flex-1 bg-white dark:bg-stone-900"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5 py-1">
                        {STATUS_COLOR_KEYS.map((colKey) => (
                          <button
                            key={colKey}
                            type="button"
                            onClick={() => setEditingStatusColor(colKey)}
                            className={cn(
                              "h-5 w-5 rounded-full border transition cursor-pointer flex items-center justify-center shrink-0",
                              editingStatusColor === colKey
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
                            {editingStatusColor === colKey && (
                              <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={cancelEditStatus}
                          className="h-8 text-xs px-2.5 cursor-pointer"
                        >
                          ยกเลิก
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!editingStatusLabel.trim()}
                          onClick={() => setIsEditStatusConfirmOpen(true)}
                          className="h-8 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>บันทึก</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={st.value}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-stone-50/60 dark:hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid h-5 w-5 place-items-center rounded font-mono text-[10px] text-stone-400 bg-stone-100 dark:bg-white/5 shrink-0">
                      {index + 1}
                    </span>
                    <span className={cn("px-2.5 py-0.5 rounded-md border font-semibold text-xs truncate", cfg.badgeClass)}>
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
                      className="grid h-7 w-7 place-items-center rounded-md border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 cursor-pointer"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStatus(index, "down")}
                      disabled={isLast || !canManage}
                      className="grid h-7 w-7 place-items-center rounded-md border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 cursor-pointer"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Edit status */}
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => startEditStatus(st)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-stone-200/80 bg-white text-stone-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:text-dusk-lavender cursor-pointer"
                        title="แก้ไขสถานะ"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}

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
                        className="grid h-7 w-7 place-items-center rounded-md border border-red-200/80 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 cursor-pointer"
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
        <div className="space-y-3.5">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Story Points Scale (สเกลคะแนนความยาก)</span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                ประเมินน้ำหนักงาน (Effort) ด้วยสเกลยอดนิยม หรือกำหนดคะแนนเอง
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsResetPointsConfirmOpen(true)}
              disabled={!canManage}
              className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-stone-200/80 bg-stone-50/60 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>รีเซ็ต Story Points</span>
            </button>
          </div>

          {/* Quick Story Points Workflow Templates Bar */}
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/20 p-3.5 dark:border-amber-400/20 dark:bg-ink-950/40 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Wand2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  แม่แบบสเกลคะแนนสำเร็จรูป (Story Point Templates)
                </span>
                <span className="rounded-full bg-amber-100/70 border border-amber-200/60 px-2 py-0.2 text-[9px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:border-amber-400/30 dark:text-amber-300">
                  เลือกดู &amp; ปรับใช้
                </span>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsSaveCustomPointTemplateOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:underline self-start sm:self-auto cursor-pointer"
                >
                  <Bookmark className="h-3 w-3" />
                  <span>+ บันทึกสเกลนี้เป็นแม่แบบ</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-soft">
              {allPointTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedPointTemplate(tpl)}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs transition hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900 shrink-0 dark:border-white/10 dark:bg-white/[0.035] dark:text-stone-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/10 cursor-pointer"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300">
                    {renderStoryPointTemplateIcon(tpl.icon)}
                  </span>
                  <span>{tpl.name}</span>
                  <span className="rounded-full bg-stone-100 px-1.5 py-0.2 font-mono text-[10px] text-stone-500 dark:bg-white/10 dark:text-stone-400">
                    {tpl.points.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Point Inline Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 dark:border-white/10 dark:bg-white/[0.02]">
            <Input
              type="number"
              min={1}
              max={100}
              placeholder="คะแนน"
              value={newPointScore}
              onChange={(e) => setNewPointScore(e.target.value)}
              disabled={!canManage}
              className="h-8 w-20 text-xs font-mono font-bold bg-white dark:bg-stone-900"
            />
            <Input
              placeholder="ชื่อเรียก เช่น ปานกลาง (5 pts)"
              value={newPointTitle}
              onChange={(e) => setNewPointTitle(e.target.value)}
              disabled={!canManage}
              className="h-8 text-xs flex-1 min-w-[120px] bg-white dark:bg-stone-900"
            />
            <Input
              placeholder="คำอธิบาย เช่น งาน 1 วัน"
              value={newPointDescription}
              onChange={(e) => setNewPointDescription(e.target.value)}
              disabled={!canManage}
              className="h-8 text-xs flex-1 min-w-[120px] bg-white dark:bg-stone-900"
              onKeyDown={(e) => e.key === "Enter" && handleAddStoryPoint()}
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

          {/* Story Points List */}
          <div className="rounded-xl border border-stone-200/70 bg-white shadow-2xs divide-y divide-stone-100 max-h-[300px] overflow-y-auto dark:border-white/10 dark:bg-stone-900/40 dark:divide-white/5">
            {storyPoints.map((pt) => {
              const colorConfig = STORY_POINT_COLOR_CLASSES[pt.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;

              return (
                <div
                  key={pt.score}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-stone-50/60 dark:hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-lg border font-mono text-xs font-bold shrink-0",
                        colorConfig.badgeClass
                      )}
                    >
                      {pt.score}
                    </span>
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                        {pt.title || `${pt.score} pts`}
                      </span>
                      {pt.description && (
                        <span className="text-[11px] text-stone-400 truncate">{pt.description}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPointToDelete(pt)}
                    disabled={!canManage || storyPoints.length <= 1}
                    className="grid h-7 w-7 place-items-center rounded-md border border-red-200/80 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 cursor-pointer shrink-0"
                    title="ลบคะแนน"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Live Preview Section */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-amber-500" />
              <span>ตัวอย่างการแสดงผลคะแนนความยาก (Story Points):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {storyPoints.map((pt) => {
                const config = STORY_POINT_COLOR_CLASSES[pt.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;
                return (
                  <div
                    key={pt.score}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-2xs",
                      config.badgeClass
                    )}
                  >
                    <span className="font-mono text-[10px] opacity-80">{pt.score} pts</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{pt.title || `${pt.score} pts`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TEMPLATE PREVIEW & APPLY MODAL
         ───────────────────────────────────────────────────────────── */}
      {selectedTemplate && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedTemplate(null)}
            />
            <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-ink-950 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-dusk-lavender/15 dark:text-dusk-lavender">
                    {renderTemplateIcon(selectedTemplate.icon)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {selectedTemplate.name}
                      </h3>
                      <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.2 text-[10px] font-bold text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                        {selectedTemplate.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-md p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status Flow Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  ขั้นตอนงานในแม่แบบนี้ ({selectedTemplate.statuses.length} สถานะ):
                </span>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-stone-200/80 bg-stone-50/70 dark:border-white/10 dark:bg-white/[0.02]">
                  {selectedTemplate.statuses.map((s, idx) => {
                    const cfg = STATUS_COLOR_CONFIGS[s.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
                    return (
                      <div key={s.value} className="flex items-center gap-1.5">
                        <span className={cn("px-2.5 py-1 rounded-lg border font-bold text-xs shadow-2xs", cfg.badgeClass)}>
                          {s.label}
                        </span>
                        {idx < selectedTemplate.statuses.length - 1 && (
                          <span className="text-stone-400 text-xs">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Apply Mode Selector */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  รูปแบบการปรับใช้:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateApplyMode("replace")}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer",
                      templateApplyMode === "replace"
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:border-dusk-lavender dark:bg-dusk-lavender/10"
                        : "border-stone-200 bg-white hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
                    )}
                  >
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      แทนที่ทั้งหมด (Replace)
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      แทนที่สถานะเดิมด้วยชุดใหม่นี้
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateApplyMode("append")}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer",
                      templateApplyMode === "append"
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:border-dusk-lavender dark:bg-dusk-lavender/10"
                        : "border-stone-200 bg-white hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
                    )}
                  >
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      เพิ่มต่อท้าย (Append)
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      เก็บสถานะเดิม และเพิ่มเฉพาะสถานะใหม่
                    </span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                  className="text-xs"
                >
                  ปิด
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsApplyTemplateConfirmOpen(true)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  นำแม่แบบนี้มาใช้
                </Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SAVE AS CUSTOM TEMPLATE MODAL
         ───────────────────────────────────────────────────────────── */}
      {isSaveCustomTemplateOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSaveCustomTemplateOpen(false)}
            />
            <form
              onSubmit={handleSaveCustomTemplate}
              className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-ink-950 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    บันทึกขั้นตอนงานเป็นแม่แบบส่วนตัว
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSaveCustomTemplateOpen(false)}
                  className="rounded-md p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    ชื่อแม่แบบ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="เช่น ทีมคอนเทนต์ประจำสัปดาห์, โฟลว์ทดสอบระบบ..."
                    value={customTemplateName}
                    onChange={(e) => setCustomTemplateName(e.target.value)}
                    maxLength={50}
                    autoFocus
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    คำอธิบายสั้นๆ (ไม่บังคับ)
                  </label>
                  <Input
                    placeholder="อธิบายว่าแม่แบบนี้เหมาะกับงานแบบไหน..."
                    value={customTemplateDesc}
                    onChange={(e) => setCustomTemplateDesc(e.target.value)}
                    maxLength={100}
                    className="text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl border border-stone-200/80 bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    จะบันทึกสถานะปัจจุบันทั้งหมด {statuses.length} รายการเป็นแม่แบบสำหรับนำไปใช้กับบอร์ดอื่นได้อย่างรวดเร็ว
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSaveCustomTemplateOpen(false)}
                  className="text-xs"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!customTemplateName.trim()}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  บันทึกแม่แบบ
                </Button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STORY POINT TEMPLATE PREVIEW & APPLY MODAL
         ───────────────────────────────────────────────────────────── */}
      {selectedPointTemplate && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedPointTemplate(null)}
            />
            <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-ink-950 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                    {renderStoryPointTemplateIcon(selectedPointTemplate.icon)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {selectedPointTemplate.name}
                      </h3>
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.2 text-[10px] font-bold text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300">
                        {selectedPointTemplate.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {selectedPointTemplate.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPointTemplate(null)}
                  className="rounded-md p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Point Scales Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  สเกลคะแนนในแม่แบบนี้ ({selectedPointTemplate.points.length} ระดับ):
                </span>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-stone-200/80 bg-stone-50/70 dark:border-white/10 dark:bg-white/[0.02]">
                  {selectedPointTemplate.points.map((pt, idx) => {
                    const cfg = STORY_POINT_COLOR_CLASSES[pt.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;
                    return (
                      <div key={pt.score} className="flex items-center gap-1.5">
                        <span className={cn("px-2.5 py-1 rounded-lg border font-bold text-xs shadow-2xs flex items-center gap-1.5", cfg.badgeClass)}>
                          <span className="font-mono text-[10px] opacity-80">{pt.score} pts</span>
                          <span>•</span>
                          <span className="truncate max-w-[100px]">{pt.title || `${pt.score} pts`}</span>
                        </span>
                        {idx < selectedPointTemplate.points.length - 1 && (
                          <span className="text-stone-400 text-xs">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Apply Mode Selector */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  รูปแบบการปรับใช้:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPointTemplateApplyMode("replace")}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer",
                      pointTemplateApplyMode === "replace"
                        ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 dark:border-amber-400 dark:bg-amber-500/10"
                        : "border-stone-200 bg-white hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
                    )}
                  >
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      แทนที่ทั้งหมด (Replace)
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      แทนที่สเกลคะแนนเดิมด้วยชุดใหม่นี้
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPointTemplateApplyMode("append")}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer",
                      pointTemplateApplyMode === "append"
                        ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 dark:border-amber-400 dark:bg-amber-500/10"
                        : "border-stone-200 bg-white hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
                    )}
                  >
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      เพิ่มต่อท้าย (Append)
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      เก็บสเกลเดิม และรวมเฉพาะคะแนนใหม่
                    </span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPointTemplate(null)}
                  className="text-xs cursor-pointer"
                >
                  ปิด
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsApplyPointTemplateConfirmOpen(true)}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer"
                >
                  นำสเกลนี้มาใช้
                </Button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SAVE AS CUSTOM STORY POINT SCALE MODAL
         ───────────────────────────────────────────────────────────── */}
      {isSaveCustomPointTemplateOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSaveCustomPointTemplateOpen(false)}
            />
            <form
              onSubmit={handleSaveCustomPointTemplate}
              className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-ink-950 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    บันทึกสเกลคะแนนเป็นแม่แบบส่วนตัว
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSaveCustomPointTemplateOpen(false)}
                  className="rounded-md p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    ชื่อสเกลแม่แบบ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="เช่น สเกลประเมินงาน Backend, สเกลทีม Design..."
                    value={customPointTemplateName}
                    onChange={(e) => setCustomPointTemplateName(e.target.value)}
                    maxLength={50}
                    autoFocus
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    คำอธิบายสั้นๆ (ไม่บังคับ)
                  </label>
                  <Input
                    placeholder="อธิบายว่าสเกลนี้เหมาะกับรูปแบบงานแบบไหน..."
                    value={customPointTemplateDesc}
                    onChange={(e) => setCustomPointTemplateDesc(e.target.value)}
                    maxLength={100}
                    className="text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl border border-stone-200/80 bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    จะบันทึกสเกล Story Points ปัจจุบันทั้งหมด {storyPoints.length} ระดับเป็นแม่แบบส่วนตัวสำหรับนำไปใช้กับบอร์ดอื่นได้อย่างรวดเร็ว
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSaveCustomPointTemplateOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!customPointTemplateName.trim()}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer"
                >
                  บันทึกแม่แบบ
                </Button>
              </div>
            </form>
          </div>
        </ModalPortal>
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
        open={isApplyTemplateConfirmOpen}
        title="ยืนยันการนำแม่แบบสถานะมาใช้"
        message={`คุณต้องการนำแม่แบบ "${selectedTemplate?.name}" (${templateApplyMode === "replace" ? "แทนที่ทั้งหมด" : "เพิ่มต่อท้าย"}) มาปรับใช้กับบอร์ดนี้ใช่หรือไม่?`}
        confirmLabel="นำแม่แบบมาใช้"
        variant="default"
        onClose={() => setIsApplyTemplateConfirmOpen(false)}
        onConfirm={handleConfirmApplyTemplate}
      />

      <ConfirmModal
        open={isEditStatusConfirmOpen}
        title="ยืนยันการแก้ไขสถานะ"
        message={`คุณต้องการบันทึกการแก้ไขของสถานะ "${editingStatusLabel}" ใช่หรือไม่?`}
        confirmLabel="บันทึก"
        variant="default"
        onClose={() => setIsEditStatusConfirmOpen(false)}
        onConfirm={handleConfirmEditStatus}
      />

      <ConfirmModal
        open={pointToDelete !== null}
        title="ยืนยันการลบ Story Points"
        message={`ต้องการลบคะแนน "${pointToDelete?.title || `${pointToDelete?.score} pts`}" ออกจากรายการใช่หรือไม่?`}
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

      <ConfirmModal
        open={isApplyPointTemplateConfirmOpen}
        title="ยืนยันการนำแม่แบบ Story Points มาใช้"
        message={`คุณต้องการนำสเกลแม่แบบ "${selectedPointTemplate?.name}" (${pointTemplateApplyMode === "replace" ? "แทนที่ทั้งหมด" : "เพิ่มต่อท้าย"}) มาปรับใช้กับบอร์ดนี้ใช่หรือไม่?`}
        confirmLabel="นำสเกลมาใช้"
        variant="default"
        onClose={() => setIsApplyPointTemplateConfirmOpen(false)}
        onConfirm={handleConfirmApplyPointTemplate}
      />
    </div>
  );
}
