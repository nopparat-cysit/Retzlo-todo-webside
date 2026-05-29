"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function CreateProjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description")
      })
    });
    const data = (await response.json()) as { project?: { id: string }; error?: string };

    setIsPending(false);

    if (!response.ok || !data.project) {
      setError(data.error ?? "Could not create project.");
      return;
    }

    router.push(`/project/${data.project.id}/board`);
    router.refresh();
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input name="name" placeholder="Project name" required />
      <Textarea name="description" placeholder="Description" />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button disabled={isPending}>{isPending ? "Creating..." : "New Project"}</Button>
    </form>
  );
}
