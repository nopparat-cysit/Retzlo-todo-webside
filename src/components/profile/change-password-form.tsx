"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className="block space-y-1.5 text-sm text-stone-300">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
        {label}
      </span>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          autoComplete="off"
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-200"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

function StrengthBar({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "bg-red-400",
    "bg-dusk-amber",
    "bg-emerald-400",
    "bg-emerald-400",
  ];

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= score ? colors[score] : "bg-white/10"
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-stone-500">{labels[score]}</p>
    </div>
  );
}

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const mismatch = confirm.length > 0 && confirm !== newPass;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPass !== confirm) {
      setMessage({ text: "Passwords do not match.", ok: false });
      return;
    }
    setIsPending(true);
    setMessage(null);

    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    });

    const data = (await res.json()) as { error?: string };
    setIsPending(false);

    if (res.ok) {
      setMessage({ text: "Password changed successfully!", ok: true });
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } else {
      setMessage({ text: data.error ?? "Failed to change password.", ok: false });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 text-sm font-medium text-stone-200">
        <Lock className="h-4 w-4 text-dusk-lavender" />
        Change password
      </div>

      <PasswordInput
        id="current-password"
        label="Current password"
        value={current}
        onChange={setCurrent}
        placeholder="Your current password"
      />

      <PasswordInput
        id="new-password"
        label="New password"
        value={newPass}
        onChange={setNewPass}
        placeholder="At least 8 characters"
      />

      {newPass && <StrengthBar password={newPass} />}

      <div className="space-y-1.5">
        <PasswordInput
          id="confirm-password"
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Re-enter new password"
        />
        {mismatch && (
          <p className="text-xs text-red-300">Passwords don&apos;t match.</p>
        )}
      </div>

      {message && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            message.ok
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
          )}
        >
          {message.ok && <ShieldCheck className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button disabled={isPending || mismatch || !current || !newPass || !confirm}>
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}
