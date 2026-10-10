"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ArrowRight, Mail } from "lucide-react";
import { MixtapeField } from "./mixtape-field";
import styles from "./login-scene.module.css";
import { useToast } from "@/components/ui/toast";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    setIsPending(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not send OTP.");
      toast({ type: "error", message: data.error ?? "Could not send OTP." });
      return;
    }

    toast({ type: "success", message: "Check your email for the recovery code." });
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <MixtapeField id="recovery-email" name="email" label="Email address" icon={Mail} type="email" placeholder="you@example.com" autoComplete="email" required />
      <p className={styles.fieldHint}>Use the email address linked to your Retzlo account.</p>
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.submit} disabled={isPending} aria-busy={isPending}>
        {isPending ? "Sending code..." : <>Send recovery code <ArrowRight size={16} /></>}
      </button>
    </form>
  );
}