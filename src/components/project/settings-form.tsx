"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import type { ReactNode } from "react";
import { EyeOff, FileText, Image as ImageIcon, Lock, Save, Shield, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SettingsForm({
  canManagePrivacy,
  project
}: {
  canManagePrivacy: boolean;
  project: {
    id: string;
    name: string;
    description: string | null;
    coverImage: string | null;
    allowMemberPrivateItems: boolean;
    notesEnabled: boolean;
  };
}) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(project.coverImage);
  const [allowMemberPrivateItems, setAllowMemberPrivateItems] = useState(project.allowMemberPrivateItems);
  const [notesEnabled, setNotesEnabled] = useState(project.notesEnabled);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ name: string; description: string | null } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleCoverUpload(file: File) {
    setIsUploadingCover(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => setCoverPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/projects/${project.id}/cover`, {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as { coverImage?: string; error?: string };

    setIsUploadingCover(false);

    if (!response.ok) {
      setStatusMessage({ ok: false, text: data.error ?? "Cover upload failed." });
      return;
    }

    if (data.coverImage) {
      setCoverPreview(data.coverImage);
    }
    setStatusMessage({ ok: true, text: "Cover updated." });
    router.refresh();
  }

  function handleSubmitIntent(event: FormEvent) {
    event.preventDefault();
    setPendingPayload({
      name: name.trim(),
      description: description.trim() || null
    });
    setConfirmSaveOpen(true);
  }

  async function doSave() {
    if (!pendingPayload) return;

    setIsSaving(true);
    setStatusMessage(null);

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingPayload)
    });

    setIsSaving(false);
    setConfirmSaveOpen(false);

    if (response.ok) {
      setStatusMessage({ ok: true, text: "Project details saved." });
      router.refresh();
      return;
    }

    const data = (await response.json()) as { error?: string };
    setStatusMessage({ ok: false, text: data.error ?? "Could not save project details." });
  }

  async function doDelete() {
    setIsDeleting(true);

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE"
    });

    setIsDeleting(false);

    if (response.ok) {
      router.push("/projects");
      router.refresh();
    }
  }

  async function toggleMemberPrivacy(value: boolean) {
    setAllowMemberPrivateItems(value);
    setIsSavingPrivacy(true);
    setStatusMessage(null);

    const response = await fetch(`/api/projects/${project.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowMemberPrivateItems: value })
    });

    setIsSavingPrivacy(false);

    if (response.ok) {
      setStatusMessage({ ok: true, text: "Privacy setting saved." });
      router.refresh();
      return;
    }

    const data = (await response.json()) as { error?: string };
    setAllowMemberPrivateItems(project.allowMemberPrivateItems);
    setStatusMessage({ ok: false, text: data.error ?? "Could not save privacy setting." });
  }

  async function toggleNotesEnabled(value: boolean) {
    setNotesEnabled(value);
    setIsSavingPrivacy(true);
    setStatusMessage(null);

    const response = await fetch(`/api/projects/${project.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notesEnabled: value })
    });

    setIsSavingPrivacy(false);

    if (response.ok) {
      setStatusMessage({ ok: true, text: value ? "Notes enabled." : "Notes disabled." });
      router.refresh();
      return;
    }

    const data = (await response.json()) as { error?: string };
    setNotesEnabled(project.notesEnabled);
    setStatusMessage({ ok: false, text: data.error ?? "Could not save Notes setting." });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <form className="lofi-panel min-w-0 rounded-2xl p-5 sm:p-6" onSubmit={handleSubmitIntent}>
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Project details</p>
          <h2 className="text-xl font-semibold text-stone-100">Workspace identity</h2>
          <p className="max-w-2xl text-sm leading-6 text-stone-500">
            Keep the name, description, and cover easy to recognize across the project.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,1.05fr)]">
          <div>
            <button
              className="group relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-ink-950/45 text-left"
              title="Upload project cover"
              type="button"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="Project cover" className="h-full w-full object-cover" src={coverPreview} />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_15%,rgba(249,199,132,0.18),transparent_32%),linear-gradient(135deg,rgba(169,162,255,0.2),rgba(103,232,249,0.1),rgba(244,114,182,0.1))]" />
              )}
              <div className="absolute inset-0 grid place-items-center bg-ink-950/45 opacity-0 transition group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/70 px-3 py-2 text-sm font-medium text-white">
                  {isUploadingCover ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {coverPreview ? "Change cover" : "Upload cover"}
                </span>
              </div>
            </button>
            <input
              ref={coverInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCoverUpload(file);
              }}
            />
            <p className="mt-2 flex items-center gap-2 text-xs text-stone-600">
              <ImageIcon className="h-3.5 w-3.5" />
              JPG, PNG, WebP, or GIF. Max 5 MB.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Project name</span>
              <Input maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Description</span>
              <Textarea
                className="min-h-32 resize-y"
                maxLength={500}
                placeholder="What is this workspace for?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            {statusMessage ? (
              <p className={cn("rounded-lg border px-3 py-2 text-sm", statusMessage.ok ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" : "border-dusk-rose/25 bg-dusk-rose/10 text-dusk-rose")}>
                {statusMessage.text}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button disabled={isSaving || !name.trim()} type="submit">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="min-w-0 space-y-4">
        <section className="lofi-panel rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-lavender/20 bg-dusk-lavender/10 text-dusk-lavender">
              <Shield className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Workspace features</p>
              <h3 className="mt-1 text-base font-semibold text-stone-100">Access and visibility</h3>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                Keep lightweight modules available only when this project needs them.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <SettingsToggleRow
              checked={notesEnabled}
              description="Show Notes in navigation, board side panel, and project note pages."
              disabled={!canManagePrivacy || isSavingPrivacy}
              icon={<FileText className="h-4 w-4 text-dusk-cyan" />}
              label="Notes module"
              onToggle={() => void toggleNotesEnabled(!notesEnabled)}
            />
            <SettingsToggleRow
              checked={allowMemberPrivateItems}
              description="Members can hide their own diary items and notes from other members."
              disabled={!canManagePrivacy || isSavingPrivacy}
              icon={<EyeOff className="h-4 w-4 text-dusk-lavender" />}
              label="Private item hiding"
              onToggle={() => void toggleMemberPrivacy(!allowMemberPrivateItems)}
            />
          </div>

          {!canManagePrivacy ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-stone-600">
              <Lock className="h-3.5 w-3.5" />
              Only the project owner can change this setting.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-dusk-rose/25 bg-dusk-rose/[0.055] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-dusk-rose">Danger zone</p>
          <h3 className="mt-1 text-base font-semibold text-stone-100">Delete project</h3>
          <p className="mt-1 text-sm leading-6 text-stone-400">
            Permanently delete this project and all boards, columns, cards, diary items, and notes inside it.
          </p>
          <Button className="mt-4" type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete project
          </Button>
        </section>
      </div>

      <ConfirmModal
        open={confirmSaveOpen}
        title="Save changes"
        message={`Save changes to "${pendingPayload?.name ?? project.name}"?`}
        confirmLabel="Save"
        isLoading={isSaving}
        variant="default"
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={doSave}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete project"
        message={`This will permanently delete "${project.name}" including all boards, columns, cards, and notes. This action cannot be undone.`}
        confirmLabel="Delete project"
        isLoading={isDeleting}
        validatePlaceholder={`Type "${project.name}" to confirm`}
        validateText={project.name}
        variant="danger"
        onClose={() => setDeleteOpen(false)}
        onConfirm={doDelete}
      />
    </div>
  );
}

function SettingsToggleRow({
  checked,
  description,
  disabled,
  icon,
  label,
  onToggle
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-200">{label}</p>
          <p className="mt-0.5 text-xs leading-5 text-stone-500">{description}</p>
        </div>
      </div>
      <button
        aria-checked={checked}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-dusk-lavender disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-dusk-lavender" : "bg-white/10"
        )}
        disabled={disabled}
        role="switch"
        type="button"
        onClick={onToggle}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
