"use client";

import { FormEvent, useState } from "react";
import { BookOpenCheck, FileText, Plus, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";

type HubMode = "diary" | "note" | null;

export function ProjectQuickHub({
  projectId,
  allowMemberPrivateItems
}: {
  projectId: string;
  allowMemberPrivateItems: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<HubMode>(null);
  const [error, setError] = useState<string | null>(null);

  function openMode(nextMode: HubMode) {
    setError(null);
    setMode(nextMode);
    setIsOpen(false);
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[130]">
        {isOpen ? (
          <div className="mb-3 w-48 overflow-hidden rounded-2xl border border-white/15 bg-[#020208] p-2 shadow-[0_22px_58px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <button
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-stone-200 transition hover:bg-dusk-lavender/12 hover:text-dusk-lavender"
              type="button"
              onClick={() => openMode("diary")}
            >
              <BookOpenCheck className="h-4 w-4" />
              Diary list
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-stone-200 transition hover:bg-dusk-amber/12 hover:text-dusk-amber"
              type="button"
              onClick={() => openMode("note")}
            >
              <FileText className="h-4 w-4" />
              Note
            </button>
          </div>
        ) : null}
        <button
          className="grid h-14 w-14 place-items-center rounded-full border border-dusk-lavender/35 bg-dusk-lavender text-ink-950 shadow-[0_18px_45px_rgba(169,162,255,0.3)] transition hover:-translate-y-0.5 hover:bg-dusk-amber"
          type="button"
          aria-label="Open project quick actions"
          onClick={() => setIsOpen((current) => !current)}
        >
          <Plus className={cn("h-6 w-6 transition", isOpen && "rotate-45")} />
        </button>
      </div>

      {mode ? (
        <QuickCreateModal
          allowMemberPrivateItems={allowMemberPrivateItems}
          error={error}
          mode={mode}
          onClose={() => setMode(null)}
          onError={setError}
          projectId={projectId}
        />
      ) : null}
    </>
  );
}

function QuickCreateModal({
  allowMemberPrivateItems,
  error,
  mode,
  onClose,
  onError,
  projectId
}: {
  allowMemberPrivateItems: boolean;
  error: string | null;
  mode: Exclude<HubMode, null>;
  onClose: () => void;
  onError: (error: string | null) => void;
  projectId: string;
}) {
  const [color, setColor] = useState<CardColor>("DEFAULT");
  const [isHidden, setIsHidden] = useState(false);
  const isDiary = mode === "diary";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch(isDiary ? `/api/projects/${projectId}/diary-items` : `/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isDiary
          ? {
              title: formData.get("title"),
              description: formData.get("content"),
              color,
              intervalDays: Number(formData.get("intervalDays") ?? 1),
              startDate: formData.get("startDate"),
              isHidden
            }
          : {
              title: formData.get("title"),
              content: formData.get("content"),
              color
            }
      )
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      onError(data.error ?? "Could not create item.");
      return;
    }

    onClose();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form className="lofi-panel w-full max-w-xl rounded-lg p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">{isDiary ? "Recurring Diary" : "Project Note"}</p>
            <h2 className="mt-1 text-2xl font-semibold">{isDiary ? "Add diary list" : "Add note"}</h2>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4">
          <Input name="title" placeholder={isDiary ? "Diary title" : "Note title"} required />
          <Textarea className="min-h-32" name="content" placeholder={isDiary ? "What should repeat?" : "Write a note..."} />
          <ColorPicker selectedColor={color} onChange={setColor} />
          {isDiary ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-300">
                <span>Start date</span>
                <Input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              </label>
              <label className="space-y-2 text-sm text-stone-300">
                <span>Repeat every</span>
                <Input name="intervalDays" type="number" min={1} max={365} defaultValue={1} required />
              </label>
            </div>
          ) : null}
          {isDiary ? (
            <label className={cn("flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-stone-300", !allowMemberPrivateItems && "opacity-60")}>
              <span>Hide from other members</span>
              <input
                checked={isHidden}
                className="h-4 w-4 accent-dusk-lavender"
                disabled={!allowMemberPrivateItems}
                type="checkbox"
                onChange={(event) => setIsHidden(event.target.checked)}
              />
            </label>
          ) : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

function ColorPicker({
  selectedColor,
  onChange
}: {
  selectedColor: CardColor;
  onChange: (color: CardColor) => void;
}) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Color</span>
      <div className="flex flex-wrap gap-2">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);

          return (
            <button
              key={option.value}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border bg-white/[0.035] transition hover:scale-105 hover:border-white/25",
                selectedColor === option.value
                  ? "border-dusk-amber ring-2 ring-dusk-amber/45 ring-offset-2 ring-offset-ink-950"
                  : "border-white/10"
              )}
              title={option.label}
              type="button"
              onClick={() => onChange(normalizeCardColor(option.value))}
            >
              <span className={cn("h-5 w-5 rounded-full border", meta.swatchClass)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
