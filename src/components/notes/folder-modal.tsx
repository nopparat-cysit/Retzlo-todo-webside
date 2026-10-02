"use client";

import { FormEvent, useState } from "react";
import { Folder, X } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cardColorOptions } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { NoteFolderItem } from "@/types/note";

const FOLDER_ICONS = ["📁", "📂", "💼", "🚀", "💡", "📚", "🎯", "🏷️", "🎨", "📝", "☕", "⭐"];

interface FolderModalProps {
  folder?: NoteFolderItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color: string; icon: string }) => Promise<void>;
}

export function FolderModal({ folder, open, onClose, onSave }: FolderModalProps) {
  const [name, setName] = useState(folder?.name ?? "");
  const [color, setColor] = useState(folder?.color ?? "DEFAULT");
  const [icon, setIcon] = useState(folder?.icon ?? "📁");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a folder name.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({ name: trimmed, color, icon });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save folder.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      labelledBy="folder-modal-title"
      contentClassName="lofi-panel flex max-h-[calc(100vh-2rem)] max-w-md w-full flex-col overflow-hidden rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h2 id="folder-modal-title" className="text-lg font-semibold text-stone-100">
              {folder ? "Edit Folder" : "New Folder"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <p className="rounded-md border border-theme-danger-border bg-theme-danger-surface p-2.5 text-xs text-theme-danger">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
              Folder Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint Planning, Ideas, Archive..."
              maxLength={60}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg border text-base transition",
                    icon === emoji
                      ? "border-dusk-lavender bg-dusk-lavender/25 shadow-sm scale-105"
                      : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/10"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {cardColorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition",
                    opt.swatchClass,
                    color === opt.value
                      ? "ring-2 ring-dusk-lavender ring-offset-2 ring-offset-ink-950 scale-110"
                      : "opacity-80 hover:opacity-100"
                  )}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 bg-white/[0.02] px-5 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : folder ? "Save Changes" : "Create Folder"}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}
