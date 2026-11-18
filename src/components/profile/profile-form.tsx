"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Check } from "lucide-react";

import { SettingsRow, SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type UserStatus = "ONLINE" | "OFFLINE" | "BUSY";

interface ProfileFormProps {
  user: {
    name: string | null;
    username: string | null;
    bio: string | null;
    status: string;
  };
}

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string; dot: string }[] = [
  {
    value: "ONLINE",
    label: "Online",
    color: "border-theme-success-border bg-theme-success-surface text-theme-success ring-theme-success-border",
    dot: "bg-emerald-400",
  },
  {
    value: "BUSY",
    label: "Busy",
    color: "border-theme-warning-border bg-theme-warning-surface text-theme-warning ring-theme-warning-border",
    dot: "bg-dusk-amber",
  },
  {
    value: "OFFLINE",
    label: "Offline",
    color: "border-theme-border bg-theme-paper text-theme-muted ring-theme-border",
    dot: "bg-stone-500",
  },
];

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [status, setStatus] = useState<UserStatus>((user.status as UserStatus) ?? "ONLINE");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const isDirty =
    name !== (user.name ?? "") ||
    bio !== (user.bio ?? "") ||
    status !== ((user.status as UserStatus) ?? "ONLINE");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (name.trim().length > 80) {
      setMessage({ text: "Display name must be 80 characters or fewer.", ok: false });
      return;
    }
    if (bio.trim().length > 300) {
      setMessage({ text: "Bio must be 300 characters or fewer.", ok: false });
      return;
    }

    setConfirmOpen(true);
  }

  async function handleConfirmSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() || null, status }),
      });

      if (res.ok) {
        setMessage({ text: "Profile saved!", ok: true });
        toast({ message: "Profile saved!", type: "success" });
        router.refresh();
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        const errMsg = d.error ?? "Failed to save profile.";
        setMessage({ text: errMsg, ok: false });
        toast({ message: errMsg, type: "error" });
      }
    } catch {
      const errMsg = "Network error while saving profile.";
      setMessage({ text: errMsg, ok: false });
      toast({ message: errMsg, type: "error" });
    } finally {
      setIsSaving(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <SettingsSection
          title="Profile details"
          description="Update your display name, bio, and presence status visible across workspaces."
          footer={
            <>
              {isDirty ? <span className="mr-auto text-xs text-theme-muted">Unsaved changes</span> : null}
              <Button disabled={isSaving} size="sm" type="submit">
                {isSaving ? "Saving..." : "Save profile"}
              </Button>
            </>
          }
        >
          <SettingsRow
            label="Display name"
            description="Shown on cards, comments, and workspace member lists."
            htmlFor="profile-name"
          >
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="h-9 w-full text-sm sm:w-80"
            />
          </SettingsRow>

          {user.username ? (
            <SettingsRow
              label="Username"
              description="Your unique account handle."
              htmlFor="profile-username"
            >
              <Input
                id="profile-username"
                value={`@${user.username}`}
                readOnly
                className="h-9 w-full cursor-not-allowed text-sm opacity-60 sm:w-80"
              />
            </SettingsRow>
          ) : null}

          <SettingsRow
            label="Bio"
            description="A short intro about yourself (max 300 characters)."
            htmlFor="profile-bio"
            stacked
          >
            <div className="space-y-1.5">
              <Textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short intro about yourself..."
                maxLength={300}
                className="min-h-20 resize-none text-sm"
              />
              <span className="block text-right text-[11px] text-theme-muted">{bio.length}/300</span>
            </div>
          </SettingsRow>

          <SettingsRow
            label="Presence status"
            description="Let teammates know your current availability."
            stacked
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {STATUS_OPTIONS.map((opt) => {
                const selected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition cursor-pointer",
                      selected
                        ? `${opt.color} ring-1`
                        : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-primary/40 hover:text-theme-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        selected ? opt.dot : "bg-stone-500"
                      )}
                    />
                    <span>{opt.label}</span>
                    {selected && <Check className="ml-auto h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </SettingsRow>

          {message ? (
            <div className="px-4 py-3">
              <p
                className={cn(
                  "text-sm",
                  message.ok ? "text-theme-success" : "text-theme-danger"
                )}
              >
                {message.text}
              </p>
            </div>
          ) : null}
        </SettingsSection>
      </form>

      <ConfirmModal
        open={confirmOpen}
        title="Save profile changes?"
        message="Your display name, bio, and presence status will be updated across your workspaces."
        confirmLabel="Save profile"
        loadingLabel="Saving..."
        isLoading={isSaving}
        onConfirm={() => void handleConfirmSave()}
        onClose={() => {
          if (!isSaving) setConfirmOpen(false);
        }}
      />
    </>
  );
}
