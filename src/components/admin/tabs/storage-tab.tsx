"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ExternalLink,
  File,
  FileText,
  HardDrive,
  ImageIcon,
  RefreshCw,
  Search,
  Trash2
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { AdminAttachment } from "../types";

export function StorageTab() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<AdminAttachment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal
  const [pendingDelete, setPendingDelete] = useState<AdminAttachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStorage = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/storage?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data.attachments);
        setTotalCount(data.total);
        setTotalBytes(data.totalBytes);
      } else {
        toast({ message: "Failed to load storage attachments", type: "error" });
      }
    } catch {
      toast({ message: "Network error loading storage data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    fetchStorage();
  }, [fetchStorage]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/storage?id=${pendingDelete.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast({
          message: `Attachment "${pendingDelete.name}" deleted from storage`,
          type: "success"
        });
        setPendingDelete(null);
        fetchStorage();
      } else {
        const data = await res.json();
        toast({ message: data.error || "Failed to delete file", type: "error" });
      }
    } catch {
      toast({ message: "Network error deleting file", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="space-y-4">
      {/* Storage Metrics & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-[#0c0d18] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
              Media & Card Attachments Storage
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Total: {totalCount} files • Consumed:{" "}
              <span className="font-mono font-bold text-indigo-500">
                {formatFileSize(totalBytes)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attachments..."
              className="pl-8 text-xs h-8"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchStorage} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Storage Data Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0c0d18]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/80 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">File Name</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">MIME Type</th>
                <th className="px-4 py-3 font-semibold">Attached Card</th>
                <th className="px-4 py-3 font-semibold">Uploaded By</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400 font-mono">
                    Scanning storage directory...
                  </td>
                </tr>
              ) : attachments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    No attachments uploaded.
                  </td>
                </tr>
              ) : (
                attachments.map((att) => (
                  <tr
                    key={att.id}
                    className="transition-colors hover:bg-stone-50/80 dark:hover:bg-white/[0.03]"
                  >
                    {/* File Name & Preview Icon */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded bg-stone-100 p-1.5 dark:bg-white/5 shrink-0 text-stone-500">
                          {isImage(att.fileType) ? (
                            <ImageIcon className="h-4 w-4 text-indigo-400" />
                          ) : (
                            <FileText className="h-4 w-4 text-stone-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-900 dark:text-stone-100 max-w-[200px]">
                            {att.name}
                          </p>
                          <span className="font-mono text-[10px] text-stone-400">
                            {att.id.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* File Size */}
                    <td className="px-4 py-3 font-mono text-stone-700 dark:text-stone-300">
                      {formatFileSize(att.fileSize)}
                    </td>

                    {/* File Type */}
                    <td className="px-4 py-3 font-mono text-[11px] text-stone-500">
                      {att.fileType}
                    </td>

                    {/* Card & Workspace */}
                    <td className="px-4 py-3">
                      {att.card ? (
                        <div className="min-w-0 max-w-[180px]">
                          <p className="truncate font-medium text-stone-800 dark:text-stone-200">
                            {att.card.title}
                          </p>
                          <p className="truncate text-[10px] text-stone-400">
                            {att.card.column?.board?.project?.name} / {att.card.column?.board?.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Unlinked</span>
                      )}
                    </td>

                    {/* Uploaded By */}
                    <td className="px-4 py-3">
                      {att.user ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={att.user.avatar || undefined}
                            name={att.user.name || att.user.email}
                            size={24}
                          />
                          <span className="truncate text-xs text-stone-600 dark:text-stone-300 max-w-[120px]">
                            {att.user.name || att.user.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Unknown</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 font-mono text-stone-400">
                      {new Date(att.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/5 dark:hover:text-stone-200"
                          title="Open/Download file"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => setPendingDelete(att)}
                          className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <ConfirmModal
          open={Boolean(pendingDelete)}
          onClose={() => setPendingDelete(null)}
          onConfirm={handleDelete}
          title="Delete File Attachment"
          message={`Are you sure you want to permanently delete "${pendingDelete.name}" (${formatFileSize(
            pendingDelete.fileSize
          )})? This will detach the file from its card.`}
          confirmLabel="Delete File"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
