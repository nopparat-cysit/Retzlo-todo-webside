"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRememberedAccount, setRememberedAccount } from "@/lib/auth/remember-account";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [rememberAccount, setRememberAccount] = useState(false);

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
    const password = formData.get("password");
    const result = await signIn("credentials", {
      email: submittedIdentifier,
      identifier: submittedIdentifier,
      password,
      redirect: false
    }).catch(() => null);

    setIsPending(false);

    if (!result || result.error) {
      setError("Email, username, or password is not right.");
      return;
    }

    setRememberedAccount(window.localStorage, submittedIdentifier, rememberAccount);

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl ?? "/select-module");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        name="email"
        type="text"
        placeholder="Email or username"
        required
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
      />
      <Input name="password" type="password" placeholder="Password" required />
      <label className="flex items-center gap-2 text-sm text-stone-300">
        <input
          className="h-4 w-4 accent-dusk-lavender"
          type="checkbox"
          checked={rememberAccount}
          onChange={(event) => setRememberAccount(event.target.checked)}
        />
        Remember account
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button className="w-full" disabled={isPending}>
        {isPending ? "Entering..." : "Sign in"}
      </Button>
    </form>
  );
}
