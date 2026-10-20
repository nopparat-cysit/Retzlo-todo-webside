"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, FolderKanban, Globe, Lock, Users, X } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  BoardTemplatePicker,
  type BoardTemplateId
} from "@/components/kanban/board-template-picker";
import { DEFAULT_BOARD_TEMPLATE_ID } from "@/lib/kanban/board-templates";
import { cn } from "@/lib/utils";

export interface CreateBoardMemberOption {
  userId: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: string;
}

export interface CreatedBoardResult {
  id: string;
  name: string;
  projectId: string;
  isPrivate: boolean;
  templateId?: string;
  cardCount?: number;
  totalCards?: number;
  doneCards?: number;
  columnCount?: number;
  columnsPreview?: Array<{ id: string; name: string; cardCount: number }>;
  memberUserIds?: string[];
  members?: Array<{
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      avatar: string | null;
    };
  }>;
}

export interface CreateBoardModalProps {
  open: boolean;
  projectId: string;
  projectName?: string;
  projectMembers?: CreateBoardMemberOption[];
  onClose: () => void;
  onCreated?: (newBoard: CreatedBoardResult) => void;
  autoNavigate?: boolean;
}

export function CreateBoardModal({
  open,
  projectId,
  projectName,
  projectMembers,
  onClose,
  onCreated,
  autoNavigate = false
}: CreateBoardModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<BoardTemplateId>(DEFAULT_BOARD_TEMPLATE_ID);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Members list state (uses prop if available, otherwise lazy-fetches)
  const [members, setMembers] = useState<CreateBoardMemberOption[]>(projectMembers ?? []);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const hasFetchedMembers = useRef(false);

  useEffect(() => {
    if (projectMembers && projectMembers.length > 0) {
      setMembers(projectMembers);
      return;
    }

    if (open && isPrivate && !hasFetchedMembers.current && projectId) {
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
        .catch(() => {
          // Non-blocking fallback
        })
        .finally(() => {
          setIsLoadingMembers(false);
        });
    }
  }, [open, isPrivate, projectId, projectMembers]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setTemplateId(DEFAULT_BOARD_TEMPLATE_ID);
      setIsPrivate(false);
      setSelectedMemberIds([]);
      setError(null);
      setIsPending(false);
    }
  }, [open]);

  function toggleMember(memberId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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

      const boardResult: CreatedBoardResult = {
        ...data.board,
        columnCount: data.board.columnCount ?? 3,
        totalCards: data.board.cardCount ?? 0,
        doneCards: 0,
        columnsPreview: data.board.columnsPreview ?? [
          { id: "col-1", name: "Backlog", cardCount: 0 },
          { id: "col-2", name: "In Progress", cardCount: 0 },
          { id: "col-3", name: "Done", cardCount: 0 }
        ]
      };

      onCreated?.(boardResult);
      onClose();

      if (autoNavigate) {
        router.push(`/project/${projectId}/board?boardId=${encodeURIComponent(data.board.id)}`);
        router.refresh();
      }
    } catch {
      const fallbackMsg = "An unexpected network error occurred.";
      setError(fallbackMsg);
      toast({ message: fallbackMsg, type: "error" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AppModal
      open={open}
      onClose={() => {
        if (!isPending) onClose();
      }}
      labelledBy="create-board-modal-title"
      contentClassName="w-full max-w-3xl overflow-hidden rounded-2xl"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100dvh-2rem)] space-y-4 overflow-y-auto rounded-2xl border border-theme-border bg-theme-panel p-4 text-theme-foreground shadow-2xl sm:p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-theme-border pb-3">
          <div>
            {projectName ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-theme-accent">
                {projectName}
              </p>
            ) : null}
            <h3
              id="create-board-modal-title"
              className="mt-0.5 flex items-center gap-2 text-xl font-bold text-theme-foreground"
            >
              <FolderKanban className="h-5 w-5 text-theme-accent" />
              <span>Create New Board</span>
            </h3>
            <p className="mt-1 text-xs text-theme-muted">
              Add a new board channel to organize tasks in this workspace.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-theme-muted transition hover:bg-theme-paper hover:text-theme-foreground"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Board Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-foreground">
            Board Name <span className="text-theme-danger">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing Roadmap, Sprint 2, Bug Tracker..."
            maxLength={80}
            autoFocus
            required
            disabled={isPending}
          />
        </div>

        {/* Template Picker */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted">
            Board Template
          </label>
          <BoardTemplatePicker
            selectedId={templateId}
            onSelect={setTemplateId}
            disabled={isPending}
            boardName={name}
            isPrivate={isPrivate}
            memberInitials={
              (isPrivate
                ? members.filter((m) => selectedMemberIds.includes(m.userId))
                : members
              )
                .map((m) =>
                  (m.name || m.email || "MB")
                    .trim()
                    .slice(0, 2)
                    .toUpperCase()
                )
            }
            totalMemberCount={
              isPrivate ? selectedMemberIds.length : members.length || undefined
            }
          />
        </div>

        {/* Privacy Selector */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted">
            Access Visibility
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsPrivate(false)}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3 text-left transition",
                !isPrivate
                  ? "border-theme-accent bg-theme-paper-strong text-theme-accent shadow-xs"
                  : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-border-strong hover:text-theme-foreground"
              )}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Globe className="h-3.5 w-3.5" />
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
                "flex flex-col items-start rounded-xl border p-3 text-left transition",
                isPrivate
                  ? "border-theme-accent bg-theme-paper-strong text-theme-accent shadow-xs"
                  : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-border-strong hover:text-theme-foreground"
              )}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Lock className="h-3.5 w-3.5" />
                <span>Private</span>
              </div>
              <p className="mt-1 text-[11px] opacity-80 leading-relaxed">
                Only invited members can view or manage tasks.
              </p>
            </button>
          </div>
        </div>

        {/* Private Members Selection */}
        {isPrivate ? (
          <div className="rounded-xl border border-theme-border bg-theme-paper p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-theme-foreground">
                <Users className="h-3.5 w-3.5 text-theme-accent" />
                <span>Member Access</span>
              </span>
              <span className="text-[11px] text-theme-muted">
                {selectedMemberIds.length} selected
              </span>
            </div>

            {isLoadingMembers ? (
              <p className="py-2 text-center text-xs text-theme-muted">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="py-2 text-center text-xs text-theme-muted">No other members in this workspace.</p>
            ) : (
              <div className="max-h-36 space-y-1 overflow-y-auto pr-1 scrollbar-soft">
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
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition",
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
                          size={20}
                        />
                        <span className="truncate">{displayName}</span>
                      </div>
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-theme-accent" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* Error message */}
        {error ? (
          <p className="rounded-lg border border-theme-danger/30 bg-theme-danger/10 p-2.5 text-xs text-theme-danger">
            {error}
          </p>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-theme-border pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || isPending}
            variant="primary"
            className="font-semibold"
          >
            {isPending ? "Creating..." : "Create Board"}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}
