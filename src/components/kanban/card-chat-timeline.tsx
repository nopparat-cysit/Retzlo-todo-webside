"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Paperclip,
  FileText,
  Loader2,
  X,
  Download
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { useLiveSync } from "@/hooks/use-live-sync";
import { cn } from "@/lib/utils";
import type { CardCommentItem, ChatAttachment } from "@/types/kanban";

interface CardChatTimelineProps {
  cardId: string;
  currentUserId?: string;
  isProjectOwner?: boolean;
  onCommentCountChange?: (count: number) => void;
}

function formatCommentDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (isToday) {
      return `Today ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Yesterday ${timeStr}`;
    }

    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${timeStr}`;
  } catch {
    return "";
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function CardChatTimeline({
  cardId,
  currentUserId,
  isProjectOwner = false,
  onCommentCountChange
}: CardChatTimelineProps) {
  const [comments, setComments] = useState<CardCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "COMMENTS" | "ACTIVITY">("ALL");

  const [commentToDelete, setCommentToDelete] = useState<CardCommentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const streamContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoadRef = useRef(true);
  const { toast } = useToast();

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/cards/${cardId}/comments`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
      });
      if (!res.ok) return;

      const data = (await res.json()) as { comments?: CardCommentItem[] };
      if (Array.isArray(data.comments)) {
        setComments(data.comments);
        onCommentCountChange?.(data.comments.length);
      }
    } catch {
      // Background sync errors remain silent
    } finally {
      setIsLoading(false);
    }
  }, [cardId, onCommentCountChange]);

  const { broadcastChange } = useLiveSync({
    channelKey: `card:${cardId}:comments`,
    intervalMs: 3000,
    onSync: fetchComments
  });

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (comments.length > 0 && streamContainerRef.current) {
      if (isInitialLoadRef.current) {
        streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
        isInitialLoadRef.current = false;
      } else {
        streamContainerRef.current.scrollTo({
          top: streamContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [comments]);

  const filteredComments = useMemo(() => {
    if (filter === "COMMENTS") {
      return comments.filter((c) => c.type === "COMMENT");
    }
    if (filter === "ACTIVITY") {
      return comments.filter((c) => c.type === "SYSTEM");
    }
    return comments;
  }, [comments, filter]);

  const commentsOnlyCount = useMemo(
    () => comments.filter((c) => c.type === "COMMENT").length,
    [comments]
  );
  const activityOnlyCount = useMemo(
    () => comments.filter((c) => c.type === "SYSTEM").length,
    [comments]
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast({ message: `File "${file.name}" exceeds 10MB limit.`, type: "error" });
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        if (data.file) {
          setStagedAttachments((prev) => [...prev, data.file]);
        }
      }
    } catch (err: any) {
      toast({ message: err.message || "Failed to upload file.", type: "error" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemoveStaged(index: number) {
    setStagedAttachments((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSendMessage(e?: React.SyntheticEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = inputText.trim();
    if ((!trimmed && stagedAttachments.length === 0) || isSubmitting || isUploading) return;

    const currentStaged = [...stagedAttachments];
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CardCommentItem = {
      id: tempId,
      cardId,
      authorId: currentUserId || "me",
      author: {
        id: currentUserId || "me",
        name: "You",
        email: "",
        avatar: null
      },
      content: trimmed,
      type: "COMMENT",
      metadata: currentStaged.length > 0 ? { attachments: currentStaged } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComments((prev) => [...prev, optimisticComment]);
    setInputText("");
    setStagedAttachments([]);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/cards/${cardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          attachments: currentStaged.length > 0 ? currentStaged : undefined
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to post comment");
      }

      const data = (await res.json()) as { comment?: CardCommentItem };
      if (data.comment) {
        setComments((prev) => prev.map((c) => (c.id === tempId ? data.comment! : c)));
        broadcastChange("NEW_COMMENT");
        toast({ message: "Comment sent.", type: "success" });
      }
    } catch (err: any) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setInputText(trimmed);
      setStagedAttachments(currentStaged);
      toast({ message: err.message || "Could not send comment.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      void handleSendMessage();
    }
  }

  async function handleDeleteConfirm() {
    if (!commentToDelete || isDeleting) return;

    setIsDeleting(true);
    const commentId = commentToDelete.id;

    try {
      const res = await fetch(`/api/cards/${cardId}/comments/${commentId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete comment");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      broadcastChange("COMMENT_DELETED");
      toast({ message: "Comment deleted.", type: "success" });
      setCommentToDelete(null);
    } catch (err: any) {
      toast({ message: err.message || "Could not delete comment.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  }

  function renderSystemIcon(action?: unknown) {
    if (action === "COLUMN_MOVE") return <ArrowRightLeft className="h-3 w-3 text-dusk-lavender" />;
    if (action === "STATUS_CHANGE") return <CheckCircle2 className="h-3 w-3 text-dusk-amber" />;
    if (action === "PRIORITY_CHANGE") return <AlertCircle className="h-3 w-3 text-dusk-rose" />;
    return <Sparkles className="h-3 w-3 text-dusk-lavender" />;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-dusk-lavender" />
          <span className="text-sm font-semibold text-stone-200">
            Discussion & Activity
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-stone-300">
            {comments.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "rounded-md px-2 py-1 font-medium transition",
              filter === "ALL"
                ? "bg-dusk-lavender/20 text-dusk-lavender font-semibold"
                : "text-stone-400 hover:text-stone-200"
            )}
          >
            All ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("COMMENTS")}
            className={cn(
              "rounded-md px-2 py-1 font-medium transition",
              filter === "COMMENTS"
                ? "bg-dusk-lavender/20 text-dusk-lavender font-semibold"
                : "text-stone-400 hover:text-stone-200"
            )}
          >
            Chat ({commentsOnlyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ACTIVITY")}
            className={cn(
              "rounded-md px-2 py-1 font-medium transition",
              filter === "ACTIVITY"
                ? "bg-dusk-lavender/20 text-dusk-lavender font-semibold"
                : "text-stone-400 hover:text-stone-200"
            )}
          >
            Activity ({activityOnlyCount})
          </button>
        </div>
      </div>

      {/* Stream Area */}
      <div
        ref={streamContainerRef}
        className="scrollbar-soft max-h-[320px] min-h-[140px] overflow-y-auto space-y-3 pr-1 py-1"
      >
        {isLoading && comments.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-stone-500">
            Loading timeline...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="flex h-28 flex-col items-center justify-center text-center text-xs text-stone-500">
            <MessageSquare className="h-6 w-6 stroke-1 text-stone-600 mb-1" />
            <span>No activity yet. Start the conversation below!</span>
          </div>
        ) : (
          filteredComments.map((item) => {
            const isMe = Boolean(item.authorId === "me" || (currentUserId && item.authorId === currentUserId));
            const canDelete = isMe || isProjectOwner;
            const isOptimistic = item.id.startsWith("temp-");
            const attachments = (item.metadata as any)?.attachments as ChatAttachment[] | undefined;

            if (item.type === "SYSTEM") {
              const action = item.metadata && typeof item.metadata === "object" ? (item.metadata as any).action : undefined;
              return (
                <div key={item.id} className="flex justify-center my-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[11px] text-stone-400">
                    {renderSystemIcon(action)}
                    <span className="font-medium text-stone-300">
                      {item.author.name || item.author.email || "Someone"}
                    </span>
                    <span>{item.content}</span>
                    <span className="text-stone-500 font-mono text-[10px]">
                      • {formatCommentDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              );
            }

            // Normal Comment Bubble
            return (
              <div
                key={item.id}
                className={cn(
                  "group flex gap-2.5 items-start",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}
              >
                {!isMe && (
                  <div className="shrink-0 pt-0.5">
                    <Avatar user={item.author} size={28} />
                  </div>
                )}

                <div className={cn("flex flex-col max-w-[82%]", isMe ? "items-end" : "items-start")}>
                  {/* Sender Name & Timestamp */}
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1 mb-0.5">
                    <span className="font-medium text-stone-300">
                      {isMe ? "You" : item.author.name || item.author.email}
                    </span>
                    <span className="text-stone-500">•</span>
                    <span>{formatCommentDate(item.createdAt)}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "relative rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words whitespace-pre-wrap transition",
                      isMe
                        ? "bg-dusk-lavender/15 border border-dusk-lavender/30 text-stone-100 rounded-tr-xs"
                        : "bg-white/[0.05] border border-white/10 text-stone-200 rounded-tl-xs",
                      isOptimistic && "opacity-60 italic"
                    )}
                  >
                    {item.content && <div>{item.content}</div>}

                    {/* Attachments rendering */}
                    {attachments && attachments.length > 0 && (
                      <div className={cn("space-y-1.5", item.content ? "mt-2" : "")}>
                        {attachments.map((att, idx) => {
                          if (att.isImage) {
                            return (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block overflow-hidden rounded-xl border border-white/10 hover:opacity-90 transition"
                              >
                                <img
                                  src={att.url}
                                  alt={att.name || "Attachment"}
                                  className="max-h-[160px] w-auto max-w-full rounded-xl object-contain bg-black/20"
                                  loading="lazy"
                                />
                              </a>
                            );
                          }
                          return (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={att.name}
                              className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-stone-200 hover:bg-white/[0.08] transition"
                            >
                              <FileText className="h-4 w-4 shrink-0 text-dusk-lavender" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-medium text-stone-200">
                                  {att.name}
                                </div>
                                {att.size ? (
                                  <div className="text-[10px] text-stone-400">
                                    {formatFileSize(att.size)}
                                  </div>
                                ) : null}
                              </div>
                              <Download className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Delete action button on hover */}
                    {canDelete && !isOptimistic && (
                      <button
                        type="button"
                        onClick={() => setCommentToDelete(item)}
                        className={cn(
                          "absolute top-1 text-stone-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1 rounded-md",
                          isMe ? "-left-6" : "-right-6"
                        )}
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Staged attachments preview */}
      {stagedAttachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {stagedAttachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-stone-200"
            >
              {att.isImage ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="h-4 w-4 rounded object-cover"
                />
              ) : (
                <FileText className="h-3.5 w-3.5 text-dusk-lavender" />
              )}
              <span className="max-w-[140px] truncate text-[11px] text-stone-300">
                {att.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveStaged(idx)}
                className="ml-0.5 rounded p-0.5 text-stone-400 hover:bg-white/10 hover:text-stone-100 transition cursor-pointer"
                title="Remove attachment"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="relative flex items-center gap-2 pt-1">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSubmitting}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-stone-400 hover:text-stone-100 hover:bg-white/[0.08] transition cursor-pointer",
            isUploading && "animate-pulse"
          )}
          title="Attach files or images"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-dusk-lavender" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </button>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Leave a message or task update... (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="scrollbar-soft flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs text-stone-100 placeholder-stone-500 outline-none transition focus:border-dusk-lavender/50 focus:bg-white/[0.06]"
        />
        <button
          type="button"
          onClick={() => void handleSendMessage()}
          disabled={(!inputText.trim() && stagedAttachments.length === 0) || isSubmitting || isUploading}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer",
            (inputText.trim() || stagedAttachments.length > 0) && !isSubmitting && !isUploading
              ? "border-dusk-lavender/60 bg-dusk-lavender/25 text-dusk-lavender hover:bg-dusk-lavender/35 hover:scale-105"
              : "border-white/10 bg-white/[0.02] text-stone-600 cursor-not-allowed"
          )}
          title="Send message (Enter)"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(commentToDelete)}
        title="Delete comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setCommentToDelete(null)}
      />
    </div>
  );
}
