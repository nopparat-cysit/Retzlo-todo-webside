"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function SettingsForm({
  project
}: {
  project: { id: string; name: string; description: string | null };
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description")
      })
    });

    setMessage(response.ok ? "Saved." : "Could not save changes.");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm text-stone-300">
        <span>Project name</span>
        <Input name="name" defaultValue={project.name} required />
      </label>
      <label className="block space-y-2 text-sm text-stone-300">
        <span>Description</span>
        <Textarea name="description" defaultValue={project.description ?? ""} />
      </label>
      {message ? <p className="text-sm text-dusk-cyan">{message}</p> : null}
      <Button>Save changes</Button>
    </form>
  );
}
