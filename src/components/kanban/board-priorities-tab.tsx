"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Briefcase,
  Check,
  ChevronDown,
  Eye,
  Flag,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Wand2,
  X
} from "lucide-react";

import {
  DEFAULT_PRIORITIES,
  MAX_BOARD_PRIORITIES,
  MIN_BOARD_PRIORITIES,
  PRIORITY_COLOR_OPTIONS,
  PRIORITY_WORKFLOW_TEMPLATES,
  type PriorityColorConfig,
  type PriorityWorkflowTemplate,
  getPriorityColorConfig
} from "@/lib/kanban/priority";
import type { CustomPriority } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function renderPriorityTemplateIcon(icon: string) {
  switch (icon) {
    case "target":
      return <Target className="h-3.5 w-3.5 text-rose-500" />;
    case "sparkles":
      return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
    case "bookmark":
      return <Bookmark className="h-3.5 w-3.5 text-indigo-500" />;
    case "briefcase":
      return <Briefcase className="h-3.5 w-3.5 text-emerald-500" />;
    case "palette":
      return <Palette className="h-3.5 w-3.5 text-amber-500" />;
    default:
      return <Flag className="h-3.5 w-3.5 text-rose-500" />;
  }
}

interface BoardPrioritiesTabProps {
  priorities: CustomPriority[];
  onChange: (priorities: CustomPriority[]) => void;
  canManage?: boolean;
}

