"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "verify" | "reset" | "done";

export function ResetPasswordForm({ email }: { email: string }) {
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
      setError(data.error ?? "OTP is invalid or expired.");
      return;
    }

    setStep("reset");
    setMessage("OTP verified. Create your new password.");
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
      setError(data.error ?? "Could not reset password.");
      return;
    }

    setStep("done");
    setMessage("Password reset. You can sign in now.");
  }

  if (step === "done") {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-dusk-cyan/30 bg-dusk-cyan/10 p-3 text-sm text-dusk-cyan">{message}</p>
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
        <div className="rounded-md border border-dusk-cyan/30 bg-dusk-cyan/10 p-3 text-sm text-dusk-cyan">
          OTP verified for {emailValue}
        </div>
        <Input name="password" type="password" minLength={8} placeholder="New password" required />
        <Input name="confirmPassword" type="password" minLength={8} placeholder="Confirm new password" required />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-dusk-cyan">{message}</p> : null}
        <Button className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : "Create new password"}
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={verifyOtp}>
      <Input
        name="email"
        type="email"
        value={emailValue}
        onChange={(event) => setEmailValue(event.target.value)}
        placeholder="you@example.com"
        required
      />
      <Input
        name="otp"
        inputMode="numeric"
        maxLength={6}
        value={otpValue}
        onChange={(event) => setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="6-digit OTP"
        required
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button className="w-full" disabled={isPending || otpValue.length !== 6}>
        {isPending ? "Verifying..." : "Verify OTP"}
      </Button>
    </form>
  );
}
