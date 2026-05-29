import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Panel, PageShell } from "@/components/ui/panel";

export default function LoginPage() {
  return (
    <PageShell className="grid max-w-lg items-center">
      <Panel className="p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">RETROD</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-400">Pick up where the board left off.</p>
        </div>
        <Suspense fallback={<p className="text-sm text-stone-400">Loading sign in...</p>}>
        <LoginForm />
        </Suspense>
        <p className="mt-4 text-sm text-stone-400">
          Forgot password?{" "}
          <Link className="text-dusk-lavender" href="/forgot-password">
            Send OTP
          </Link>
        </p>
        <p className="mt-5 text-sm text-stone-400">
          No account?{" "}
          <Link className="text-dusk-lavender" href="/register">
            Create account
          </Link>
        </p>
      </Panel>
    </PageShell>
  );
}