export function BoardPrioritiesTab({
  priorities,
  onChange,
  canManage = true
}: BoardPrioritiesTabProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priorityToDelete, setPriorityToDelete] = useState<CustomPriority | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Template Management & Live Preview State
  const [previewTemplate, setPreviewTemplate] = useState<PriorityWorkflowTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PriorityWorkflowTemplate | null>(null);
  const [templateApplyMode, setTemplateApplyMode] = useState<"replace" | "append">("replace");
  const [isApplyTemplateConfirmOpen, setIsApplyTemplateConfirmOpen] = useState(false);

  // Custom Saved Templates State
  const [customSavedTemplates, setCustomSavedTemplates] = useState<PriorityWorkflowTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("retzlo:custom_priority_templates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSaveCustomTemplateOpen, setIsSaveCustomTemplateOpen] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [customTemplateDesc, setCustomTemplateDesc] = useState("");

  const isAtMax = priorities.length >= MAX_BOARD_PRIORITIES;
  const isAtMin = priorities.length <= MIN_BOARD_PRIORITIES;

  const allTemplates: PriorityWorkflowTemplate[] = [
    ...Object.values(PRIORITY_WORKFLOW_TEMPLATES),
    ...customSavedTemplates
  ];

  // The priorities currently displayed: if previewing a template, show its items right away!
  const displayedPriorities = previewTemplate ? previewTemplate.priorities : priorities;

  const handleSelectTemplate = (tpl: PriorityWorkflowTemplate) => {
    if (previewTemplate?.id === tpl.id) {
      setPreviewTemplate(null);
      setSelectedTemplate(null);
    } else {
      setPreviewTemplate(tpl);
      setSelectedTemplate(tpl);
    }
  };

  const handleConfirmApplyTemplate = () => {
    const tpl = selectedTemplate || previewTemplate;
    if (!tpl || !canManage) return;

    let nextList: CustomPriority[];
    if (templateApplyMode === "replace") {
      nextList = tpl.priorities.slice(0, MAX_BOARD_PRIORITIES).map((p, idx) => ({
        ...p,
        level: idx + 1
      }));
    } else {
      nextList = [...priorities];
      const existingIds = new Set(nextList.map((p) => p.id.toUpperCase()));
      const existingLabels = new Set(nextList.map((p) => p.label.trim().toLowerCase()));

      for (const tplPriority of tpl.priorities) {
        if (nextList.length >= MAX_BOARD_PRIORITIES) break;
        if (!existingIds.has(tplPriority.id.toUpperCase()) && !existingLabels.has(tplPriority.label.trim().toLowerCase())) {
          nextList.push({
            ...tplPriority,
            id: `priority_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            level: nextList.length + 1
          });
          existingIds.add(tplPriority.id.toUpperCase());
          existingLabels.add(tplPriority.label.trim().toLowerCase());
        }
      }
      nextList = nextList.map((p, idx) => ({ ...p, level: idx + 1 }));
    }

    onChange(nextList);
    setEditingId(null);
    setIsApplyTemplateConfirmOpen(false);
    setSelectedTemplate(null);
    setPreviewTemplate(null);
    toast({
      message: `Applied template "${tpl.name}" successfully (${nextList.length} levels)`,
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

    const newTemplate: PriorityWorkflowTemplate = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      description: customTemplateDesc.trim() || `Custom priority template (${priorities.length} levels)`,
      category: "Custom",
      icon: "bookmark",
      priorities: [...priorities]
    };

    const nextTemplates = [...customSavedTemplates, newTemplate];
    setCustomSavedTemplates(nextTemplates);
    try {
      localStorage.setItem("retzlo:custom_priority_templates", JSON.stringify(nextTemplates));
    } catch {}

    setIsSaveCustomTemplateOpen(false);
    setCustomTemplateName("");
    setCustomTemplateDesc("");
    toast({ message: `Template "${trimmedName}" saved successfully`, type: "success" });
  };

  const handleAddPriority = () => {
    if (isAtMax || !canManage || previewTemplate) return;

    const availableColors = Object.keys(PRIORITY_COLOR_OPTIONS);
    const usedColors = new Set(priorities.map((p) => p.color));
    const nextColor =
      availableColors.find((c) => !usedColors.has(c)) ||
      availableColors[priorities.length % availableColors.length];

    const nextLevel = priorities.length + 1;
    const newPriority: CustomPriority = {
      id: `priority_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: `Priority ${nextLevel}`,
      color: nextColor,
      level: nextLevel
    };

    const nextList = [...priorities, newPriority].map((p, idx) => ({
      ...p,
      level: idx + 1
    }));

    onChange(nextList);
    setEditingId(newPriority.id);
    toast({
      message: `Priority "${newPriority.label}" added successfully`,
      type: "success"
    });
  };

  const handleUpdateLabel = (id: string, label: string) => {
    if (previewTemplate) return;
    const nextList = priorities.map((p) =>
      p.id === id ? { ...p, label: label.slice(0, 30) } : p
    );
    onChange(nextList);
  };

  const handleUpdateColor = (id: string, color: string) => {
    if (previewTemplate) return;
    const nextList = priorities.map((p) => (p.id === id ? { ...p, color } : p));
    onChange(nextList);
  };

  const handleConfirmDeletePriority = () => {
    if (!priorityToDelete || !canManage || previewTemplate) return;
    if (priorities.length <= MIN_BOARD_PRIORITIES) {
      toast({ message: "Must have at least 1 priority level", type: "error" });
      setPriorityToDelete(null);
      return;
    }

    const filtered = priorities.filter((p) => p.id !== priorityToDelete.id);
    const reindexed = filtered.map((p, idx) => ({
      ...p,
      level: idx + 1
    }));
    onChange(reindexed);
    if (editingId === priorityToDelete.id) setEditingId(null);
    toast({
      message: `Priority "${priorityToDelete.label}" deleted successfully`,
      type: "success"
    });
    setPriorityToDelete(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0 || !canManage || previewTemplate) return;
    const next = [...priorities];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;

    const reindexed = next.map((p, idx) => ({
      ...p,
      level: idx + 1
    }));
    onChange(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index >= priorities.length - 1 || !canManage || previewTemplate) return;
    const next = [...priorities];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;

    const reindexed = next.map((p, idx) => ({
      ...p,
      level: idx + 1
    }));
    onChange(reindexed);
  };

  const handleConfirmResetToDefault = () => {
    if (!canManage) return;
    onChange(DEFAULT_PRIORITIES);
    setEditingId(null);
    setPreviewTemplate(null);
    setSelectedTemplate(null);
    setIsResetConfirmOpen(false);
    toast({ message: "Reset priority levels to default successfully", type: "success" });
  };

  return (
    <div className="space-y-3.5 pt-0.5">
      {/* Top Banner & Limits Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-dusk-lavender" />
          <span>Priority Levels</span>
        </span>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold border",
              isAtMax
                ? "border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "border-indigo-400/30 bg-indigo-500/10 text-indigo-700 dark:text-dusk-lavender"
            )}
          >
            {displayedPriorities.length} / {MAX_BOARD_PRIORITIES} levels
          </span>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={!canManage}
            title="Reset to default (High, Medium, Low)"
            className="flex items-center gap-1 rounded-lg border border-stone-200/80 bg-stone-50/60 px-2 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-white/[0.08] cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Priority Workflow Templates Bar */}
      <div className="rounded-xl border border-rose-200/60 bg-rose-50/20 p-3 dark:border-rose-400/20 dark:bg-ink-950/40 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Wand2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Preset Priority Templates
            </span>
            <span className="rounded-full bg-rose-100/70 border border-rose-200/60 px-2 py-0.2 text-[9px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:border-rose-400/30 dark:text-rose-300">
              Click to preview instantly
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dropdown for quick priority template selection */}
            <select
              value={previewTemplate?.id || ""}
              onChange={(e) => {
                const found = allTemplates.find((t) => t.id === e.target.value);
                if (found) {
                  handleSelectTemplate(found);
                } else {
                  setPreviewTemplate(null);
                  setSelectedTemplate(null);
                }
              }}
              aria-label="Select priority template from dropdown"
              className="h-7 text-[11px] font-medium rounded-lg border border-rose-200/80 bg-white/95 px-2 text-stone-700 shadow-2xs dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
              title="Select priority template from dropdown"
            >
              <option value="">-- Select Template (Dropdown) --</option>
              {allTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.priorities.length} levels)
                </option>
              ))}
            </select>

            {canManage && (
              <button
                type="button"
                onClick={() => setIsSaveCustomTemplateOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:underline self-start sm:self-auto cursor-pointer"
              >
                <Bookmark className="h-3 w-3" />
                <span>+ Save As Template</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-soft pb-1.5 pt-0.5">
          {allTemplates.map((tpl) => {
            const isSelected = previewTemplate?.id === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={cn(
                  "group shrink-0 inline-flex items-center h-8 rounded-full border shadow-2xs transition-all duration-300 ease-out cursor-pointer overflow-hidden p-1",
                  isSelected
                    ? "border-rose-500 bg-rose-500 text-white shadow-xs ring-2 ring-rose-400/40 dark:bg-rose-600 dark:border-rose-600"
                    : "border-stone-200/90 bg-white text-stone-700 hover:border-rose-400 hover:bg-rose-50/40 hover:text-rose-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/10"
                )}
                title={tpl.description ? `${tpl.name} - ${tpl.description}` : tpl.name}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs transition-colors",
                    isSelected
                      ? "bg-white/20 text-white [&>svg]:text-white"
                      : "bg-stone-100 text-stone-600 group-hover:bg-rose-100/70 group-hover:text-rose-700 dark:bg-white/10 dark:text-stone-300 dark:group-hover:bg-rose-500/20 dark:group-hover:text-rose-300"
                  )}
                >
                  {renderPriorityTemplateIcon(tpl.icon)}
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
                    {tpl.priorities.length}
                  </span>
                  {isSelected && <Eye className="h-3.5 w-3.5 text-white stroke-[2.5] shrink-0" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Live Preview Action Banner */}
      {previewTemplate && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-rose-300/80 bg-rose-50/70 p-3 shadow-2xs dark:border-rose-500/30 dark:bg-rose-950/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500 text-white shrink-0 shadow-xs">
              <Eye className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-rose-950 dark:text-rose-200">
                  Previewing: {previewTemplate.name}
                </span>
                <span className="rounded-md border border-rose-300 bg-rose-100/80 px-2 py-0.2 font-mono text-[10px] font-bold text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300">
                  {previewTemplate.priorities.length} levels
                </span>
                <span className="text-[10px] text-rose-700 dark:text-rose-400">
                  (Click other templates above to preview)
                </span>
              </div>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 truncate mt-0.5">
                {previewTemplate.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
            {/* Mode toggle */}
            <div className="flex items-center rounded-lg border border-rose-300/80 bg-white/80 p-0.5 text-[10px] font-semibold dark:border-white/10 dark:bg-black/30">
              <button
                type="button"
                onClick={() => setTemplateApplyMode("replace")}
                className={cn(
                  "px-2 py-0.5 rounded cursor-pointer transition",
                  templateApplyMode === "replace"
                    ? "bg-rose-500 text-white font-bold"
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
                    ? "bg-rose-500 text-white font-bold"
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
                setSelectedTemplate(previewTemplate);
                setIsApplyTemplateConfirmOpen(true);
              }}
              className="h-7 text-xs px-2.5 gap-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Apply Template</span>
            </Button>

            {/* Cancel preview */}
            <button
              type="button"
              onClick={() => {
                setPreviewTemplate(null);
                setSelectedTemplate(null);
              }}
              className="flex h-7 items-center gap-1 rounded-lg border border-stone-200/80 bg-white/90 px-2 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 cursor-pointer"
              title="Cancel preview (return to current board priorities)"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Revert</span>
            </button>
          </div>
        </div>
      )}

      {/* Priority Levels List */}
      <div className="rounded-xl border border-stone-200/70 bg-white shadow-2xs divide-y divide-stone-100 max-h-[320px] overflow-y-auto dark:border-white/10 dark:bg-stone-900/40 dark:divide-white/5">
        {displayedPriorities.map((priority, index) => {
          const colorConfig = getPriorityColorConfig(priority.color);
          const isHighest = index === 0;
          const isLowest = index === displayedPriorities.length - 1;

          return (
            <div
              key={priority.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 hover:bg-stone-50/60 dark:hover:bg-white/[0.02] transition"
            >
              {/* Left: Urgency Order & Name Input */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Level Order Indicator */}
                <div
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-bold border",
                    index === 0
                      ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border-stone-200 bg-stone-100 text-stone-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-300"
                  )}
                  title={`Priority level ${index + 1}`}
                >
                  {index + 1}
                </div>

                {/* Priority Label Input / Preview */}
                <div className="flex-1 min-w-[140px]">
                  {previewTemplate ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        {priority.label}
                      </span>
                      <span className="rounded-md border border-rose-300/60 bg-rose-100/60 px-1.5 py-0.2 text-[9px] font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                        Preview
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={priority.label}
                      onChange={(e) => handleUpdateLabel(priority.id, e.target.value)}
                      disabled={!canManage}
                      placeholder="Priority label..."
                      maxLength={30}
                      className="h-7 w-full rounded-lg border border-stone-200/80 bg-white px-2 text-xs font-semibold text-stone-900 shadow-2xs placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-dusk-lavender"
                    />
                  )}
                </div>

                {/* Live Pill Preview */}
                <div className="shrink-0 hidden xs:block">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold shadow-2xs",
                      colorConfig.pillClass
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", colorConfig.dotClass)} />
                    <span className="truncate max-w-[80px]">{priority.label || "Priority"}</span>
                  </span>
                </div>
              </div>

              {/* Right: Color Picker, Reorder, Delete (or preview badge) */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                {previewTemplate ? (
                  <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400">
                    {colorConfig.name}
                  </span>
                ) : (
                  <>
                    {/* Color Swatch Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={!canManage}
                          className="flex h-7 items-center gap-1.5 rounded-lg border border-stone-200/80 bg-stone-50/70 px-2 text-xs font-medium text-stone-700 hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:border-white/20 cursor-pointer"
                          title="Select priority color"
                        >
                          <span className={cn("h-3 w-3 rounded-full shrink-0 shadow-2xs", colorConfig.swatchClass)} />
                          <span className="text-[11px] font-semibold">{colorConfig.name}</span>
                          <ChevronDown className="h-3 w-3 opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2 z-[1300]">
                        <div className="mb-2 px-1 text-[11px] font-bold text-stone-500 dark:text-stone-400">
                          Select priority color:
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {Object.values(PRIORITY_COLOR_OPTIONS).map((option) => (
                            <DropdownMenuItem
                              key={option.id}
                              onClick={() => handleUpdateColor(priority.id, option.id)}
                              className={cn(
                                "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium",
                                priority.color === option.id && "bg-indigo-50 font-bold text-indigo-700 dark:bg-white/10 dark:text-dusk-lavender"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn("h-3 w-3 rounded-full shrink-0 shadow-2xs", option.swatchClass)} />
                                <span>{option.name}</span>
                              </div>
                              {priority.color === option.id && <Check className="h-3.5 w-3.5" />}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={isHighest || !canManage}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-white/[0.08] cursor-pointer"
                      title="Move up (increase urgency)"
                      aria-label="Move priority up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLowest || !canManage}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-white/[0.08] cursor-pointer"
                      title="Move down (decrease urgency)"
                      aria-label="Move priority down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Level */}
                    <button
                      type="button"
                      onClick={() => setPriorityToDelete(priority)}
                      disabled={isAtMin || !canManage}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-red-200/80 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-30 dark:border-red-500/20 dark:bg-white/[0.04] dark:text-red-400 dark:hover:bg-red-500/15 cursor-pointer"
                      title={isAtMin ? "Must have at least 1 priority level" : "Delete this priority"}
                      aria-label="Delete priority"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Priority Button (hidden in preview mode) */}
      {!previewTemplate && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleAddPriority}
            disabled={isAtMax || !canManage}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2 text-xs font-bold transition-all cursor-pointer",
              isAtMax
                ? "border-stone-300 text-stone-400 opacity-50 cursor-not-allowed dark:border-white/10"
                : "border-indigo-400/50 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/60 dark:border-dusk-lavender/40 dark:bg-dusk-lavender/10 dark:text-dusk-lavender dark:hover:bg-dusk-lavender/20"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>
              {isAtMax
                ? `Maximum ${MAX_BOARD_PRIORITIES} priority levels reached`
                : `+ Add New Priority (${priorities.length}/${MAX_BOARD_PRIORITIES})`}
            </span>
          </button>
        </div>
      )}

      {/* Live Preview Section */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-dusk-amber" />
          <span>
            {previewTemplate
              ? `Previewing template "${previewTemplate.name}":`
              : "Preview on board and export view:"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {displayedPriorities.map((p, idx) => {
            const config = getPriorityColorConfig(p.color);
            return (
              <div
                key={p.id || idx}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-2xs",
                  config.pillClass
                )}
              >
                <span className="font-mono text-[9px] opacity-70">#{idx + 1}</span>
                <span>{p.label || "Priority"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save as Custom Priority Template Modal */}
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
                  <Bookmark className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Save Priorities as Custom Template
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
                    placeholder="e.g. Incident Response, Production Queue..."
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
                    Saves all {priorities.length} current priority levels as a custom template for future use.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSaveCustomTemplateOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!customTemplateName.trim()}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer"
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
        open={priorityToDelete !== null}
        title="Confirm Priority Deletion"
        message={`Are you sure you want to delete priority "${priorityToDelete?.label || "Priority"}"?`}
        confirmLabel="Delete Priority"
        variant="danger"
        onClose={() => setPriorityToDelete(null)}
        onConfirm={handleConfirmDeletePriority}
      />

      <ConfirmModal
        open={isResetConfirmOpen}
        title="Reset Priorities to Default"
        message="All priority levels will be reset to the 3 standard levels (High, Medium, Low)."
        confirmLabel="Reset"
        variant="default"
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetToDefault}
      />

      <ConfirmModal
        open={isApplyTemplateConfirmOpen}
        title="Confirm Apply Priority Template"
        message={`Are you sure you want to apply template "${(selectedTemplate || previewTemplate)?.name}" (${templateApplyMode === "replace" ? "Replace All" : "Append"}) to this board?`}
        confirmLabel="Apply Template"
        variant="default"
        onClose={() => setIsApplyTemplateConfirmOpen(false)}
        onConfirm={handleConfirmApplyTemplate}
      />
    </div>
  );
}
