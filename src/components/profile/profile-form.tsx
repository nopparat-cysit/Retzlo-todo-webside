"use client";

import { FormEvent, useState } from "react";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
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
    color: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
    dot: "bg-emerald-400",
  },
  {
    value: "BUSY",
    label: "Busy",
    color: "border-dusk-amber/40 bg-dusk-amber/10 text-dusk-amber ring-dusk-amber/20",
    dot: "bg-dusk-amber",
  },
  {
    value: "OFFLINE",
    label: "Offline",
    color: "border-stone-500/40 bg-stone-500/10 text-stone-400 ring-stone-500/20",
    dot: "bg-stone-500",
  },
];

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [status, setStatus] = useState<UserStatus>((user.status as UserStatus) ?? "ONLINE");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || null, bio: bio || null, status }),
    });

    setIsSaving(false);
    if (res.ok) {
      setMessage({ text: "Profile saved!", ok: true });
    } else {
      const d = (await res.json()) as { error?: string };
      setMessage({ text: d.error ?? "Failed to save.", ok: false });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <label className="block space-y-1.5 text-sm text-stone-300">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
          Display name
        </span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={80}
        />
      </label>

      {/* Username (read-only) */}
      {user.username && (
        <label className="block space-y-1.5 text-sm text-stone-300">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
            Username
          </span>
          <Input value={`@${user.username}`} readOnly className="cursor-not-allowed opacity-60" />
        </label>
      )}

      {/* Bio */}
      <label className="block space-y-1.5 text-sm text-stone-300">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
          Bio
        </span>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short intro about yourself..."
          maxLength={300}
          className="min-h-20 resize-none"
        />
        <span className="block text-right text-[11px] text-stone-600">{bio.length}/300</span>
      </label>

      {/* Status */}
      <div className="space-y-2">
        <span className="block text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
          Presence status
        </span>
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const selected = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition",
                  selected
                    ? `${opt.color} ring-1`
                    : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-white/20 hover:text-stone-200"
                )}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    selected ? opt.dot : "bg-stone-600"
                  )}
                />
                {opt.label}
                {selected && (
                  <Check className="ml-auto h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {message && (
        <p
          className={cn(
            "text-sm",
            message.ok ? "text-emerald-300" : "text-red-300"
          )}
        >
          {message.text}
        </p>
      )}
      <div className="flex justify-end">
        <Button disabled={isSaving}>
          {isSaving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
