"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Step = "verify" | "reset" | "done";

export function ResetPasswordForm({ email }: { email: string }) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("verify");
  const [emailValue, setEmailValue] = useState(email);
  const [otpValue, setOtpValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    const response = await fetch("/api/auth/verify-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailValue,
        otp: otpValue
      })
    });

    setIsPending(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      const errMsg = data.error ?? "OTP is invalid or expired.";
      setError(errMsg);
      toast({ message: errMsg, type: "error" });
      return;
    }

    setStep("reset");
    const okMsg = "OTP verified. Create your new password.";
    setMessage(okMsg);
    toast({ message: okMsg, type: "success" });
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailValue,
        otp: otpValue,
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword")
      })
    });

    setIsPending(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      const errMsg = data.error ?? "Could not reset password.";
      setError(errMsg);
      toast({ message: errMsg, type: "error" });
      return;
    }

    setStep("done");
    const okMsg = "Password reset. You can sign in now.";
    setMessage(okMsg);
    toast({ message: okMsg, type: "success" });
  }

  if (step === "done") {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-theme-success-border bg-theme-success-surface p-3 text-sm text-theme-success">{message}</p>
        <Link
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-dusk-lavender px-4 text-sm font-medium text-ink-950 shadow-glow transition hover:bg-dusk-amber"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <form className="space-y-4" onSubmit={resetPassword}>
        <div className="rounded-md border border-theme-info-border bg-theme-info-surface p-3 text-sm text-theme-info">
          OTP verified for {emailValue}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-theme-foreground">
            New Password
          </label>
          <Input id="password" name="password" type="password" minLength={8} placeholder="New password" required />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-theme-foreground">
            Confirm Password
          </label>
          <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} placeholder="Confirm new password" required />
        </div>
        {error ? <p className="text-sm text-theme-danger">{error}</p> : null}
        {message ? <p className="text-sm text-theme-info">{message}</p> : null}
        <Button className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : "Create new password"}
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={verifyOtp}>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-theme-foreground">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={emailValue}
          onChange={(event) => setEmailValue(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="otp" className="text-xs font-medium text-theme-foreground">
          6-digit OTP
        </label>
        <Input
          id="otp"
          name="otp"
          inputMode="numeric"
          maxLength={6}
          value={otpValue}
          onChange={(event) => setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit OTP"
          required
        />
      </div>
      {error ? <p className="text-sm text-theme-danger">{error}</p> : null}
      <Button className="w-full" disabled={isPending || otpValue.length !== 6}>
        {isPending ? "Verifying..." : "Verify OTP"}
      </Button>
    </form>
  );
}
