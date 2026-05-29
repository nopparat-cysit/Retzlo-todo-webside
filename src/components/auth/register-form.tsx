"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
        name: formData.get("name")
      })
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Could not create account.");
      setIsPending(false);
      return;
    }

    await signIn("credentials", { email, identifier: email, password, redirect: false });
    router.push(searchParams.get("callbackUrl") ?? "/projects");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input name="name" placeholder="Name" />
      <Input name="username" placeholder="Username" required />
      <Input name="email" type="email" placeholder="you@example.com" required />
      <Input name="password" type="password" minLength={8} placeholder="Password" required />
      <Input
        name="confirmPassword"
        type="password"
        minLength={8}
        placeholder="Confirm password"
        required
      />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
