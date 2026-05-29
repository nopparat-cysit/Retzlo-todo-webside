"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type InviteState =
  | { status: "idle" | "loading" }
  | { status: "accepted"; projectId: string }
  | { status: "account"; email: string; projectName: string }
  | { status: "error"; message: string };

export function AcceptInvitation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<InviteState>({ status: "idle" });

  useEffect(() => {
    async function accept() {
      if (!token) {
        setState({ status: "error", message: "This invitation is invalid or expired." });
        return;
      }

      setState({ status: "loading" });
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = (await response.json()) as {
        accepted?: boolean;
        projectId?: string;
        accountRequired?: boolean;
        email?: string;
        projectName?: string;
        error?: string;
      };

      if (data.accepted && data.projectId) {
        setState({ status: "accepted", projectId: data.projectId });
        router.push(`/project/${data.projectId}/board`);
        return;
      }

      if (data.accountRequired && data.email && data.projectName) {
        setState({ status: "account", email: data.email, projectName: data.projectName });
        return;
      }

      setState({ status: "error", message: data.error ?? "This invitation is invalid or expired." });
    }

    void accept();
  }, [router, token]);

  if (state.status === "loading" || state.status === "idle") {
    return <p className="text-sm text-stone-400">Checking invitation...</p>;
  }

  if (state.status === "accepted") {
    return <p className="text-sm text-dusk-cyan">Invitation accepted. Opening project...</p>;
  }

  if (state.status === "account") {
    const callbackUrl = `/accept-invitation?token=${token}`;

    return (
      <div className="space-y-4">
        <p className="text-sm text-stone-300">
          {state.projectName} invited {state.email}. Sign in or create an account with that email.
        </p>
        <div className="flex gap-3">
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button>Sign in</Button>
          </Link>
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button variant="ghost">Create account</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return <p className="text-sm text-red-300">{state.message}</p>;
  }

  return null;
}
