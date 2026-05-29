import Link from "next/link";
import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import { Panel, PageShell } from "@/components/ui/panel";

export default function RegisterPage() {
  return (
    <PageShell className="grid max-w-lg items-center">
      <Panel className="p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">RETROD</p>
          <h1 className="mt-2 text-3xl font-semibold">Create your workspace</h1>
          <p className="mt-2 text-sm text-stone-400">
            Start with one project. Let the system grow around it.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-stone-400">Loading account form...</p>}>
          <RegisterForm />
        </Suspense>
        <p className="mt-5 text-sm text-stone-400">
          Already have an account?{" "}
          <Link className="text-dusk-lavender" href="/login">
            Sign in
          </Link>
        </p>
      </Panel>
    </PageShell>
  );
}
