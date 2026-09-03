"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRememberedAccount, setRememberedAccount } from "@/lib/auth/remember-account";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        router.replace(searchParams.get("callbackUrl") ?? "/select-module");
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
      setError("The quiet night holds many paths. Try again with your details.");
      return;
    }

    setRememberedAccount(window.localStorage, submittedIdentifier, rememberAccount);

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl ?? "/select-module");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="identifier" className="text-dusk-cyan/90 text-xs tracking-widest">IDENTIFIER</Label>
        <Input
          id="identifier"
          name="email"
          type="text"
          placeholder="yourname or you@email.com"
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="lofi-panel border-white/10 bg-white/[0.04] focus:border-dusk-lavender/60 text-[#f5efe6]"
        />
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-dusk-cyan/90 text-xs tracking-widest">PASSWORD</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          placeholder="password" 
          required 
          className="lofi-panel border-white/10 bg-white/[0.04] focus:border-dusk-lavender/60 text-[#f5efe6]"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#f5efe6]/70 cursor-pointer hover:text-[#f5efe6] transition-colors">
        <input
          className="h-4 w-4 accent-dusk-lavender rounded-sm"
          type="checkbox"
          checked={rememberAccount}
          onChange={(event) => setRememberAccount(event.target.checked)}
        />
        Remember me in this cozy corner
      </label>

      {error ? (
        <p className="text-sm text-dusk-rose/90 bg-ink-900/50 border border-dusk-rose/20 p-3 rounded-xl text-center">
          {error}
        </p>
      ) : null}

      <Button 
        className="w-full h-12 text-base font-medium motion-interactive bg-dusk-lavender hover:bg-dusk-amber text-ink-950 shadow-glow" 
        disabled={isPending}
      >
        {isPending ? "Walking the path..." : "Enter the workspace"}
      </Button>
    </form>
  );
}
