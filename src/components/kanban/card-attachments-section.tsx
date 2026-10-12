"use client";

import { useRef, useState } from "react";
import {
  ExternalLink,
  File,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  Globe,
  Loader2,
  Paperclip,
  Plus,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { CardAttachmentItem } from "@/types/kanban";
import { cn } from "@/lib/utils";

interface CardAttachmentsSectionProps {
  cardId: string;
  attachments?: CardAttachmentItem[];
  onAttachmentsChange?: (attachments: CardAttachmentItem[]) => void;
  disabled?: boolean;
}

export function CardAttachmentsSection({
  cardId,
  attachments = [],
  onAttachmentsChange,
  disabled = false
}: CardAttachmentsSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Deletion modal state
  const [attachmentToDelete, setAttachmentToDelete] = useState<CardAttachmentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast({ message: "File size exceeds 15 MB limit.", type: "error" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/cards/${cardId}/attachments`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.attachment) {
        onAttachmentsChange?.([data.attachment, ...attachments]);
        toast({ message: `Attached "${data.attachment.name}".`, type: "success" });
      } else {
        toast({ message: data.error || "Failed to upload file.", type: "error" });
      }
    } catch {
      toast({ message: "Network error uploading attachment.", type: "error" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    setIsSubmittingLink(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: linkUrl.trim(),
          name: linkName.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.attachment) {
        onAttachmentsChange?.([data.attachment, ...attachments]);
        toast({ message: `Attached link "${data.attachment.name}".`, type: "success" });
        setLinkUrl("");
        setLinkName("");
        setIsAddingLink(false);
      } else {
        toast({ message: data.error || "Failed to add link.", type: "error" });
      }
    } catch {
      toast({ message: "Network error adding link.", type: "error" });
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!attachmentToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/cards/${cardId}/attachments/${attachmentToDelete.id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        onAttachmentsChange?.(attachments.filter((a) => a.id !== attachmentToDelete.id));
        toast({ message: `Removed attachment "${attachmentToDelete.name}".`, type: "success" });
        setAttachmentToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ message: data.error || "Failed to remove attachment.", type: "error" });
      }
    } catch {
      toast({ message: "Network error removing attachment.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header & Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-indigo-500 dark:text-dusk-lavender" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Attachments
          </span>
          {attachments.length > 0 && (
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.2 text-[10px] font-mono text-indigo-600 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
              {attachments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-7 gap-1 px-2 text-xs"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
            )}
            <span>Upload</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => setIsAddingLink(!isAddingLink)}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Link</span>
          </Button>
        </div>
      </div>

      {/* Add Web Link Inline Form */}
      {isAddingLink && (
        <form
          onSubmit={handleAddLink}
          className="rounded-xl border border-indigo-500/25 bg-indigo-50/50 p-3 space-y-2 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 dark:text-dusk-lavender">
            <span>Attach web link or document URL</span>
            <button
              type="button"
              onClick={() => setIsAddingLink(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              type="url"
              placeholder="https://example.com/spec.pdf"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              className="h-8 text-xs"
              autoFocus
            />
            <Input
              type="text"
              placeholder="Display name (optional)"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingLink(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmittingLink || !linkUrl.trim()}
              className="h-7 text-xs"
            >
              {isSubmittingLink ? "Attaching..." : "Attach Link"}
            </Button>
          </div>
        </form>
      )}

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200/90 bg-stone-50/50 p-4 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            No attachments yet. Upload images, documents, or attach external links.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {attachments.map((item) => {
            const isImage =
              item.fileType?.startsWith("image/") ||
              /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.url);

            return (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-stone-200/90 bg-white p-2.5 shadow-xs transition hover:border-indigo-400/50 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
              >
                {/* Thumbnail or File Type Icon */}
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-stone-200/60 bg-stone-100 dark:border-white/10 dark:bg-white/[0.05]">
                  {isImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileIcon fileType={item.fileType} />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-stone-900 hover:text-indigo-600 dark:text-stone-100 dark:hover:text-dusk-lavender"
                  >
                    <span className="truncate">{item.name}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                  </a>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-stone-400 dark:text-stone-500">
                    {item.size ? <span>{formatFileSize(item.size)}</span> : null}
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setAttachmentToDelete(item)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-stone-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 opacity-60 group-hover:opacity-100"
                  title="Remove attachment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Removing Attachment */}
      <ConfirmModal
        open={Boolean(attachmentToDelete)}
        title="Remove Attachment"
        message={`Are you sure you want to remove "${attachmentToDelete?.name}"?`}
        confirmLabel="Remove"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setAttachmentToDelete(null)}
      />
    </div>
  );
}

function FileIcon({ fileType }: { fileType?: string | null }) {
  if (!fileType) return <Paperclip className="h-4 w-4 text-stone-500" />;
  if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-rose-500" />;
  if (fileType.includes("sheet") || fileType.includes("csv") || fileType.includes("excel"))
    return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
  if (fileType.includes("image")) return <FileImage className="h-4 w-4 text-indigo-500" />;
  if (fileType.includes("json") || fileType.includes("javascript") || fileType.includes("typescript"))
    return <FileCode className="h-4 w-4 text-amber-500" />;
  if (fileType === "link") return <Globe className="h-4 w-4 text-sky-500" />;
  return <File className="h-4 w-4 text-stone-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
