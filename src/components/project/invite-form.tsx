"use client";

import { FormEvent, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function InviteForm({ projectId }: { projectId: string }) {
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAcceptUrl(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch(`/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });
      const data = (await response.json()) as { acceptUrl?: string; error?: string };

      if (!response.ok || !data.acceptUrl) {
        const errorMsg = data.error ?? "Could not create invitation.";
        setError(errorMsg);
        toast({ message: errorMsg, type: "error" });
        return;
      }

      setAcceptUrl(`${window.location.origin}${data.acceptUrl}`);
      toast({ message: "Invitation link generated successfully!", type: "success" });
      form.reset();
    } catch {
      setError("Failed to create invitation.");
      toast({ message: "Failed to create invitation.", type: "error" });
    }
  }

  async function handleCopy() {
    if (!acceptUrl) return;
    try {
      await navigator.clipboard.writeText(acceptUrl);
      setCopied(true);
      toast({ message: "Invitation link copied to clipboard!", type: "info" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ message: "Failed to copy link to clipboard.", type: "error" });
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input name="email" type="email" placeholder="teammate@example.com" required />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {acceptUrl ? (
        <div className="space-y-2 rounded-md border border-dusk-cyan/20 bg-dusk-cyan/10 p-3 text-sm text-stone-200">
          <p className="font-medium text-dusk-cyan">Invitation created</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={acceptUrl}
              className="flex-1 rounded border border-white/10 bg-ink-950/60 px-2 py-1.5 font-mono text-xs text-stone-300 outline-none"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-dusk-cyan" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
      <Button type="submit">Invite member</Button>
    </form>
  );
}

