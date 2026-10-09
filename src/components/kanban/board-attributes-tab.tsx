"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  Eye,
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

interface MockupSampleCard {
  code: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  priorityLabel: string;
  checklist: string;
  dueDate: string;
  assignee: string;
}

function getMockupSampleCards(status: CustomStatusOption, index: number): MockupSampleCard[] {
  const norm = (status.label || status.value).toLowerCase();

  if (
    norm.includes("backlog") ||
    norm.includes("new") ||
    norm.includes("todo") ||
    norm.includes("plan") || norm.includes("backlog") ||
    norm.includes("pending") || norm.includes("waiting")
  ) {
    return [
      {
        code: `TSK-${100 + index * 10 + 1}`,
        title: "Design user permissions and wireframes",
        priority: "HIGH",
        priorityLabel: "High",
        checklist: "1/4",
        dueDate: "Oct 14",
        assignee: "NP"
      },
      {
        code: `TSK-${100 + index * 10 + 2}`,
        title: "Gather user requirements and write specification",
        priority: "MEDIUM",
        priorityLabel: "Medium",
        checklist: "2/3",
        dueDate: "Oct 18",
        assignee: "AI"
      }
    ];
  }

  if (
    norm.includes("doing") ||
    norm.includes("progress") ||
    norm.includes("dev") || norm.includes("develop") ||
    norm.includes("doing") || norm.includes("progress") ||
    norm.includes("work")
  ) {
    return [
      {
        code: `DEV-${200 + index * 10 + 1}`,
        title: "Connect REST API and structure board state",
        priority: "HIGH",
        priorityLabel: "High",
        checklist: "3/5",
        dueDate: "Today",
        assignee: "DEV"
      },
      {
        code: `DEV-${200 + index * 10 + 2}`,
        title: "Refine responsive layout and column UX",
        priority: "MEDIUM",
        priorityLabel: "Medium",
        checklist: "2/2",
        dueDate: "Tomorrow",
        assignee: "NP"
      }
    ];
  }

  if (
    norm.includes("review") ||
    norm.includes("test") ||
    norm.includes("qa") ||
    norm.includes("test") || norm.includes("review") ||
    norm.includes("wait") ||
    norm.includes("qa") || norm.includes("audit")
  ) {
    return [
      {
        code: `QA-${300 + index * 10 + 1}`,
        title: "Run unit tests and security vulnerability scans",
        priority: "HIGH",
        priorityLabel: "High",
        checklist: "4/4",
        dueDate: "Oct 12",
        assignee: "QA"
      },
      {
        code: `REV-${300 + index * 10 + 2}`,
        title: "Code review architecture and component design",
        priority: "LOW",
        priorityLabel: "Low",
        checklist: "1/2",
        dueDate: "Oct 15",
        assignee: "LD"
      }
    ];
  }

  if (
    norm.includes("done") ||
    norm.includes("complete") ||
    norm.includes("done") || norm.includes("closed") ||
    norm.includes("release") ||
    norm.includes("complete") || norm.includes("released")
  ) {
    return [
      {
        code: `REL-${400 + index * 10 + 1}`,
        title: "Deploy board management to production server",
        priority: "MEDIUM",
        priorityLabel: "Medium",
        checklist: "6/6",
        dueDate: "Completed",
        assignee: "OPS"
      }
    ];
  }

  return [
    {
      code: `TSK-${500 + index * 10 + 1}`,
      title: `Track and execute workflow stage: ${status.label}`,
      priority: index % 2 === 0 ? "HIGH" : "MEDIUM",
      priorityLabel: index % 2 === 0 ? "High" : "Medium",
      checklist: "2/3",
      dueDate: "Oct 16",
      assignee: "US"
    }
  ];
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

  // Template Management & Live Preview State
  const [previewStatusTemplate, setPreviewStatusTemplate] = useState<StatusWorkflowTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StatusWorkflowTemplate | null>(null);
  const [templateApplyMode, setTemplateApplyMode] = useState<"replace" | "append">("replace");
  const [isApplyTemplateConfirmOpen, setIsApplyTemplateConfirmOpen] = useState(false);
  const [mockupColumnFilter, setMockupColumnFilter] = useState<string>("all");

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

  // Story Points Template Management & Live Preview State
  const [previewPointTemplate, setPreviewPointTemplate] = useState<StoryPointWorkflowTemplate | null>(null);
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
      toast({ message: "Please specify a status name", type: "error" });
      return;
    }
    const slug = trimmed.toUpperCase().replace(/\s+/g, "_").slice(0, 30);
    const exists = statuses.some((s) => s.value.toUpperCase() === slug);
    if (exists) {
      toast({ message: "This status already exists", type: "error" });
      return;
    }

    const next: CustomStatusOption[] = [
      ...statuses,
      { value: slug, label: trimmed, color: newStatusColor }
    ];
    setStatuses(next);
    saveStoredStatuses(next, boardId);
    setNewStatusLabel("");
    toast({ message: `Status "${trimmed}" added successfully`, type: "success" });
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
    toast({ message: "Status order updated successfully", type: "success" });
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
      toast({ message: "Please specify a status name", type: "error" });
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
    toast({ message: `Status "${trimmed}" updated successfully`, type: "success" });
  };

  const handleConfirmDeleteStatus = () => {
    if (!statusToDelete || !canManage) return;
    const item = statuses.find((s) => s.value.toUpperCase() === statusToDelete.toUpperCase());
    const next = statuses.filter((s) => s.value.toUpperCase() !== statusToDelete.toUpperCase());
    setStatuses(next);
    saveStoredStatuses(next, boardId);
    setStatusToDelete(null);
    toast({ message: `Status "${item?.label || statusToDelete}" deleted`, type: "success" });
  };

  const handleResetStatuses = () => {
    if (!canManage) return;
    setStatuses(DEFAULT_STATUS_OPTIONS);
    saveStoredStatuses(DEFAULT_STATUS_OPTIONS, boardId);
    setIsResetStatusConfirmOpen(false);
    toast({ message: "Status reset to default successfully", type: "success" });
  };

  /* -------------------------------------------------------------
     TEMPLATE ACTIONS
  ------------------------------------------------------------- */
  const allTemplates: StatusWorkflowTemplate[] = [
    ...Object.values(STATUS_WORKFLOW_TEMPLATES),
    ...customSavedTemplates
  ];

  const displayedStatuses = previewStatusTemplate ? previewStatusTemplate.statuses : statuses;

  const displayedMockupStatuses = useMemo(() => {
    if (!previewStatusTemplate) return [];
    if (mockupColumnFilter === "all") return previewStatusTemplate.statuses;
    return previewStatusTemplate.statuses.filter((st) => st.value === mockupColumnFilter);
  }, [previewStatusTemplate, mockupColumnFilter]);

  const handleSelectStatusTemplate = (tpl: StatusWorkflowTemplate) => {
    if (previewStatusTemplate?.id === tpl.id) {
      setPreviewStatusTemplate(null);
      setSelectedTemplate(null);
      setMockupColumnFilter("all");
    } else {
      setPreviewStatusTemplate(tpl);
      setSelectedTemplate(tpl);
      setMockupColumnFilter("all");
    }
  };

  const handleConfirmApplyTemplate = () => {
    const tpl = selectedTemplate || previewStatusTemplate;
    if (!tpl || !canManage) return;

    let nextStatuses: CustomStatusOption[];
    if (templateApplyMode === "replace") {
      nextStatuses = [...tpl.statuses];
    } else {
      nextStatuses = [...statuses];
      for (const tplStatus of tpl.statuses) {
        if (!nextStatuses.some((s) => s.value.toUpperCase() === tplStatus.value.toUpperCase())) {
          nextStatuses.push(tplStatus);
        }
      }
    }

    setStatuses(nextStatuses);
    saveStoredStatuses(nextStatuses, boardId);
    setIsApplyTemplateConfirmOpen(false);
    setSelectedTemplate(null);
    setPreviewStatusTemplate(null);
    toast({
      message: `Applied template "${tpl.name}" successfully (${nextStatuses.length} statuses)`,
      type: "success"
    });
  };

  const handleSaveCustomTemplate = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = customTemplateName.trim();
    if (!trimmedName) {
      toast({ message: "Please specify a template name", type: "error" });
      return;
    }

    const newTemplate: StatusWorkflowTemplate = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      description: customTemplateDesc.trim() || `Custom template (${statuses.length} statuses)`,
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
    toast({ message: `Template "${trimmedName}" saved successfully`, type: "success" });
  };

  /* -------------------------------------------------------------
     STORY POINTS ACTIONS
  ------------------------------------------------------------- */
  const handleAddStoryPoint = () => {
    if (!canManage) return;
    const parsed = Number(newPointScore.trim());
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 100) {
      toast({ message: "Please specify points as a number between 1 and 100", type: "error" });
      return;
    }
    const exists = storyPoints.some((p) => p.score === parsed);
    if (exists) {
      toast({ message: `Points ${parsed} pts already exist in the list`, type: "error" });
      return;
    }

    const colorConfig = STORY_POINT_COLOR_CLASSES[newPointColor] || STORY_POINT_COLOR_CLASSES.cyan;
    const title = newPointTitle.trim() || `${parsed} pts`;
    const newPoint: CustomStoryPoint = {
      score: parsed,
      label: String(parsed),
      pointsLabel: `${parsed} pts`,
      title: `${title} (${parsed} pts)`,
      description: newPointDescription.trim() || `Task level: ${parsed} points`,
      color: newPointColor,
      ...colorConfig
    };

    const next = [...storyPoints, newPoint].sort((a, b) => a.score - b.score);
    setStoryPoints(next);
    saveStoredStoryPoints(next, boardId);
    setNewPointScore("");
    setNewPointTitle("");
    setNewPointDescription("");
    toast({ message: `Story points ${parsed} added successfully`, type: "success" });
  };

  const allPointTemplates: StoryPointWorkflowTemplate[] = [
    ...Object.values(STORY_POINT_WORKFLOW_TEMPLATES),
    ...customSavedPointTemplates
  ];

  const displayedStoryPoints = previewPointTemplate ? previewPointTemplate.points : storyPoints;

  const handleSelectPointTemplate = (tpl: StoryPointWorkflowTemplate) => {
    if (previewPointTemplate?.id === tpl.id) {
      setPreviewPointTemplate(null);
      setSelectedPointTemplate(null);
    } else {
      setPreviewPointTemplate(tpl);
      setSelectedPointTemplate(tpl);
    }
  };

  const handleConfirmApplyPointTemplate = () => {
    const tpl = selectedPointTemplate || previewPointTemplate;
    if (!tpl || !canManage) return;

    let nextPoints: CustomStoryPoint[];
    if (pointTemplateApplyMode === "replace") {
      nextPoints = [...tpl.points];
    } else {
      nextPoints = [...storyPoints];
      const existingScores = new Set(nextPoints.map((p) => p.score));
      for (const tplPt of tpl.points) {
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
    setPreviewPointTemplate(null);
    toast({
      message: `Applied Story Points scale "${tpl.name}" successfully (${nextPoints.length} levels)`,
      type: "success"
    });
  };

  const handleSaveCustomPointTemplate = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = customPointTemplateName.trim();
    if (!trimmedName) {
      toast({ message: "Please specify a template name", type: "error" });
      return;
    }

    const newTemplate: StoryPointWorkflowTemplate = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      description: customPointTemplateDesc.trim() || `Custom Story Points template (${storyPoints.length} levels)`,
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
    toast({ message: `Story Points scale "${trimmedName}" saved successfully`, type: "success" });
  };

  const handleApplyPreset = (key: keyof typeof STORY_POINT_PRESETS) => {
    if (!canManage) return;
    const preset = STORY_POINT_PRESETS[key];
    if (!preset) return;
    setStoryPoints(preset.points);
    saveStoredStoryPoints(preset.points, boardId);
    toast({ message: `Applied scale "${preset.name}" successfully`, type: "success" });
  };

  const handleConfirmDeletePoint = () => {
    if (!pointToDelete || !canManage) return;
    if (storyPoints.length <= 1) {
      toast({ message: "Must have at least 1 story point level", type: "error" });
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
    toast({ message: `Points "${deletedLabel}" deleted successfully`, type: "success" });
  };

  const handleResetStoryPoints = () => {
    if (!canManage) return;
    setStoryPoints(DEFAULT_STORY_POINTS);
    saveStoredStoryPoints(DEFAULT_STORY_POINTS, boardId);
    setIsResetPointsConfirmOpen(false);
    toast({ message: "Story points reset to default successfully", type: "success" });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Sub-navigation Pills */}
      <div className="flex items-center gap-1 border-b border-stone-200/70 pb-2 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveSubTab("status")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "status"
              ? "bg-indigo-50 text-indigo-700 font-bold dark:bg-dusk-lavender/15 dark:text-dusk-lavender"
              : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
          )}
        >
          <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
          <span>Card Status</span>
          <span className="rounded-full bg-indigo-500/10 px-1.5 text-[10px] font-mono text-indigo-600 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
            {statuses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("priority")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
            activeSubTab === "priority"
              ? "bg-rose-50 text-rose-700 font-bold dark:bg-rose-500/15 dark:text-rose-400"
              : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200"
          )}
        >
          <Flag className="h-3.5 w-3.5 text-rose-500" />
          <span>Priority</span>
          <span className="rounded-full bg-rose-500/10 px-1.5 text-[10px] font-mono text-rose-600 dark:text-rose-400">
            {priorities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("story-points")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
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
        <div className="space-y-3.5">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
              <span>Custom Card Statuses ({statuses.length} statuses)</span>
            </span>

            <button
              type="button"
              onClick={() => setIsResetStatusConfirmOpen(true)}
              disabled={!canManage}
              className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-stone-200/80 bg-stone-50/60 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Default</span>
            </button>
          </div>

          {/* 1. Quick Status Workflow Templates Bar */}
          <div className="rounded-xl border border-indigo-200/60 bg-indigo-50/20 p-3 dark:border-dusk-lavender/20 dark:bg-ink-950/40 shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Wand2 className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Preset Status Templates
                </span>
                <span className="rounded-full bg-indigo-100/70 border border-indigo-200/60 px-2 py-0.2 text-[9px] font-semibold text-indigo-700 dark:bg-dusk-lavender/15 dark:border-dusk-lavender/30 dark:text-dusk-lavender">
                  Preview &amp; Apply
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Dropdown for quick template selection */}
                <select
                  value={previewStatusTemplate?.id || ""}
                  onChange={(e) => {
                    const found = allTemplates.find((t) => t.id === e.target.value);
                    if (found) {
                      handleSelectStatusTemplate(found);
                    } else {
                      setPreviewStatusTemplate(null);
                      setSelectedTemplate(null);
                      setMockupColumnFilter("all");
                    }
                  }}
                  aria-label="Select status template from dropdown"
                  className="h-7 text-[11px] font-medium rounded-lg border border-indigo-200/80 bg-white/95 px-2 text-stone-700 shadow-2xs dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  title="Select status template from dropdown"
                >
                  <option value="">-- Select Template (Dropdown) --</option>
                  {allTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.statuses.length} columns)
                    </option>
                  ))}
                </select>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => setIsSaveCustomTemplateOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-dusk-lavender dark:hover:underline self-start sm:self-auto cursor-pointer"
                  >
                    <Bookmark className="h-3 w-3" />
                    <span>+ Save As Template</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-soft pb-1.5 pt-0.5">
              {allTemplates.map((tpl) => {
                const isSelected = previewStatusTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectStatusTemplate(tpl)}
                    className={cn(
                      "group shrink-0 inline-flex items-center h-8 rounded-full border shadow-2xs transition-all duration-300 ease-out cursor-pointer overflow-hidden p-1",
                      isSelected
                        ? "border-indigo-500 bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/40"
                        : "border-stone-200/90 bg-white text-stone-700 hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:hover:border-dusk-lavender/50 dark:hover:bg-dusk-lavender/10"
                    )}
                    title={tpl.description ? `${tpl.name} - ${tpl.description}` : tpl.name}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs transition-colors",
                        isSelected
                          ? "bg-white/20 text-white [&>svg]:text-white"
                          : "bg-stone-100 text-stone-600 group-hover:bg-indigo-100/70 group-hover:text-indigo-700 dark:bg-white/10 dark:text-stone-300 dark:group-hover:bg-dusk-lavender/20 dark:group-hover:text-dusk-lavender"
                      )}
                    >
                      {renderTemplateIcon(tpl.icon)}
                    </span>

                    <span
                      className={cn(
                        "flex items-center gap-1.5 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out",
                        isSelected
                          ? "max-w-[260px] opacity-100 ml-1.5 mr-1.5"
                          : "max-w-0 opacity-0 group-hover:max-w-[260px] group-hover:opacity-100 group-hover:ml-1.5 group-hover:mr-1.5"
                      )}
                    >
                      <span className="text-xs font-semibold">{tpl.name}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 font-mono text-[10px] transition-colors shrink-0",
                          isSelected
                            ? "bg-white/20 text-white font-bold"
                            : "bg-stone-100 text-stone-500 dark:bg-white/10 dark:text-stone-400"
                        )}
                      >
                        {tpl.statuses.length}
                      </span>
                      {isSelected && <Eye className="h-3.5 w-3.5 text-white stroke-[2.5] shrink-0" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Live Preview Action Banner & Kanban Mockup for Status */}
          {previewStatusTemplate && (
            <div className="rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/30 p-3 sm:p-4 dark:border-dusk-lavender/40 dark:from-ink-950/60 dark:via-ink-950/40 dark:to-stone-900/60 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
                    <Eye className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-100">
                        Kanban Mockup Preview: {previewStatusTemplate.name}
                      </span>
                      <span className="rounded-md border border-indigo-200/80 bg-white/90 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:border-white/10 dark:bg-white/10 dark:text-dusk-lavender">
                        {previewStatusTemplate.category}
                      </span>
                      <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-indigo-700 dark:text-dusk-lavender">
                        {previewStatusTemplate.statuses.length} columns
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-900/80 dark:text-indigo-200/80 truncate mt-0.5">
                      {previewStatusTemplate.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                  {/* Column Dropdown if columns are numerous or user wants to filter */}
                  {previewStatusTemplate.statuses.length > 3 && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">Column:</span>
                      <select
                        value={mockupColumnFilter}
                        onChange={(e) => setMockupColumnFilter(e.target.value)}
                        aria-label="Filter mockup columns"
                        className="h-7 text-[11px] font-medium rounded-lg border border-indigo-200/80 bg-white/95 px-2 text-stone-700 shadow-2xs dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">All Columns ({previewStatusTemplate.statuses.length})</option>
                        {previewStatusTemplate.statuses.map((st) => (
                          <option key={st.value} value={st.value}>
                            Column: {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Mode toggle */}
                  <div className="flex items-center rounded-lg border border-indigo-300/80 bg-white/80 p-0.5 text-[10px] font-semibold dark:border-white/10 dark:bg-black/30">
                    <button
                      type="button"
                      onClick={() => setTemplateApplyMode("replace")}
                      className={cn(
                        "px-2 py-0.5 rounded cursor-pointer transition",
                        templateApplyMode === "replace"
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                      )}
                    >
                      Replace All
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateApplyMode("append")}
                      className={cn(
                        "px-2 py-0.5 rounded cursor-pointer transition",
                        templateApplyMode === "append"
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                      )}
                    >
                      Append
                    </button>
                  </div>

                  {/* Apply button */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(previewStatusTemplate);
                      setIsApplyTemplateConfirmOpen(true);
                    }}
                    className="h-7 text-xs px-2.5 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Apply Template</span>
                  </Button>

                  {/* Cancel preview */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewStatusTemplate(null);
                      setSelectedTemplate(null);
                      setMockupColumnFilter("all");
                    }}
                    className="flex h-7 items-center gap-1 rounded-lg border border-stone-200/80 bg-white/90 px-2 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 cursor-pointer"
                    title="Cancel preview (return to current board statuses)"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">Revert</span>
                  </button>
                </div>
              </div>

              {/* Kanban Board Mockup with Top & Bottom Subtle Fade Gradient Masks */}
              <div className="relative rounded-xl border border-indigo-200/70 bg-stone-100/60 dark:border-white/10 dark:bg-stone-900/50 p-2 sm:p-2.5 overflow-hidden shadow-2xs">
                {/* Top Fade Gradient Mask */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-4 sm:h-5 bg-gradient-to-b from-stone-100/95 via-stone-100/50 to-transparent dark:from-stone-900/95 dark:via-stone-900/50 dark:to-transparent z-10"
                />
                {/* Bottom Fade Gradient Mask */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-4 sm:h-5 bg-gradient-to-t from-stone-100/95 via-stone-100/50 to-transparent dark:from-stone-900/95 dark:via-stone-900/50 dark:to-transparent z-10"
                />

                {/* Columns Track */}
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-soft pb-1.5 pt-1">
                  {displayedMockupStatuses.map((st, colIndex) => {
                    const cfg = STATUS_COLOR_CONFIGS[st.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
                    const sampleCards = getMockupSampleCards(st, colIndex);

                    return (
                      <div
                        key={st.value}
                        className="flex flex-col w-52 sm:w-56 shrink-0 rounded-xl border border-stone-200/80 bg-white/95 dark:border-white/10 dark:bg-stone-900/95 shadow-2xs overflow-hidden"
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-2.5 py-2 border-b border-stone-100 dark:border-white/5 bg-stone-50/70 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", cfg.dot)} />
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                              {st.label}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-stone-500 bg-stone-200/60 dark:bg-white/10 dark:text-stone-300 px-1.5 py-0.2 rounded-full shrink-0">
                            {sampleCards.length}
                          </span>
                        </div>

                        {/* Card List */}
                        <div className="p-2 space-y-2 max-h-[220px] overflow-y-auto scrollbar-soft">
                          {sampleCards.map((card) => (
                            <div
                              key={card.code}
                              className="rounded-lg border border-stone-200/80 bg-white dark:border-white/10 dark:bg-stone-800/80 p-2.5 space-y-2 shadow-2xs hover:shadow-xs hover:border-indigo-300 dark:hover:border-dusk-lavender/40 transition-all text-left"
                            >
                              {/* Top: Code & Priority */}
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300">
                                  {card.code}
                                </span>
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold border",
                                    card.priority === "HIGH" &&
                                      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400",
                                    card.priority === "MEDIUM" &&
                                      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
                                    card.priority === "LOW" &&
                                      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full shrink-0",
                                      card.priority === "HIGH" && "bg-red-500",
                                      card.priority === "MEDIUM" && "bg-amber-500",
                                      card.priority === "LOW" && "bg-emerald-500"
                                    )}
                                  />
                                  <span>{card.priorityLabel}</span>
                                </span>
                              </div>

                              {/* Card Title */}
                              <p className="text-xs font-medium text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                                {card.title}
                              </p>

                              {/* Bottom: Subtasks, Due Date, Assignee */}
                              <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-white/5 text-[10px] text-stone-500 dark:text-stone-400">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 font-mono text-[10px]" title="Checklist items">
                                    <CheckSquare className="h-3 w-3 text-stone-400" />
                                    <span>{card.checklist}</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px]" title="Due date">
                                    <Clock className="h-3 w-3 text-stone-400" />
                                    <span>{card.dueDate}</span>
                                  </span>
                                </div>
                                <div
                                  className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender font-bold text-[9px] grid place-items-center shrink-0 shadow-2xs"
                                  title={`Assignee: ${card.assignee}`}
                                >
                                  {card.assignee}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. Add Status Inline Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 dark:border-white/10 dark:bg-white/[0.02]">
            <Input
              placeholder="Type new status label, e.g. In Review, Testing, Blocked..."
              value={newStatusLabel}
              onChange={(e) => setNewStatusLabel(e.target.value)}
              disabled={!canManage || !!previewStatusTemplate}
              className="h-8 text-xs flex-1 min-w-[160px] bg-white dark:bg-stone-900"
              onKeyDown={(e) => e.key === "Enter" && handleAddStatus()}
            />
            <div className="flex items-center gap-1.5 px-1 overflow-x-auto py-0.5">
              {STATUS_COLOR_KEYS.map((colKey) => (
                <button
                  key={colKey}
                  type="button"
                  disabled={!canManage || !!previewStatusTemplate}
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
              disabled={!canManage || !newStatusLabel.trim() || !!previewStatusTemplate}
              className="h-8 text-xs gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Status</span>
            </Button>
          </div>

          {/* 3. Decorated Status List */}
          <div className="rounded-xl border border-stone-200/70 bg-white shadow-2xs divide-y divide-stone-100 max-h-[340px] overflow-y-auto scrollbar-soft dark:border-white/10 dark:bg-stone-900/40 dark:divide-white/5">
            {displayedStatuses.map((st, index) => {
              const cfg = STATUS_COLOR_CONFIGS[st.color || "indigo"] || STATUS_COLOR_CONFIGS.indigo;
              const isDefault = st.isDefault || ["TODO", "DOING", "WAITING", "DONE"].includes(st.value);
              const isFirst = index === 0;
              const isLast = index === displayedStatuses.length - 1;
              const isEditingThis = editingStatusValue === st.value;

              if (isEditingThis && !previewStatusTemplate) {
                return (
                  <div
                    key={st.value}
                    className="p-3 bg-indigo-50/30 dark:bg-ink-950/50 space-y-2.5 border-l-4 border-indigo-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Pencil className="h-3 w-3 text-indigo-500" />
                        <span>Edit Status: {st.value}</span>
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
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!editingStatusLabel.trim()}
                          onClick={() => setIsEditStatusConfirmOpen(true)}
                          className="h-8 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>Save</span>
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
                    {previewStatusTemplate ? (
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-dusk-lavender">
                        Stage Preview
                      </span>
                    ) : (
                      <>
                        {/* Reorder Up/Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveStatus(index, "up")}
                          disabled={isFirst || !canManage}
                          className="grid h-7 w-7 place-items-center rounded-md border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStatus(index, "down")}
                          disabled={isLast || !canManage}
                          className="grid h-7 w-7 place-items-center rounded-md border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit status */}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => startEditStatus(st)}
                            className="grid h-7 w-7 place-items-center rounded-md border border-stone-200/80 bg-white text-stone-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:text-dusk-lavender cursor-pointer"
                            title="Edit status"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}

                        {/* Delete or System Tag */}
                        {isDefault ? (
                          <span className="rounded bg-stone-100 px-2 py-1 text-[10px] font-medium text-stone-400 dark:bg-white/5">
                            System
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatusToDelete(st.value)}
                            disabled={!canManage}
                            className="grid h-7 w-7 place-items-center rounded-md border border-red-200/80 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 cursor-pointer"
                            title="Delete status"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
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
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Story Points Scale ({storyPoints.length} levels)</span>
            </span>

            <button
              type="button"
              onClick={() => setIsResetPointsConfirmOpen(true)}
              disabled={!canManage}
              className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-stone-200/80 bg-stone-50/60 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Story Points</span>
            </button>
          </div>

          {/* Quick Story Points Workflow Templates Bar */}
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/20 p-3 dark:border-amber-400/20 dark:bg-ink-950/40 shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Wand2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Preset Story Point Scales
                </span>
                <span className="rounded-full bg-amber-100/70 border border-amber-200/60 px-2 py-0.2 text-[9px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:border-amber-400/30 dark:text-amber-300">
                  Preview &amp; Apply
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Dropdown for quick story points template selection */}
                <select
                  value={previewPointTemplate?.id || ""}
                  onChange={(e) => {
                    const found = allPointTemplates.find((t) => t.id === e.target.value);
                    if (found) {
                      handleSelectPointTemplate(found);
                    } else {
                      setPreviewPointTemplate(null);
                      setSelectedPointTemplate(null);
                    }
                  }}
                  aria-label="Select point template from dropdown"
                  className="h-7 text-[11px] font-medium rounded-lg border border-amber-200/80 bg-white/95 px-2 text-stone-700 shadow-2xs dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                  title="Select point template from dropdown"
                >
                  <option value="">-- Select Point Scale (Dropdown) --</option>
                  {allPointTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.points.length} levels)
                    </option>
                  ))}
                </select>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => setIsSaveCustomPointTemplateOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:underline self-start sm:self-auto cursor-pointer"
                  >
                    <Bookmark className="h-3 w-3" />
                    <span>+ Save Scale As Template</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-soft pb-1.5 pt-0.5">
              {allPointTemplates.map((tpl) => {
                const isSelected = previewPointTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectPointTemplate(tpl)}
                    className={cn(
                      "group shrink-0 inline-flex items-center h-8 rounded-full border shadow-2xs transition-all duration-300 ease-out cursor-pointer overflow-hidden p-1",
                      isSelected
                        ? "border-amber-500 bg-amber-600 text-white shadow-xs ring-2 ring-amber-400/40"
                        : "border-stone-200/90 bg-white text-stone-700 hover:border-amber-400 hover:bg-amber-50/40 hover:text-amber-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:hover:border-amber-400/50 dark:hover:bg-amber-500/10"
                    )}
                    title={tpl.description ? `${tpl.name} - ${tpl.description}` : tpl.name}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs transition-colors",
                        isSelected
                          ? "bg-white/20 text-white [&>svg]:text-white"
                          : "bg-stone-100 text-stone-600 group-hover:bg-amber-100/70 group-hover:text-amber-700 dark:bg-white/10 dark:text-stone-300 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-300"
                      )}
                    >
                      {renderStoryPointTemplateIcon(tpl.icon)}
                    </span>

                    <span
                      className={cn(
                        "flex items-center gap-1.5 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out",
                        isSelected
                          ? "max-w-[260px] opacity-100 ml-1.5 mr-1.5"
                          : "max-w-0 opacity-0 group-hover:max-w-[260px] group-hover:opacity-100 group-hover:ml-1.5 group-hover:mr-1.5"
                      )}
                    >
                      <span className="text-xs font-semibold">{tpl.name}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 font-mono text-[10px] transition-colors shrink-0",
                          isSelected
                            ? "bg-white/20 text-white font-bold"
                            : "bg-stone-100 text-stone-500 dark:bg-white/10 dark:text-stone-400"
                        )}
                      >
                        {tpl.points.length}
                      </span>
                      {isSelected && <Eye className="h-3.5 w-3.5 text-white stroke-[2.5] shrink-0" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Live Preview Action Banner for Story Points */}
          {previewPointTemplate && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3.5 dark:border-amber-400/40 dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-600 text-white shrink-0 shadow-xs">
                  <Eye className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-100">
                      Previewing: {previewPointTemplate.name}
                    </span>
                    <span className="rounded-md border border-amber-200/80 bg-white/90 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:border-white/10 dark:bg-white/10 dark:text-amber-300">
                      {previewPointTemplate.category}
                    </span>
                    <span className="rounded-md bg-amber-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      {previewPointTemplate.points.length} levels
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 truncate mt-0.5">
                    {previewPointTemplate.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                {/* Mode toggle */}
                <div className="flex items-center rounded-lg border border-amber-300/80 bg-white/80 p-0.5 text-[10px] font-semibold dark:border-white/10 dark:bg-black/30">
                  <button
                    type="button"
                    onClick={() => setPointTemplateApplyMode("replace")}
                    className={cn(
                      "px-2 py-0.5 rounded cursor-pointer transition",
                      pointTemplateApplyMode === "replace"
                        ? "bg-amber-600 text-white font-bold"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    )}
                  >
                    Replace All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointTemplateApplyMode("append")}
                    className={cn(
                      "px-2 py-0.5 rounded cursor-pointer transition",
                      pointTemplateApplyMode === "append"
                        ? "bg-amber-600 text-white font-bold"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    )}
                  >
                    Append
                  </button>
                </div>

                {/* Apply button */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSelectedPointTemplate(previewPointTemplate);
                    setIsApplyPointTemplateConfirmOpen(true);
                  }}
                  className="h-7 text-xs px-2.5 gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Apply Scale</span>
                </Button>

                {/* Cancel preview */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPointTemplate(null);
                    setSelectedPointTemplate(null);
                  }}
                  className="flex h-7 items-center gap-1 rounded-lg border border-stone-200/80 bg-white/90 px-2 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 cursor-pointer"
                  title="Cancel preview (return to current board scale)"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Revert</span>
                </button>
              </div>
            </div>
          )}

          {/* Add Custom Point Inline Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 dark:border-white/10 dark:bg-white/[0.02]">
            <Input
              type="number"
              min={1}
              max={100}
              placeholder="Score"
              value={newPointScore}
              onChange={(e) => setNewPointScore(e.target.value)}
              disabled={!canManage || !!previewPointTemplate}
              className="h-8 w-20 text-xs font-mono font-bold bg-white dark:bg-stone-900"
            />
            <Input
              placeholder="Label, e.g. Medium (5 pts)"
              value={newPointTitle}
              onChange={(e) => setNewPointTitle(e.target.value)}
              disabled={!canManage || !!previewPointTemplate}
              className="h-8 text-xs flex-1 min-w-[120px] bg-white dark:bg-stone-900"
            />
            <Input
              placeholder="Description, e.g. 1-day task"
              value={newPointDescription}
              onChange={(e) => setNewPointDescription(e.target.value)}
              disabled={!canManage || !!previewPointTemplate}
              className="h-8 text-xs flex-1 min-w-[120px] bg-white dark:bg-stone-900"
              onKeyDown={(e) => e.key === "Enter" && handleAddStoryPoint()}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddStoryPoint}
              disabled={!canManage || !newPointScore.trim() || !!previewPointTemplate}
              className="h-8 text-xs gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Points</span>
            </Button>
          </div>

          {/* Story Points List */}
          <div className="rounded-xl border border-stone-200/70 bg-white shadow-2xs divide-y divide-stone-100 max-h-[300px] overflow-y-auto dark:border-white/10 dark:bg-stone-900/40 dark:divide-white/5">
            {displayedStoryPoints.map((pt) => {
              const colorConfig = STORY_POINT_COLOR_CLASSES[pt.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;

              return (
                <div
                  key={`${pt.score}-${pt.label}`}
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

                  {previewPointTemplate ? (
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      Scale Preview
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPointToDelete(pt)}
                      disabled={!canManage || storyPoints.length <= 1}
                      className="grid h-7 w-7 place-items-center rounded-md border border-red-200/80 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 cursor-pointer shrink-0"
                      title="Delete score"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Preview Section */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-amber-500" />
                <span>Story Points Preview:</span>
              </div>
              {previewPointTemplate && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  (Previewing scale: {previewPointTemplate.name})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displayedStoryPoints.map((pt) => {
                const config = STORY_POINT_COLOR_CLASSES[pt.color || "cyan"] || STORY_POINT_COLOR_CLASSES.cyan;
                return (
                  <div
                    key={`${pt.score}-${pt.label}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-2xs transition-all",
                      config.badgeClass,
                      previewPointTemplate && "scale-102"
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
                    Save Statuses as Custom Template
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
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Weekly Content Team, QA Staging Pipeline..."
                    value={customTemplateName}
                    onChange={(e) => setCustomTemplateName(e.target.value)}
                    maxLength={50}
                    autoFocus
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    Short Description (Optional)
                  </label>
                  <Input
                    placeholder="Describe what workflow this template is best suited for..."
                    value={customTemplateDesc}
                    onChange={(e) => setCustomTemplateDesc(e.target.value)}
                    maxLength={100}
                    className="text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl border border-stone-200/80 bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Saves all {statuses.length} current statuses as a template to apply to other boards quickly.
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!customTemplateName.trim()}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Save Template
                </Button>
              </div>
            </form>
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
                    Save Story Points as Custom Template
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
                    Scale Template Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Backend Complexity Scale, Design Team Scale..."
                    value={customPointTemplateName}
                    onChange={(e) => setCustomPointTemplateName(e.target.value)}
                    maxLength={50}
                    autoFocus
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    Short Description (Optional)
                  </label>
                  <Input
                    placeholder="Describe what workflow this scale is best suited for..."
                    value={customPointTemplateDesc}
                    onChange={(e) => setCustomPointTemplateDesc(e.target.value)}
                    maxLength={100}
                    className="text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl border border-stone-200/80 bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Saves all {storyPoints.length} current story point levels as a template to apply to other boards quickly.
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!customPointTemplateName.trim()}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer"
                >
                  Save Template
                </Button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}

      {/* Confirmation Modals per AGENTS.md */}
      <ConfirmModal
        open={statusToDelete !== null}
        title="Confirm Status Deletion"
        message={`Are you sure you want to delete status "${statuses.find((s) => s.value === statusToDelete)?.label || statusToDelete}"? Existing cards with this status will remain.`}
        confirmLabel="Delete Status"
        variant="danger"
        onClose={() => setStatusToDelete(null)}
        onConfirm={handleConfirmDeleteStatus}
      />

      <ConfirmModal
        open={isResetStatusConfirmOpen}
        title="Reset Statuses to Default"
        message="All statuses will be reset to the 4 standard default statuses (Todo, Doing, Waiting, Done)."
        confirmLabel="Reset Statuses"
        variant="default"
        onClose={() => setIsResetStatusConfirmOpen(false)}
        onConfirm={handleResetStatuses}
      />

      <ConfirmModal
        open={isApplyTemplateConfirmOpen}
        title="Confirm Apply Status Template"
        message={`Are you sure you want to apply template "${(selectedTemplate || previewStatusTemplate)?.name}" (${templateApplyMode === "replace" ? "Replace All" : "Append"}) to this board?`}
        confirmLabel="Apply Template"
        variant="default"
        onClose={() => setIsApplyTemplateConfirmOpen(false)}
        onConfirm={handleConfirmApplyTemplate}
      />

      <ConfirmModal
        open={isEditStatusConfirmOpen}
        title="Confirm Edit Status"
        message={`Are you sure you want to save changes to status "${editingStatusLabel}"?`}
        confirmLabel="Save"
        variant="default"
        onClose={() => setIsEditStatusConfirmOpen(false)}
        onConfirm={handleConfirmEditStatus}
      />

      <ConfirmModal
        open={pointToDelete !== null}
        title="Confirm Story Points Deletion"
        message={`Are you sure you want to delete points "${pointToDelete?.title || `${pointToDelete?.score} pts`}"?`}
        confirmLabel="Delete Points"
        variant="danger"
        onClose={() => setPointToDelete(null)}
        onConfirm={handleConfirmDeletePoint}
      />

      <ConfirmModal
        open={isResetPointsConfirmOpen}
        title="Reset Story Points to Default"
        message="All story point levels will be reset to the default standard scale (1, 3, 5, 8, 16, 21 pts)."
        confirmLabel="Reset Story Points"
        variant="default"
        onClose={() => setIsResetPointsConfirmOpen(false)}
        onConfirm={handleResetStoryPoints}
      />

      <ConfirmModal
        open={isApplyPointTemplateConfirmOpen}
        title="Confirm Apply Story Points Template"
        message={`Are you sure you want to apply story points template "${(selectedPointTemplate || previewPointTemplate)?.name}" (${pointTemplateApplyMode === "replace" ? "Replace All" : "Append"}) to this board?`}
        confirmLabel="Apply Scale"
        variant="default"
        onClose={() => setIsApplyPointTemplateConfirmOpen(false)}
        onConfirm={handleConfirmApplyPointTemplate}
      />
    </div>
  );
}
