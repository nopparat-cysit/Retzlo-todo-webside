"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { Lock, Save, Trash2, Upload } from "lucide-react";

import { SettingsRow, SettingsSection, SettingsSwitch } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

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
  const { toast } = useToast();
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

  const [pendingToggleType, setPendingToggleType] = useState<"privacy" | "notes" | null>(null);
  const [pendingToggleValue, setPendingToggleValue] = useState<boolean>(false);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);

  const isDirty = name.trim() !== project.name || (description.trim() || null) !== (project.description ?? null);

  async function handleCoverUpload(file: File) {
    setIsUploadingCover(true);

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
      setCoverPreview(project.coverImage);
      toast({ message: data.error ?? "Cover upload failed.", type: "error" });
      return;
    }

    if (data.coverImage) {
      setCoverPreview(data.coverImage);
    }
    toast({ message: "Cover image updated.", type: "success" });
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

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingPayload)
    });

    setIsSaving(false);
    setConfirmSaveOpen(false);

    if (response.ok) {
      toast({ message: "Project details saved.", type: "success" });
      router.refresh();
      return;
    }

    const data = (await response.json()) as { error?: string };
    toast({ message: data.error ?? "Could not save project details.", type: "error" });
  }

  async function doDelete() {
    setIsDeleting(true);

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE"
    });

    setIsDeleting(false);

    if (response.ok) {
      toast({ message: "Project deleted.", type: "success" });
      router.push("/projects");
      router.refresh();
    } else {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      toast({ message: data.error ?? "Could not delete project.", type: "error" });
    }
  }

  async function handleToggleConfirm() {
    setConfirmToggleOpen(false);
    if (pendingToggleType === "notes") {
      await toggleNotesEnabled(pendingToggleValue);
    } else if (pendingToggleType === "privacy") {
      await toggleMemberPrivacy(pendingToggleValue);
    }
  }

  async function toggleMemberPrivacy(value: boolean) {
    setAllowMemberPrivateItems(value);
    setIsSavingPrivacy(true);

    const response = await fetch(`/api/projects/${project.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowMemberPrivateItems: value })
    });

    setIsSavingPrivacy(false);

    if (response.ok) {
      toast({ message: "Privacy setting updated.", type: "success" });
      router.refresh();
      return;
    }

    const data = (await response.json()) as { error?: string };
    setAllowMemberPrivateItems(project.allowMemberPrivateItems);
    toast({ message: data.error ?? "Could not save privacy setting.", type: "error" });
  }

  async function toggleNotesEnabled(value: boolean) {
    setNotesEnabled(value);
    setIsSavingPrivacy(true);

    const response = await fetch(`/api/projects/${project.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notesEnabled: value })
    });

    setIsSavingPrivacy(false);

    if (response.ok) {
      toast({ message: value ? "Board notes rail enabled." : "Board notes rail hidden.", type: "success" });
      router.refresh();
      return;
    }

    const data = (await response.json()) as { error?: string };
    setNotesEnabled(project.notesEnabled);
    toast({ message: data.error ?? "Could not save board notes rail setting.", type: "error" });
  }

  function requestToggle(type: "privacy" | "notes", nextValue: boolean) {
    setPendingToggleType(type);
    setPendingToggleValue(nextValue);
    setConfirmToggleOpen(true);
  }

  return (
    <div className="space-y-5">
      {/* Project details */}
      <form onSubmit={handleSubmitIntent}>
        <SettingsSection
          title="Project details"
          description="ชื่อ คำอธิบาย และภาพปกที่สมาชิกเห็นทั่วทั้งโปรเจกต์"
          footer={
            <>
              {isDirty ? <span className="mr-auto text-xs text-theme-muted">มีการแก้ไขที่ยังไม่บันทึก</span> : null}
              <Button disabled={isSaving || !name.trim() || !isDirty} size="sm" type="submit">
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </>
          }
        >
          <SettingsRow label="Project name" description="ชื่อที่แสดงในแถบด้านข้างและหน้ารวมโปรเจกต์" htmlFor="project-name">
            <Input
              className="h-9 w-full text-sm sm:w-80"
              id="project-name"
              maxLength={120}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </SettingsRow>

          <SettingsRow label="Description" description="สรุปสั้น ๆ ว่าพื้นที่ทำงานนี้ใช้ทำอะไร (สูงสุด 500 ตัวอักษร)" htmlFor="project-description" stacked>
            <Textarea
              className="min-h-20 resize-y text-sm"
              id="project-description"
              maxLength={500}
              placeholder="What is this workspace for?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </SettingsRow>

          <SettingsRow label="Cover image" description="JPG, PNG, WebP หรือ GIF ขนาดไม่เกิน 5 MB">
            <div className="flex items-center gap-3">
              <div className="relative aspect-[16/9] w-28 overflow-hidden rounded-lg border border-theme-border bg-theme-paper">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Project cover" className="h-full w-full object-cover" src={coverPreview} />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_20%_15%,rgba(249,199,132,0.18),transparent_32%),linear-gradient(135deg,rgba(169,162,255,0.2),rgba(103,232,249,0.1),rgba(244,114,182,0.1))]" />
                )}
              </div>
              <Button
                disabled={isUploadingCover}
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => coverInputRef.current?.click()}
              >
                {isUploadingCover ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-theme-border border-t-theme-accent" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {coverPreview ? "Change" : "Upload"}
              </Button>
              <input
                ref={coverInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                hidden
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleCoverUpload(file);
                  event.target.value = "";
                }}
              />
            </div>
          </SettingsRow>
        </SettingsSection>
      </form>

      {/* Features */}
      <SettingsSection
        title="Features & privacy"
        description="เปิดเฉพาะโมดูลที่โปรเจกต์นี้ต้องใช้"
        actions={
          !canManagePrivacy ? (
            <span className="inline-flex items-center gap-1 text-xs text-theme-muted">
              <Lock className="h-3 w-3" /> Owner only
            </span>
          ) : undefined
        }
      >
        <SettingsRow label="Board notes rail" description="แสดงหรือซ่อนแผงโน้ตด้านขวาของหน้า Board">
          <SettingsSwitch
            checked={notesEnabled}
            disabled={!canManagePrivacy || isSavingPrivacy}
            label="Board notes rail"
            onToggle={() => requestToggle("notes", !notesEnabled)}
          />
        </SettingsRow>
        <SettingsRow label="Private item hiding" description="ให้สมาชิกซ่อนไดอารี่และโน้ตของตัวเองจากสมาชิกคนอื่นได้">
          <SettingsSwitch
            checked={allowMemberPrivateItems}
            disabled={!canManagePrivacy || isSavingPrivacy}
            label="Private item hiding"
            onToggle={() => requestToggle("privacy", !allowMemberPrivateItems)}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Danger zone */}
      {canManagePrivacy ? (
        <SettingsSection title="Danger zone" tone="danger">
          <SettingsRow
            label="Delete project"
            description="ลบโปรเจกต์พร้อมบอร์ด คอลัมน์ การ์ด ไดอารี่ และโน้ตทั้งหมดอย่างถาวร"
          >
            <Button size="sm" type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete project
            </Button>
          </SettingsRow>
        </SettingsSection>
      ) : null}

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

      <ConfirmModal
        open={confirmToggleOpen}
        title="Change workspace setting"
        message={`Are you sure you want to change this workspace setting?`}
        confirmLabel="Confirm"
        isLoading={isSavingPrivacy}
        variant="default"
        onClose={() => setConfirmToggleOpen(false)}
        onConfirm={handleToggleConfirm}
      />
    </div>
  );
}
