"use client";

import { ArrowRight, AtSign, LockKeyhole, Mail, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { MixtapeField } from "./mixtape-field";
import styles from "./login-scene.module.css";
import { useToast } from "@/components/ui/toast";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));
    const name = String(formData.get("name"));

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check both fields.");
      toast({ type: "error", message: "Please check your registration details." });
      setIsPending(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        password,
        confirmPassword,
        name
      })
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not create your account. Please try again.");
      toast({ type: "error", message: "Please check your registration details." });
      setIsPending(false);
      return;
    }

    await signIn("credentials", { email, identifier: email, password, redirect: false });
    toast({ type: "success", message: "Your account is ready. Welcome to Retzlo!" });
    const destination = searchParams.get("callbackUrl") ?? "/projects";
    router.push(destination);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldRow}>
        <MixtapeField id="name" name="name" label="Your name" icon={UserRound} placeholder="Your name" autoComplete="name" />
        <MixtapeField id="username" name="username" label="Username" icon={AtSign} placeholder="yourname" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
      </div>
      <MixtapeField id="email" name="email" label="Email address" icon={Mail} type="email" placeholder="you@example.com" autoComplete="email" required />
      <MixtapeField id="password" name="password" label="Password" icon={LockKeyhole} type="password" minLength={8} placeholder="At least 8 characters" autoComplete="new-password" required />
      <MixtapeField id="confirmPassword" name="confirmPassword" label="Confirm password" icon={LockKeyhole} type="password" minLength={8} placeholder="Re-enter your password" autoComplete="new-password" required />
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.submit} disabled={isPending} aria-busy={isPending}>
        {isPending ? "Creating your account..." : <>Create account <ArrowRight size={16} /></>}
      </button>
    </form>
  );
}