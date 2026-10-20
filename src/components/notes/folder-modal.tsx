"use client";

import { FormEvent, useState } from "react";
import { Eye, Folder, X } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ColorSwatchPicker } from "@/components/ui/color-swatch-picker";
import { Input } from "@/components/ui/input";
import { cardColorOptions, getCardColorMeta } from "@/lib/theme/card-colors";
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
  const colorMeta = getCardColorMeta(color);

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

        <div className="space-y-4 p-5 overflow-y-auto">
          {error && (
            <p className="rounded-md border border-theme-danger-border bg-theme-danger-surface p-2.5 text-xs text-theme-danger">
              {error}
            </p>
          )}

          {/* Live Folder Card & Sidebar Mockup Preview */}
          <div className="rounded-xl border-2 border-indigo-500/35 bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/30 p-3 dark:border-dusk-lavender/35 dark:from-ink-950/70 dark:via-ink-950/50 dark:to-stone-900/60 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                <span>Folder Mockup Preview</span>
              </span>
              <span className="rounded-full border border-indigo-200/70 bg-white/80 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-dusk-lavender">
                Live Mockup
              </span>
            </div>

            <div
              className={cn(
                "flex items-center justify-between gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all",
                colorMeta.cardClass
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-stone-200/70 bg-white/80 text-base dark:border-white/10 dark:bg-white/5">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {name.trim() || "Sprint Planning"}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    {colorMeta.label} Theme · Shared Folder
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-stone-200/80 bg-white/80 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-600 dark:border-white/10 dark:bg-white/10 dark:text-stone-300 shrink-0">
                4 notes
              </span>
            </div>
          </div>

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

          <ColorSwatchPicker
            label="Folder color"
            value={color}
            onChange={(c) => setColor(c)}
          />
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
