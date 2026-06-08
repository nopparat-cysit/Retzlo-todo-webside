"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { Image as ImageIcon, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export function SettingsForm({
  project,
  canManagePrivacy
}: {
  project: {
    id: string;
    name: string;
    description: string | null;
    coverImage: string | null;
    allowMemberPrivateItems: boolean;
  };
  canManagePrivacy: boolean;
}) {
  const router = useRouter();

  // ── Edit state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(project.coverImage);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [allowMemberPrivateItems, setAllowMemberPrivateItems] = useState(project.allowMemberPrivateItems);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── Delete state ──────────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Confirm save modal ────────────────────────────────────────────────────
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ name: string; description: string | null } | null>(null);

  async function handleCoverUpload(file: File) {
    setIsUploadingCover(true);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/projects/${project.id}/cover`, { method: "POST", body: fd });
    const data = (await res.json()) as { coverImage?: string; error?: string };
    setIsUploadingCover(false);
    if (!res.ok) setSaveMsg({ text: data.error ?? "Cover upload failed.", ok: false });
    else { setSaveMsg({ text: "Cover updated!", ok: true }); router.refresh(); }
  }

  function handleSubmitIntent(e: FormEvent) {
    e.preventDefault();
    setPendingPayload({ name: name.trim(), description: description.trim() || null });
    setConfirmSaveOpen(true);
  }

  async function doSave() {
    if (!pendingPayload) return;
    setIsSaving(true);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingPayload),
    });
    setIsSaving(false);
    setConfirmSaveOpen(false);
    if (res.ok) {
      setSaveMsg({ text: "Changes saved.", ok: true });
      router.refresh();
    } else {
      const d = (await res.json()) as { error?: string };
      setSaveMsg({ text: d.error ?? "Could not save.", ok: false });
    }
  }

  async function doDelete() {
    setIsDeleting(true);
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (res.ok) {
      router.push("/projects");
      router.refresh();
    }
  }

  async function toggleMemberPrivacy(value: boolean) {
    setAllowMemberPrivateItems(value);
    setIsSavingPrivacy(true);
    setSaveMsg(null);
    const res = await fetch(`/api/projects/${project.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowMemberPrivateItems: value })
    });
    setIsSavingPrivacy(false);

    if (res.ok) {
      setSaveMsg({ text: "Privacy setting saved.", ok: true });
      router.refresh();
      return;
    }

    const data = (await res.json()) as { error?: string };
    setAllowMemberPrivateItems(project.allowMemberPrivateItems);
    setSaveMsg({ text: data.error ?? "Could not save privacy setting.", ok: false });
  }

  return (
    <div className="space-y-8">
      {/* ── Cover image ───────────────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
          Cover image
        </p>
        <div
          className="relative h-36 cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-ink-950/40"
          onClick={() => coverInputRef.current?.click()}
          title="Click to upload cover"
        >
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-dusk-lavender/20 via-dusk-rose/10 to-dusk-cyan/10" />
          )}
          <div className="absolute inset-0 grid place-items-center bg-ink-950/50 opacity-0 transition hover:opacity-100">
            {isUploadingCover ? (
              <svg className="h-7 w-7 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <ImageIcon className="h-4 w-4" />
                {coverPreview ? "Change cover" : "Upload cover"}
              </div>
            )}
          </div>
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }}
        />
        <p className="mt-1.5 text-[11px] text-stone-600">JPG, PNG, WebP, GIF · Max 5 MB</p>
      </div>

      {/* ── Info form ─────────────────────────────────────────────────────── */}
      <form className="space-y-4" onSubmit={handleSubmitIntent}>
        <label className="block space-y-1.5 text-sm text-stone-300">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">Project name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        </label>
        <label className="block space-y-1.5 text-sm text-stone-300">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">Description</span>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            maxLength={500}
          />
        </label>

        {saveMsg && (
          <p className={`text-sm ${saveMsg.ok ? "text-emerald-300" : "text-red-300"}`}>
            {saveMsg.text}
          </p>
        )}

        <Button type="submit" disabled={isSaving || !name.trim()}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </form>

      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-stone-100">Member private items</h3>
            <p className="mt-1 text-sm text-stone-500">
              Allow members to hide their own diary items and notes from other members. Owners can always see everything.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-ink-950/45 px-3 py-2 text-sm text-stone-300">
            <span>{allowMemberPrivateItems ? "On" : "Off"}</span>
            <input
              checked={allowMemberPrivateItems}
              className="h-4 w-4 accent-dusk-lavender disabled:cursor-not-allowed"
              disabled={!canManagePrivacy || isSavingPrivacy}
              type="checkbox"
              onChange={(event) => toggleMemberPrivacy(event.target.checked)}
            />
          </label>
        </div>
        {!canManagePrivacy ? (
          <p className="mt-3 text-xs text-stone-600">Only the project owner can change this setting.</p>
        ) : null}
      </div>

      {/* ── Danger zone ───────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="text-sm font-semibold text-red-300">Danger Zone</h3>
        <p className="mt-1 text-sm text-stone-400">
          Permanently delete this project and all its contents. This cannot be undone.
        </p>
        <Button
          type="button"
          variant="danger"
          className="mt-4"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete this project
        </Button>
      </div>

      {/* ── Confirm save modal ────────────────────────────────────────────── */}
      <ConfirmModal
        open={confirmSaveOpen}
        title="Save changes"
        message={`Save changes to "${pendingPayload?.name ?? project.name}"?`}
        confirmLabel="Save"
        variant="default"
        onConfirm={doSave}
        onClose={() => setConfirmSaveOpen(false)}
        isLoading={isSaving}
      />

      {/* ── Confirm delete modal ──────────────────────────────────────────── */}
      <ConfirmModal
        open={deleteOpen}
        title="Delete project"
        message={`This will permanently delete "${project.name}" including all boards, columns, cards and notes. This action cannot be undone.`}
        confirmLabel="Delete project"
        variant="danger"
        validateText={project.name}
        validatePlaceholder={`Type "${project.name}" to confirm`}
        isLoading={isDeleting}
        onConfirm={doDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
