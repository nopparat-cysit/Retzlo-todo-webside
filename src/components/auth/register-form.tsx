"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
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
      setError("The melodies must match. Please confirm your password.");
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
      setError(data.error ?? "The ink didn't take. Please try again.");
      setIsPending(false);
      return;
    }

    await signIn("credentials", { email, identifier: email, password, redirect: false });
    router.push(searchParams.get("callbackUrl") ?? "/select-module");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-dusk-cyan/90 text-xs tracking-widest">YOUR NAME</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="Quiet dreamer" 
          className="lofi-panel border-white/10 bg-white/[0.04] focus:border-dusk-lavender/60 text-[#f5efe6]" 
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-dusk-cyan/90 text-xs tracking-widest">USERNAME</Label>
        <Input 
          id="username" 
          name="username" 
          placeholder="lofi_observer" 
          required 
          className="lofi-panel border-white/10 bg-white/[0.04] focus:border-dusk-lavender/60 text-[#f5efe6]" 
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-dusk-cyan/90 text-xs tracking-widest">EMAIL</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="you@retzlo.space" 
          required 
          className="lofi-panel border-white/10 bg-white/[0.04] focus:border-dusk-lavender/60 text-[#f5efe6]" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-dusk-cyan/90 text-xs tracking-widest">PASSWORD</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            minLength={8}
            placeholder="••••••••" 
            required 
            className="lofi-panel border-white/10 bg-white/[0.04] focus:border-dusk-lavender/60 text-[#f5efe6]" 
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-dusk-cyan/90 text-xs tracking-widest">CONFIRM</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            minLength={8}
            placeholder="••••••••" 
            required 
            className="lofi-panel border-white/10 bg-white/[0.04] focus:border-dusk-lavender/60 text-[#f5efe6]" 
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-dusk-rose/90 bg-ink-900/50 border border-dusk-rose/20 p-3 rounded-xl text-center">
          {error}
        </p>
      ) : null}

      <Button 
        className="w-full h-12 text-base font-medium motion-interactive bg-dusk-lavender hover:bg-dusk-amber text-ink-950 shadow-glow" 
        disabled={isPending}
      >
        {isPending ? "Lighting the lantern..." : "Begin your archive"}
      </Button>
    </form>
  );
}
