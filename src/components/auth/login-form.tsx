"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import styles from "./login-scene.module.css";


import { getRememberedAccount, setRememberedAccount } from "@/lib/auth/remember-account";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [rememberAccount, setRememberAccount] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function redirectExistingSession() {
      const session = await getSession().catch(() => null);

      if (!isMounted) return;

      if (session?.user?.id) {
        router.replace(searchParams.get("callbackUrl") ?? "/projects");
        router.refresh();
      }
    }

    void redirectExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  useEffect(() => {
    const rememberedEmail = getRememberedAccount(window.localStorage);

    if (rememberedEmail) {
      setIdentifier(rememberedEmail);
      setRememberAccount(true);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const submittedIdentifier = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signIn("credentials", {
      email: submittedIdentifier,
      identifier: submittedIdentifier,
      password,
      redirect: false
    }).catch(() => null);

    setIsPending(false);

    if (!result || result.error) {
      setError("Unable to sign in. Check your username or email and password, then try again.");
      return;
    }

    setRememberedAccount(window.localStorage, submittedIdentifier, rememberAccount);
    const callbackUrl = searchParams.get("callbackUrl");
    const destination = callbackUrl ?? "/projects";
    router.push(destination);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="identifier" className={styles.label}>Username or email</label>
        <div className={styles.inputWrap}>
          <UserRound size={16} aria-hidden="true" />
          <input id="identifier" name="email" type="text" placeholder="yourname or you@email.com" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={identifier} onChange={(event) => setIdentifier(event.target.value)} className={styles.input} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <div className={styles.inputWrap}>
          <LockKeyhole size={16} aria-hidden="true" />
          <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Your password" autoComplete="current-password" required className={styles.input} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} />
          <button type="button" className={styles.reveal} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
      </div>
      <div className={styles.options}>
        <label className={styles.remember}><input type="checkbox" checked={rememberAccount} onChange={(event) => setRememberAccount(event.target.checked)} />Remember me</label>
        <Link href="/forgot-password" className={styles.forgot}>Forgot password?</Link>
      </div>
      {error ? <p id="login-error" role="alert" className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.submit} disabled={isPending} aria-busy={isPending}>
        {isPending ? <><Loader2 size={16} className={styles.spinning} /> Signing in...</> : <>Sign in <ArrowRight size={16} /></>}
      </button>
    </form>
  );
}