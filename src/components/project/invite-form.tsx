"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteForm({ projectId }: { projectId: string }) {
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAcceptUrl(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/projects/${projectId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email") })
    });
    const data = (await response.json()) as { acceptUrl?: string; error?: string };

    if (!response.ok || !data.acceptUrl) {
      setError(data.error ?? "Could not create invitation.");
      return;
    }

    setAcceptUrl(`${window.location.origin}${data.acceptUrl}`);
    event.currentTarget.reset();
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input name="email" type="email" placeholder="teammate@example.com" required />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {acceptUrl ? (
        <div className="rounded-md border border-dusk-cyan/20 bg-dusk-cyan/10 p-3 text-sm text-stone-200">
          <p className="mb-2 text-dusk-cyan">Invitation created.</p>
          <p className="break-all text-stone-300">{acceptUrl}</p>
        </div>
      ) : null}
      <Button>Invite member</Button>
    </form>
  );
}
