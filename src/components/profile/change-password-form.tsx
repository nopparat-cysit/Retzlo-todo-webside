"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

import { SettingsRow, SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full sm:w-80">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••"}
        autoComplete="off"
        className="h-9 pr-10 text-sm"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted transition hover:text-theme-foreground cursor-pointer"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
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
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= score ? colors[score] : "bg-theme-border"
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-theme-muted">{labels[score]}</p>
    </div>
  );
}

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const tooShort = newPass.length > 0 && newPass.length < 8;
  const mismatch = confirm.length > 0 && confirm !== newPass;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!current) {
      setMessage({ text: "Current password is required.", ok: false });
      return;
    }
    if (newPass.length < 8) {
      setMessage({ text: "New password must be at least 8 characters.", ok: false });
      return;
    }
    if (newPass !== confirm) {
      setMessage({ text: "Passwords do not match.", ok: false });
      return;
    }

    setConfirmOpen(true);
  }

  async function handleConfirmChange() {
    setIsPending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.ok) {
        setMessage({ text: "Password changed successfully!", ok: true });
        toast({ message: "Password changed successfully!", type: "success" });
        setCurrent("");
        setNewPass("");
        setConfirm("");
      } else {
        const errMsg = data.error ?? "Failed to change password.";
        setMessage({ text: errMsg, ok: false });
        toast({ message: errMsg, type: "error" });
      }
    } catch {
      const errMsg = "Network error while updating password.";
      setMessage({ text: errMsg, ok: false });
      toast({ message: errMsg, type: "error" });
    } finally {
      setIsPending(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <SettingsSection
          title={
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-theme-primary" />
              <span>Change password</span>
            </span>
          }
          description="Keep your account secure by using a strong password of at least 8 characters."
          footer={
            <Button
              disabled={isPending || tooShort || mismatch || !current || !newPass || !confirm}
              size="sm"
              type="submit"
            >
              {isPending ? "Updating..." : "Update password"}
            </Button>
          }
        >
          <SettingsRow
            label="Current password"
            description="Enter your existing password to verify your identity."
            htmlFor="current-password"
          >
            <PasswordInput
              id="current-password"
              value={current}
              onChange={setCurrent}
              placeholder="Your current password"
            />
          </SettingsRow>

          <SettingsRow
            label="New password"
            description="At least 8 characters with mixed case, numbers, or symbols."
            htmlFor="new-password"
          >
            <div className="w-full sm:w-80">
              <PasswordInput
                id="new-password"
                value={newPass}
                onChange={setNewPass}
                placeholder="At least 8 characters"
              />
              {newPass ? <StrengthBar password={newPass} /> : null}
              {tooShort ? (
                <p className="mt-1 text-xs text-theme-danger">
                  Password must be at least 8 characters.
                </p>
              ) : null}
            </div>
          </SettingsRow>

          <SettingsRow
            label="Confirm new password"
            description="Re-enter your new password to confirm."
            htmlFor="confirm-password"
          >
            <div className="w-full sm:w-80 space-y-1.5">
              <PasswordInput
                id="confirm-password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Re-enter new password"
              />
              {mismatch ? (
                <p className="text-xs text-theme-danger">Passwords don&apos;t match.</p>
              ) : null}
            </div>
          </SettingsRow>

          {message ? (
            <div className="px-4 py-3">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                  message.ok
                    ? "border-theme-success-border bg-theme-success-surface text-theme-success"
                    : "border-theme-danger-border bg-theme-danger-surface text-theme-danger"
                )}
              >
                {message.ok ? <ShieldCheck className="h-4 w-4 shrink-0" /> : null}
                <span>{message.text}</span>
              </div>
            </div>
          ) : null}
        </SettingsSection>
      </form>

      <ConfirmModal
        open={confirmOpen}
        title="Update password?"
        message="Your account password will be changed immediately. Make sure you remember your new password."
        confirmLabel="Update password"
        loadingLabel="Updating..."
        isLoading={isPending}
        onConfirm={() => void handleConfirmChange()}
        onClose={() => {
          if (!isPending) setConfirmOpen(false);
        }}
      />
    </>
  );
}
