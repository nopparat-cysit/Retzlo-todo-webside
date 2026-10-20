"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Columns3,
  FolderKanban,
  GitCommitHorizontal,
  Globe,
  Lock,
  Sparkles,
  Users
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  BoardTemplatePicker,
  type BoardTemplateId
} from "@/components/kanban/board-template-picker";
import { BoardMockupPreview } from "@/components/kanban/board-mockup-preview";
import { ColumnIconGlyph } from "@/components/kanban/column-icon-picker";
import {
  BOARD_TEMPLATES,
  DEFAULT_BOARD_TEMPLATE_ID
} from "@/lib/kanban/board-templates";
import {
  getColumnThemeOption,
  columnIconOptions,
  columnStatusOptions
} from "@/lib/kanban/column-settings";
import { getStatusMeta } from "@/lib/kanban/status";
import { cn } from "@/lib/utils";

export interface CreateBoardMemberOption {
  userId: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: string;
}

export interface CreateBoardPageViewProps {
  projectId: string;
  projectName?: string;
  projectMembers?: CreateBoardMemberOption[];
}

export function CreateBoardPageView({
  projectId,
  projectName,
  projectMembers
}: CreateBoardPageViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<BoardTemplateId>(DEFAULT_BOARD_TEMPLATE_ID);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const stepTransitionLockRef = useRef<number>(0);

  function goToStep(nextStep: 1 | 2) {
    if (nextStep === 2 && !name.trim()) return;
    stepTransitionLockRef.current = Date.now();
    setStep(nextStep);
  }

  // Preview display toggle: Kanban mockup vs Connected pipeline sequence
  const [previewMode, setPreviewMode] = useState<"kanban" | "pipeline">("kanban");

  // Members list
  const [members, setMembers] = useState<CreateBoardMemberOption[]>(projectMembers ?? []);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const hasFetchedMembers = useRef(false);

  useEffect(() => {
    if (projectMembers && projectMembers.length > 0) {
      setMembers(projectMembers);
      return;
    }

    if (isPrivate && !hasFetchedMembers.current && projectId) {
      hasFetchedMembers.current = true;
      setIsLoadingMembers(true);
      fetch(`/api/projects/${projectId}/members`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (Array.isArray(data.members)) {
            const mapped: CreateBoardMemberOption[] = data.members.map((m: any) => ({
              userId: m.id || m.userId,
              name: m.name,
              email: m.email,
              avatar: m.avatar,
              role: m.role
            }));
            setMembers(mapped);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoadingMembers(false);
        });
    }
  }, [isPrivate, projectId, projectMembers]);

  const selectedTemplate =
    BOARD_TEMPLATES.find((template) => template.id === templateId) ?? BOARD_TEMPLATES[0];

  function toggleMember(memberId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Guard 1: Step 1 must only transition to Step 2, never submit
    if (step !== 2) {
      if (name.trim()) {
        goToStep(2);
      }
      return;
    }

    // Guard 2: Prevent synthetic click carryover from Step 1's "Next" button click
    if (Date.now() - stepTransitionLockRef.current < 400) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName || isPending) return;

    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          isPrivate,
          memberUserIds: isPrivate ? selectedMemberIds : [],
          templateId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.board) {
        const msg = data.error || "Failed to create board.";
        setError(msg);
        toast({ message: msg, type: "error" });
        return;
      }

      toast({
        message: `Board "${data.board.name}" created successfully.`,
        type: "success"
      });

      // Smoothly navigate directly to the newly created board channel
      router.push(`/project/${projectId}/board?boardId=${encodeURIComponent(data.board.id)}`);
      router.refresh();
    } catch {
      const fallbackMsg = "An unexpected network error occurred.";
      setError(fallbackMsg);
      toast({ message: fallbackMsg, type: "error" });
    } finally {
      setIsPending(false);
    }
  }

  const memberInitials = (
    isPrivate
      ? members.filter((m) => selectedMemberIds.includes(m.userId))
      : members
  )
    .map((m) => (m.name || m.email || "MB").trim().slice(0, 2).toUpperCase());

  const totalMemberCount = isPrivate ? selectedMemberIds.length : members.length || undefined;

  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Return Link */}
      <div className="sticky top-0 z-20 -mx-4 -mt-2 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-theme-border bg-theme-panel/95 px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href={`/project/${projectId}/board`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-theme-border bg-theme-panel px-3 text-xs font-semibold text-theme-muted transition hover:border-theme-border-strong hover:bg-theme-paper hover:text-theme-foreground active:scale-95 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Board</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              {projectName ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-theme-accent">
                  {projectName}
                </span>
              ) : null}
              <span className="text-theme-muted text-xs">/</span>
              <span className="text-xs text-theme-muted font-medium">New Channel</span>
              <span className="text-theme-muted text-xs">/</span>
              <span className="inline-flex items-center rounded-full bg-theme-paper border border-theme-border px-2 py-0.5 text-[10px] font-bold text-theme-accent">
                Step {step} of 2
              </span>
            </div>
            <h1 className="mt-0.5 flex items-center gap-2 text-xl font-bold text-theme-foreground sm:text-2xl">
              <FolderKanban className="h-6 w-6 text-theme-accent" />
              <span>{step === 1 ? "Create New Board" : "Set Board Permissions"}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {step === 1 ? (
            <div key="step-1-header-actions" className="flex items-center gap-2.5">
              <Button
                key="step-1-cancel-btn"
                type="button"
                variant="ghost"
                onClick={() => router.push(`/project/${projectId}/board`)}
                disabled={isPending}
                className="text-xs h-9 px-3.5 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                key="step-1-next-btn"
                type="button"
                disabled={!name.trim() || isPending}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToStep(2);
                }}
                variant="primary"
                className="h-9 font-bold px-5 shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div key="step-2-header-actions" className="flex items-center gap-2.5">
              <Button
                key="step-2-back-btn"
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToStep(1);
                }}
                disabled={isPending}
                className="text-xs h-9 px-3.5 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                key="step-2-create-btn"
                type="submit"
                form="create-board-page-form"
                disabled={!name.trim() || isPending}
                variant="primary"
                className="h-9 font-bold px-5 shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <FolderKanban className="h-4 w-4" />
                <span>{isPending ? "Creating Board..." : "Create Board"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* ── Left Column: Form Settings (5 of 12 columns) ── */}
        <div className="lg:col-span-5">
          <form
            id="create-board-page-form"
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-theme-border bg-theme-panel p-5 sm:p-6 shadow-xl"
          >
            {/* Wizard Step Navigation Indicator */}
            <div className="flex items-center gap-2 border-b border-theme-border pb-4">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  step === 1
                    ? "bg-theme-accent/15 text-theme-accent border border-theme-accent/30"
                    : "text-theme-muted hover:text-theme-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                    step === 1
                      ? "bg-theme-accent text-white"
                      : "bg-theme-paper border border-theme-border text-theme-muted"
                  )}
                >
                  1
                </span>
                <span>Name & Template</span>
              </button>

              <span className="text-theme-border text-xs">›</span>

              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => {
                  if (name.trim()) goToStep(2);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  !name.trim() ? "opacity-50 cursor-not-allowed text-theme-muted" : "cursor-pointer",
                  step === 2
                    ? "bg-theme-accent/15 text-theme-accent border border-theme-accent/30"
                    : "text-theme-muted hover:text-theme-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                    step === 2
                      ? "bg-theme-accent text-white"
                      : "bg-theme-paper border border-theme-border text-theme-muted"
                  )}
                >
                  2
                </span>
                <span>Access & Permissions</span>
              </button>
            </div>

            {step === 1 ? (
              <>
                {/* 1. Board Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="board-name-input"
                      className="block text-xs font-bold uppercase tracking-wider text-theme-foreground"
                    >
                      Board Name <span className="text-theme-danger">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-theme-muted">
                      {name.length}/80
                    </span>
                  </div>
                  <Input
                    id="board-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        goToStep(2);
                      }
                    }}
                    placeholder="e.g. Marketing Roadmap, Sprint 2, Bug Tracker..."
                    maxLength={80}
                    autoFocus
                    required
                    disabled={isPending}
                    className="h-11 rounded-xl text-sm font-medium"
                  />
                </div>

                {/* 2. Board Template Picker (Vertical spacious stack, preview on right) */}
                <div className="space-y-2">
                  <BoardTemplatePicker
                    selectedId={templateId}
                    onSelect={setTemplateId}
                    disabled={isPending}
                    boardName={name}
                    isPrivate={isPrivate}
                    memberInitials={memberInitials}
                    totalMemberCount={totalMemberCount}
                    hidePreview={true}
                    layout="vertical"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Board Summary Banner */}
                <div className="rounded-xl border border-theme-border bg-theme-paper p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-theme-muted">
                      Configuring board
                    </p>
                    <p className="text-sm font-bold text-theme-foreground truncate">{name}</p>
                    <p className="text-xs text-theme-muted">
                      {selectedTemplate.name} ({selectedTemplate.columns.length} columns)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="h-7 text-xs text-theme-accent shrink-0 cursor-pointer"
                  >
                    Change
                  </Button>
                </div>

                {/* 3. Access Visibility */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted">
                    Access Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setIsPrivate(false)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-3.5 text-left transition cursor-pointer",
                        !isPrivate
                          ? "border-theme-accent bg-theme-paper-strong text-theme-accent shadow-xs ring-1 ring-theme-accent/30"
                          : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-border-strong hover:text-theme-foreground"
                      )}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Globe className="h-4 w-4" />
                        <span>Public</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-80 leading-relaxed">
                        All workspace members can access this board.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setIsPrivate(true)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-3.5 text-left transition cursor-pointer",
                        isPrivate
                          ? "border-theme-accent bg-theme-paper-strong text-theme-accent shadow-xs ring-1 ring-theme-accent/30"
                          : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-border-strong hover:text-theme-foreground"
                      )}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Lock className="h-4 w-4" />
                        <span>Private</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-80 leading-relaxed">
                        Only invited members can view or manage tasks.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 4. Private Members Selection */}
                {isPrivate ? (
                  <div className="rounded-xl border border-theme-border bg-theme-paper p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-theme-foreground">
                        <Users className="h-4 w-4 text-theme-accent" />
                        <span>Member Access</span>
                      </span>
                      <span className="text-[11px] font-mono text-theme-muted">
                        {selectedMemberIds.length} selected
                      </span>
                    </div>

                    {isLoadingMembers ? (
                      <p className="py-2 text-center text-xs text-theme-muted">Loading members...</p>
                    ) : members.length === 0 ? (
                      <p className="py-2 text-center text-xs text-theme-muted">
                        No other members in this workspace.
                      </p>
                    ) : (
                      <div className="max-h-48 space-y-1 overflow-y-auto pr-1 scrollbar-soft">
                        {members.map((m) => {
                          const isSelected = selectedMemberIds.includes(m.userId);
                          const displayName = m.name || m.email || "Member";
                          return (
                            <button
                              key={m.userId}
                              type="button"
                              disabled={isPending}
                              onClick={() => toggleMember(m.userId)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer",
                                isSelected
                                  ? "bg-theme-paper-strong font-medium text-theme-accent"
                                  : "text-theme-muted hover:bg-theme-paper-strong hover:text-theme-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Avatar
                                  user={{
                                    id: m.userId,
                                    name: m.name,
                                    email: m.email,
                                    avatar: m.avatar
                                  }}
                                  size={22}
                                />
                                <span className="truncate">{displayName}</span>
                              </div>
                              {isSelected ? (
                                <Check className="h-4 w-4 shrink-0 text-theme-accent" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Error Message */}
                {error ? (
                  <p className="rounded-xl border border-theme-danger/30 bg-theme-danger/10 p-3 text-xs text-theme-danger">
                    {error}
                  </p>
                ) : null}
              </>
            )}
          </form>
        </div>

        {/* ── Right Column: Live Mockup Preview (7 of 12 columns) ── */}
        <div className="lg:col-span-7 lg:sticky lg:top-6 space-y-4">
          <div className="rounded-2xl border border-theme-border bg-theme-panel p-5 sm:p-6 shadow-xl space-y-4">
            {/* Preview Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                  <Columns3 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-theme-foreground flex items-center gap-2">
                    <span>Live Board Preview</span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-theme-muted">
                    {selectedTemplate.name} • {selectedTemplate.columns.length} Columns
                  </p>
                </div>
              </div>

              {/* Kanban vs Pipeline Switcher */}
              <div className="inline-flex items-center rounded-lg border border-theme-border bg-theme-paper p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewMode("kanban")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition cursor-pointer",
                    previewMode === "kanban"
                      ? "bg-indigo-600 text-white shadow-2xs dark:bg-dusk-lavender dark:text-ink-950"
                      : "text-theme-muted hover:text-theme-foreground"
                  )}
                >
                  <Columns3 className="h-3.5 w-3.5" />
                  <span>Kanban Mockup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("pipeline")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition cursor-pointer",
                    previewMode === "pipeline"
                      ? "bg-indigo-600 text-white shadow-2xs dark:bg-dusk-lavender dark:text-ink-950"
                      : "text-theme-muted hover:text-theme-foreground"
                  )}
                >
                  <GitCommitHorizontal className="h-3.5 w-3.5" />
                  <span>Pipeline</span>
                </button>
              </div>
            </div>

            {/* Interactive Preview Content */}
            {previewMode === "kanban" ? (
              <BoardMockupPreview
                title={`Kanban Preview: ${selectedTemplate.name}`}
                badgeText="Template"
                subtitle={selectedTemplate.description}
                boardName={name.trim() || undefined}
                isPrivate={isPrivate}
                memberInitials={memberInitials}
                totalMemberCount={totalMemberCount}
                showBoardHeader={true}
                columns={selectedTemplate.columns.map((col) => ({
                  name: col.name,
                  color: col.color,
                  icon: col.icon,
                  defaultCardStatus: col.defaultCardStatus
                }))}
              />
            ) : (
              /* Connected workflow pipeline preview */
              <div className="rounded-xl border border-theme-border bg-theme-paper p-3.5" aria-live="polite">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-theme-foreground truncate">
                      {selectedTemplate.name}
                    </span>
                    <span className="rounded-md border border-theme-border bg-theme-panel px-1.5 py-0.2 font-mono text-[10px] text-theme-muted shrink-0">
                      {selectedTemplate.columns.length} Columns
                    </span>
                  </div>
                  <span className="text-[10px] text-theme-muted hidden sm:inline shrink-0">
                    Default Workflow Sequence
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-soft pb-1">
                  {selectedTemplate.columns.map((column, index) => {
                    const color = getColumnThemeOption(column.color);
                    const status = columnStatusOptions.find((option) => option.value === column.defaultCardStatus);
                    const icon = columnIconOptions.find((option) => option.id === column.icon);
                    const statusMeta = getStatusMeta(column.defaultCardStatus);

                    return (
                      <div key={`${selectedTemplate.id}-${column.name}-${index}`} className="flex items-center gap-2 shrink-0">
                        <div
                          className={cn(
                            "relative min-w-[130px] overflow-hidden rounded-lg border p-2.5",
                            color.columnClass
                          )}
                        >
                          <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", color.accentBarClass)} />
                          <div className="flex min-w-0 items-center gap-1.5 pl-1">
                            <ColumnIconGlyph icon={column.icon} className={cn("h-3.5 w-3.5 shrink-0", color.iconColorClass)} />
                            <span className="truncate text-xs font-medium text-theme-foreground">{column.name}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-1 text-[10px]">
                            <span className={cn("rounded-full border px-1.5 py-0.2", statusMeta.badgeClass)}>
                              {status?.label ?? column.defaultCardStatus}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-theme-muted" title={`Column color: ${color.label}; icon: ${icon?.label ?? column.icon}`}>
                              <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", color.swatchClass)} />
                              {color.label}
                            </span>
                          </div>
                        </div>
                        {index < selectedTemplate.columns.length - 1 && (
                          <span className="text-theme-muted opacity-40">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanatory Footer Tip */}
            <div className="rounded-xl border border-theme-border/60 bg-theme-paper/40 p-3 text-[11px] text-theme-muted leading-relaxed">
              💡 <strong>Instant Customization:</strong> This board will be initialized with the columns and workflow rules previewed above. Once created, you can customize column names, WIP limits, colors, and automation rules in Board Settings at any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
